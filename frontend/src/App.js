import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [playlistId, setPlaylistId] = useState('');
  const [outliers, setOutliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  // In development, backend is at localhost:3000; in production, use relative URL.
  const backendUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '';

  // On initial load: extract access token (if present) and clean URL.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('access_token');
    if (token) {
      localStorage.setItem('access_token', token);
      window.history.replaceState({}, document.title, '/');
    }
  }, []);

  // If an access token exists, fetch the Spotify user profile.
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      fetch('https://api.spotify.com/v1/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((response) => {
          if (!response.ok) throw new Error('Failed to fetch profile');
          return response.json();
        })
        .then((data) => setUser(data))
        .catch((err) => {
          console.error(err);
          setError('Failed to fetch user profile.');
        });
    }
  }, []);

  // Handle analyzing a playlist (only available when logged in)
  const handleAnalyze = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setOutliers([]);

    const trimmedInput = playlistId.trim();
    if (!trimmedInput) {
      setError('Please enter a valid playlist URL or ID.');
      setLoading(false);
      return;
    }

    let id = trimmedInput;
    if (trimmedInput.includes('playlist/')) {
      const parts = trimmedInput.split('playlist/');
      id = parts[1].split('?')[0];
      console.log(`Extracted playlist ID: ${id}`);
    }

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`/api/playlist/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Error fetching playlist data');
      }
      const data = await response.json();
      setOutliers(data.outliers || []);
    } catch (err) {
      console.error(err);
      setError('Failed to analyze the playlist. Please try again.');
    }
    setLoading(false);
  };

  // When clicked, always go to the backend login endpoint.
  const handleLogin = () => {
    console.log('Login button clicked');
    window.location.href = `${backendUrl}/api/auth/login`;
  };

  // Logout: clear the access token and reset state so the UI shows only the login button.
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
    setPlaylistId('');
    setOutliers([]);
    setError('');
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Vibe Analyzer</h1>
        <p>Discover which songs in your playlist don't fit the vibe.</p>
        {user && (
          <div className="user-info">
            {user.images && user.images.length > 0 && (
              <img
                src={user.images[0].url}
                alt="Profile"
                className="profile-pic"
                style={{ width: '50px', borderRadius: '50%' }}
              />
            )}
            <p>Logged in as {user.display_name}</p>
          </div>
        )}
      </header>
      <div className="App-content">
        {!user ? (
          // When not logged in, show only the login button.
          <button onClick={handleLogin} className="login-button">
            Login with Spotify
          </button>
        ) : (
          <>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
            {/* Display playlist functionality only for logged in users */}
            <form onSubmit={handleAnalyze} className="playlist-form">
              <input
                type="text"
                placeholder="Enter Spotify Playlist URL or ID"
                value={playlistId}
                onChange={(e) => setPlaylistId(e.target.value)}
              />
              <button type="submit" disabled={loading}>
                {loading ? 'Analyzing...' : 'Analyze Playlist'}
              </button>
            </form>
            {error && <p className="error-message">{error}</p>}
            {outliers.length > 0 && (
              <div className="results">
                <h2>Outlier Tracks</h2>
                <ul>
                  {outliers.map((track, index) => (
                    <li key={index}>
                      <p>
                        <strong>{track.name}</strong> by{' '}
                        {track.artists && track.artists.join(', ')}
                      </p>
                      <p>
                        Danceability: {track.danceability}, Energy: {track.energy},
                        Valence: {track.valence}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;

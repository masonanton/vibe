import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [playlistId, setPlaylistId] = useState('');
  const [outliers, setOutliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Clear the access token on page load
  useEffect(() => {
    localStorage.removeItem('access_token');
  }, []);

  // Extract the access token from the URL and store it in localStorage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('access_token');
    if (accessToken) {
      localStorage.setItem('access_token', accessToken);
      // Remove the access token from the URL to clean it up
      window.history.replaceState({}, document.title, '/');
    }
  }, []);

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
      console.log(`Extracted playlist ID: ${id}`); // Log the extracted playlist ID for debugging
    }

    try {
      const accessToken = localStorage.getItem('access_token');
      const response = await fetch(`/api/playlist/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
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

  const handleLogin = () => {
    console.log('Login button clicked');
    window.location.href = '/api/auth/login';
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    window.location.reload();
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Vibe Analyzer</h1>
        <p>Discover which songs in your playlist don't fit the vibe.</p>
      </header>
      <div className="App-content">
        <button onClick={handleLogin} className="login-button">
          Login with Spotify
        </button>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
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
                    <strong>{track.name}</strong> by {track.artists && track.artists.join(', ')}
                  </p>
                  <p>
                    Danceability: {track.danceability}, Energy: {track.energy}, Valence: {track.valence}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

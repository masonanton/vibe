import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [playlistId, setPlaylistId] = useState('');
  const [outliers, setOutliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  const backendUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '';

  const refreshAccessToken = async () => {
    const refresh_token = localStorage.getItem('refresh_token');
    if (!refresh_token) return null;
    try {
      const response = await fetch(`${backendUrl}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token }),
      });
      if (!response.ok) throw new Error('Token refresh failed');
      const data = await response.json();
      localStorage.setItem('access_token', data.access_token);
      if (data.expires_in) {
        const expirationTime = Date.now() + parseInt(data.expires_in) * 1000;
        localStorage.setItem('token_expiration', expirationTime);
      }
      return data.access_token;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    const expiresIn = params.get('expires_in');
    if (accessToken) {
      localStorage.setItem('access_token', accessToken);
      if (refreshToken) {
        localStorage.setItem('refresh_token', refreshToken);
      }
      if (expiresIn) {
        const expirationTime = Date.now() + parseInt(expiresIn) * 1000;
        localStorage.setItem('token_expiration', expirationTime);
      }
      window.history.replaceState({}, document.title, '/');
    }
  }, []);

  useEffect(() => {
    const initializeUser = async () => {
      const token = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');
      const expiration = localStorage.getItem('token_expiration');

      if (token && refreshToken && expiration) {
        const now = Date.now();
        if (now > parseInt(expiration)) {
          console.log('🔁 Token expired. Refreshing...');
          const newToken = await refreshAccessToken();
          if (!newToken) {
            console.warn('❌ Token refresh failed. Logging out.');
            handleLogout();
            return;
          }
        }
      }

      const finalToken = localStorage.getItem('access_token');
      if (finalToken) {
        fetch('https://api.spotify.com/v1/me', {
          headers: { Authorization: `Bearer ${finalToken}` },
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
    };

    initializeUser();
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
      console.log(`Extracted playlist ID: ${id}`);
    }

    try {
      let token = localStorage.getItem('access_token');
      console.log(token);
      let response = await fetch(`/api/playlist/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        console.log('Access token expired or invalid, attempting to refresh token');
        token = await refreshAccessToken();
        if (token) {
          console.log(`Retrying fetch with new token: ${token}`);
          response = await fetch(`/api/playlist/${id}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });
        }
      }

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
    window.location.href = `${backendUrl}/api/auth/login`;
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token_expiration');
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
          <button onClick={handleLogin} className="login-button">
            Login with Spotify
          </button>
        ) : (
          <>
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

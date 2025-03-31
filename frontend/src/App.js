import React, { useState } from 'react';
import './App.css';

function App() {
  const [playlistId, setPlaylistId] = useState('');
  const [outliers, setOutliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setOutliers([]);

    // Clean the input: if it's a URL, extract the playlist ID
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
    }

    try {
      // Call your backend endpoint to get playlist outliers
      const response = await fetch(`/api/playlist/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Pass along authorization headers if needed
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
    // Redirect to the backend's Spotify auth login route
    window.location.href = '/api/auth/login';
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

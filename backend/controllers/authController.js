const path = require('path');
// Explicitly load the .env file from the backend folder
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const axios = require('axios'); // Import axios for making HTTP requests
const clientId = process.env.SPOTIFY_CLIENT_ID; // Get the client ID from environment variables
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET; // Get the client secret from environment variables
const redirectUri = process.env.SPOTIFY_REDIRECT_URI; // Get the redirect URI from environment variables
const frontendUrl = process.env.FRONTEND_URL; // Get the frontend URL from environment variables

// Debug log to ensure env values are loaded
console.log('Client ID:', process.env.SPOTIFY_CLIENT_ID);
console.log('Redirect URI:', process.env.SPOTIFY_REDIRECT_URI);
console.log('Frontend URL:', process.env.FRONTEND_URL);

// Redirect the user to Spotify for authentication
exports.login = (req, res) => {
    const scope = 'playlist-read-private'; // Define the scope for the Spotify API

    // Construct the Spotify authorization URL with the necessary parameters
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;
    console.log('Redirecting to Spotify login...', authUrl);
    res.redirect(authUrl);
};

// Handle the callback from Spotify after user authentication
exports.callback = async (req, res) => {
    const code = req.query.code;

    try {
        const response = await axios.post(
            'https://accounts.spotify.com/api/token',
            new URLSearchParams({
                code,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code',
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
                },
            }
        );

        const { access_token, refresh_token, expires_in } = response.data;
        // Redirect to the frontend with access_token, refresh_token, and expires_in in query params
        res.redirect(`${frontendUrl}/?access_token=${access_token}&refresh_token=${refresh_token}&expires_in=${expires_in}`);
    } catch (err) {
        console.error('Error during Spotify authentication:', err);
        res.status(500).json({ error: 'Authentication failed', message: err.message });
    }
};

exports.refresh = async (req, res) => {
    const { refresh_token } = req.body;
    if (!refresh_token) {
        return res.status(400).json({ error: 'Refresh token is missing.' });
    }
    try {
        const response = await axios.post(
            'https://accounts.spotify.com/api/token',
            new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token,
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
                },
            }
        );
        const { access_token, expires_in } = response.data;
        res.json({ access_token, expires_in });
    } catch (err) {
        console.error('Error refreshing token:', err.response?.data || err.message);
        res.status(500).json({ error: 'Token refresh failed', message: err.message });
    }
};
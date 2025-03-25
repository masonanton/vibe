const axios = require('axios'); // Import axios for making HTTP requests
const clientId = process.env.SPOTIFY_CLIENT_ID; // Get the client ID from environment variables
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET; // Get the client secret from environment variables
const redirectUri = process.env.SPOTIFY_REDIRECT_URI; // Get the redirect URI from environment variables

// Redirect the user to Spotify for authentication
exports.login = (req, res) => {
    const scope = 'playlist-read-private'; // Define the scope for the Spotify API

    // Construct the Spotify authorization URL with the necessary parameters
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;
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
                    Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`, // Basic auth for client credentials
                }
            }
        );
        res.json(response.data); // Send the response back to the client with the access and refresh tokens
    } catch (err) {
        console.error('Error during Spotify authentication:', err); // Log any errors that occur during authentication
        res.status(500).json({ error: 'Authentication failed', message: err.message }); // Send a 500 response with the error message
    }
};
// This code handles the authentication process with Spotify using OAuth 2.0.
// It redirects the user to Spotify for login and handles the callback to exchange the authorization code for access and refresh tokens.    
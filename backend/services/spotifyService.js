// This file will handle the calls to Spotify's API to fetch playlist data

const axios = require('axios'); // Import axios for making HTTP requests

exports.getPlaylistData = async (playlistId, accessToken) => {
    try {
        console.log('Access token:', accessToken); // Log the access token for debugging purposes
        if (!accessToken) {
            throw new Error('Access token is required to fetch playlist data.'); // Ensure the access token is provided
        }
        const response = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}` // Set the authorization header with the access token
            }
        });
        return response.data; // Return the playlist data
    } catch (err) {
        // Log the detailed error from Spotify
        if (err.response && err.response.data) {
            console.error('Error fetching playlist data:', err.response.data);
        } else {
            console.error('Error fetching playlist data:', err.message);
        }
        throw err; // Rethrow the error to be handled by the calling function
    }
};

exports.getAudioFeaturesForPlaylist = async (playlistData, accessToken) => {
    const trackIds = playlistData.tracks.items
        .map(item => item.track && item.track.id)
        .filter(Boolean)
        .join(',');
        
    if (trackIds.length === 0) {
        return []; // Return an empty array if no track IDs are found
    }

    try {
        const response = await axios.get(`https://api.spotify.com/v1/audio-features?ids=${trackIds}`, {
            headers: {
                Authorization: `Bearer ${accessToken}` // Set the authorization header with the access token
            }
        });
        return response.data.audio_features; // Return the audio features for the tracks
    } catch (err) {
        if (err.response && err.response.data) {
            console.error('Error fetching audio features:', err.response.data);
        } else {
            console.error('Error fetching audio features:', err.message);
        }
        throw err; // Rethrow the error to be handled by the calling function
    }
};
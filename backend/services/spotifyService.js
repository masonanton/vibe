const axios = require('axios');

// Fetches metadata for a playlist by ID
exports.getPlaylistData = async (playlistId, accessToken) => {
    try {
        console.log('Access token in getPlaylistData:', accessToken);
        if (!accessToken) {
            throw new Error('Access token is required to fetch playlist data.');
        }

        const response = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        return response.data;
    } catch (err) {
        console.error('Error fetching playlist data:', err.response?.data || err.message);
        throw err;
    }
};

// Fetches audio features for all tracks in the playlist, batching by 100 (Spotify limit)
exports.getAudioFeaturesForPlaylist = async (playlistData, accessToken) => {
    const trackIds = playlistData.tracks.items
        .filter(item => item.track && item.track.id && !item.track.is_local)
        .map(item => item.track.id);

    console.log('Filtered track IDs:', trackIds);

    if (trackIds.length === 0) {
        console.warn('No valid track IDs found.');
        return [];
    }

    try {
        console.log('Access token in getAudioFeaturesForPlaylist:', accessToken);

        const audioFeatures = [];

        // Spotify API limit: 100 IDs per request
        for (let i = 0; i < trackIds.length; i += 100) {
            const batch = trackIds.slice(i, i + 100).join(',');
            const response = await axios.get(`https://api.spotify.com/v1/audio-features?ids=${batch}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });

            if (response.data.audio_features) {
                audioFeatures.push(...response.data.audio_features);
            }
        }

        return audioFeatures;
    } catch (err) {
        console.error('Error fetching audio features:', err.response?.data || err.message);
        throw err;
    }
};

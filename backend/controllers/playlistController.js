// playlistController.js
const spotifyService = require('../services/spotifyService');
const outlierDetection = require('../services/outlierDetection'); // Import the outlier detection service

exports.getPlaylistOutliers = async (req, res) => {
    const playlistId = req.params.id; // Get the playlist ID from the request parameters
    const accessToken = req.headers['authorization']?.split(' ')[1]; // Extract the access token from the request headers

    try {
        const playlistData = await spotifyService.getPlaylistData(playlistId, accessToken);
        const audioFeatures = await spotifyService.getAudioFeaturesForPlaylist(playlistData, accessToken);

        if (!audioFeatures || audioFeatures.length === 0) {
            return res.status(404).json({ error: 'No audio features found for the playlist.' });
        }
    
        const outliers = outlierDetection.findOutliers(audioFeatures); // Call the outlier detection service
    
        if (!outliers || outliers.length === 0) {
            return res.status(404).json({ error: 'No outliers found in the playlist.' });
        }
    
        res.json(outliers); // Send the outliers back to the client as a JSON response
    } catch (err) {
        console.error('Error during outlier detection:', err);
        // If the error comes from Spotify (401/403), pass that status to the client.
        const status = (err.response && (err.response.status === 401 || err.response.status === 403))
            ? err.response.status
            : 500;
        res.status(status).json({ error: 'Outlier detection failed', message: err.message });
    }
};

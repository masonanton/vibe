const spotifyService = require('../services/spotifyService');
const outlierDetection = require('../services/outlierDetection'); // Import the outlier detection service

exports.getPlaylistOutliers = async (req, res) => {
    const playlistId = req.params.id; // Get the playlist ID from the request parameters
    const accessToken = req.headers['authorization']?.split(' ')[1]; // Extract the access token from the request headers

    try {
        const playlistData = await spotifyService.getPlaylistData(playlistID, accessToken);

        const audioFeatures = await spotifyService.getAudioFeaturesForPlaylist(playlistData, accessToken);

        if (!audioFeatures || audioFeatures.length === 0) {
            return res.status(404).json({ error: 'No audio features found for the playlist.' });
        }
    
        const outliers = outlierDetection.findOutliers(audioFeatures); // Call the outlier detection service
    
        if (!outliers || outliers.length === 0) {
            return res.status(404).json({ error: 'No outliers found in the playlist.' });
        }
    
        res.json(outliers); // Send the outliers back to the client as a JSON response
    
    } catch {
        console.error('Error during outlier detection:', err); // Log any errors that occur during outlier detection
        res.status(500).json({ error: 'Outlier detection failed', message: err.message }); // Send a 500 response with the error message
    }
};
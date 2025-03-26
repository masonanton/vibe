const express = require('express');
const router = express.Router(); // Create a new router instance
const playlistController = require('../controllers/playlistController'); // Import the playlist controller

router.get('/:id', playlistController.getPlaylistOutliers); // Define the route to get a specific playlist by ID

module.exports = router; // Export the router to be used in other files
// This code defines the playlist routes for the application using Express.js.
// It imports the playlist controller and sets up a route to get a specific playlist by its ID.


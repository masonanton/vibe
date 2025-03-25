const express = require('express');
const router = express.Router(); // Create a new router instance
const authController = require('../controllers/authController'); // Import the auth controller

// Define the spotify login route
router.get('/login', authController.login);

// Define the spotify callback route
router.get('/callback', authController.callback);

module.exports = router; // Export the router to be used in other files
// This code defines the authentication routes for the application using Express.js.


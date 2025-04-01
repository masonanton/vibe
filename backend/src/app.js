const express = require('express');
const dotenv = require('dotenv');
const path = require('path'); // Import path module for serving static files
const cors = require('cors'); // Import CORS middleware to enable cross-origin resource sharing

// Import routes
const authRoutes = require('../routes/authRoutes'); // Import auth routes
const playlistRoutes = require('../routes/playlistRoutes'); // Import playlist routes

dotenv.config(); // Load environment variables from .env file

const app = express(); // Create an Express application

app.use(cors()); // Enable CORS for all routes, allowing cross-origin requests

app.use(express.json()); // Middleware to parse JSON request bodies 

// API routes
app.use('/api/auth', authRoutes); // Use auth routes for /api/auth endpoint
app.use('/api/playlist', playlistRoutes); // Use playlist routes for /api/playlists endpoint

// Serve static files from the React frontend
const frontendPath = path.join(__dirname, '../../frontend/build');
app.use(express.static(frontendPath));

// Catch-all route to serve the React app for non-API routes
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err); // Log the error stack to the console
    res.status(500).json({
        error: 'aw shucks',
        message: err.message,
    }); // Send a 500 response for any errors
});

const PORT = process.env.PORT || 3000 // Set the port from environment variable or default to 3001

// Start the server and listen on the specified port
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`); // Log the server URL to the console
});
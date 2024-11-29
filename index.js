const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const itemRoutes = require('./controllers/routes/itemRoutes'); // Make sure this path is correct
const axios = require('axios');
const path = require('path');

const app = express();
const port = process.env.PORT || 4000; // Change the port to 4000

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files
app.use(itemRoutes); // Use modularized routes

// SQLite database connection
const db = new sqlite3.Database(':memory:'); // Using in-memory database for simplicity

// Database table creation
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS breeds (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        name TEXT, 
        description TEXT, 
        image_url TEXT
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        name TEXT NOT NULL, 
        description TEXT, 
        date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
});

// Fetch cat breed data from TheCatAPI
const fetchCatBreeds = async () => {
    try {
        const response = await axios.get('https://api.thecatapi.com/v1/breeds', {
            headers: { 'x-api-key': 'YOUR_CAT_API_KEY' } // Add your Cat API key
        });

        const breeds = response.data;
        const stmt = db.prepare("INSERT INTO breeds (name, description, image_url) VALUES (?, ?, ?)");

        breeds.forEach(breed => {
            stmt.run(breed.name, breed.description, breed.image?.url || null);
        });

        stmt.finalize();
    } catch (error) {
        console.error("Error fetching cat breeds:", error);
    }
};

// Fetch breeds on server start
fetchCatBreeds();

// Routes for the index page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

module.exports = db; // Export the database connection for reuse

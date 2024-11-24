const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const axios = require('axios');
const path = require('path');

const app = express();
const port = 4000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Serve static files (like index.html)
app.use(express.static(path.join(__dirname, 'public')));

// Connect to SQLite database
const db = new sqlite3.Database(':memory:'); // Use ':memory:' for an in-memory database

// Create a table for storing cat breeds
db.serialize(() => {
    db.run("CREATE TABLE breeds (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, description TEXT, image_url TEXT)");
});

// Fetch cat breed data from TheCatAPI
const fetchCatBreeds = async () => {
    try {
        const response = await axios.get('https://api.thecatapi.com/v1/breeds', {
            headers: {
                'x-api-key': 'YOUR_CAT_API_KEY', // Replace with your actual API key from TheCatAPI
            }
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

// Fetch breeds from TheCatAPI when the server starts
fetchCatBreeds();

// GET all cat breeds
app.get('/breeds', (req, res) => {
    db.all("SELECT * FROM breeds", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Root route - Serve the index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

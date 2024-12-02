const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000; // Use environment variable for Render or fallback to 3000 locally

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// SQLite database connection
const db = new sqlite3.Database(':memory:'); // In-memory database

// Create database table for breeds
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS breeds (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        population INTEGER NOT NULL
    )`);
});

// API to get all breeds
app.get('/breeds', (req, res) => {
    db.all('SELECT * FROM breeds', [], (err, rows) => {
        if (err) {
            res.status(500).send('Error retrieving breeds');
        } else {
            res.json(rows);
        }
    });
});

// API to create a new breed
app.post('/breeds', (req, res) => {
    const { name, description, population } = req.body;
    const stmt = db.prepare('INSERT INTO breeds (name, description, population) VALUES (?, ?, ?)');
    stmt.run(name, description, population, function (err) {
        if (err) {
            res.status(500).send('Error creating breed');
        } else {
            res.status(201).json({
                id: this.lastID,
                name,
                description,
                population
            });
        }
    });
});

// Serve static files (CSS)
app.use(express.static(path.join(__dirname, 'public')));

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// SQLite database connection
const db = new sqlite3.Database(':memory:'); // In-memory for simplicity

// Create database table
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS breeds (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        population INTEGER NOT NULL
    )`);

    // Insert some initial data
    const stmt = db.prepare("INSERT INTO breeds (name, description, population) VALUES (?, ?, ?)");
    stmt.run('Siamese', 'A sociable and talkative cat breed.', 500000);
    stmt.run('Maine Coon', 'One of the largest domesticated cat breeds.', 300000);
    stmt.run('Bengal', 'A breed with a wild and exotic appearance.', 250000);
    stmt.finalize();
});

// API endpoints
app.get('/breeds', (req, res) => {
    db.all("SELECT * FROM breeds", [], (err, rows) => {
        if (err) {
            res.status(500).send('Error retrieving breeds');
        } else {
            res.json(rows);
        }
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const itemRoutes = require('./routes/itemRoutes');
const path = require('path');

const app = express();
const port = process.env.PORT || 4000;  // Changed port to 4000

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(itemRoutes);

// SQLite database connection
const db = new sqlite3.Database(':memory:'); // Using in-memory database for simplicity

// Database table creation
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        name TEXT NOT NULL, 
        description TEXT, 
        date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

module.exports = db; 

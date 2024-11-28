const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const itemRoutes = require('./routes/itemRoutes');
const axios = require('axios');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
const port = 4000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());
app.use(itemRoutes);

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

// Serve static files (like index.html)
app.use(express.static(path.join(__dirname, 'public')));

// Connect to SQLite database
const db = new sqlite3.Database(':memory:'); // Use ':memory:' for an in-memory database

// Create tables for cat breeds and items
db.serialize(() => {
    // Cat breeds table
    db.run("CREATE TABLE IF NOT EXISTS breeds (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, description TEXT, image_url TEXT)");
    
    // Items table
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

// CRUD Endpoints for Items Table

// GET all items
app.get('/items', (req, res) => {
    db.all("SELECT * FROM items", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// POST a new item
app.post('/items', (req, res) => {
    const { name, description } = req.body;
    if (!name) {
        return res.status(400).json({ error: "Name is required" });
    }
    const sql = "INSERT INTO items (name, description) VALUES (?, ?)";
    db.run(sql, [name, description || null], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ id: this.lastID, name, description });
    });
});

// PUT update an item
app.put('/items/:id', (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    if (!name) {
        return res.status(400).json({ error: "Name is required" });
    }
    const sql = "UPDATE items SET name = ?, description = ? WHERE id = ?";
    db.run(sql, [name, description, id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: "Item updated successfully", changes: this.changes });
    });
});

// PATCH partially update an item
app.patch('/items/:id', (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    const fields = Object.keys(updates);
    const values = Object.values(updates);

    if (fields.length === 0) {
        return res.status(400).json({ error: "No fields provided for update" });
    }

    const setClause = fields.map(field => `${field} = ?`).join(", ");
    const sql = `UPDATE items SET ${setClause} WHERE id = ?`;

    db.run(sql, [...values, id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: "Item partially updated", changes: this.changes });
    });
});

// DELETE an item
app.delete('/items/:id', (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM items WHERE id = ?";
    db.run(sql, id, function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: "Item deleted successfully", changes: this.changes });
    });
});

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

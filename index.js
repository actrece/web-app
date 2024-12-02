const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Persistent SQLite database
const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
    }
});

// Create table to store breed information
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS breeds (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            origin TEXT NOT NULL,
            image_url TEXT NOT NULL
        )
    `);
});

// Route to serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint to get all breeds
app.get('/breeds', (req, res) => {
    db.all('SELECT * FROM breeds', [], (err, rows) => {
        if (err) {
            res.status(500).send('Error retrieving breeds');
        } else {
            res.json(rows);
        }
    });
});

// API endpoint to add a new breed
app.post('/breeds', (req, res) => {
    const { name, description, origin, image_url } = req.body;

    if (!name || !origin || !image_url) {
        return res.status(400).send('Name, origin, and image_url are required.');
    }

    const stmt = db.prepare('INSERT INTO breeds (name, description, origin, image_url) VALUES (?, ?, ?, ?)');
    stmt.run(name, description || '', origin, image_url, function (err) {
        if (err) {
            res.status(500).send('Error adding breed');
        } else {
            res.status(201).json({
                id: this.lastID,
                name,
                description,
                origin,
                image_url
            });
        }
    });
});

// API endpoint to update an existing breed (full update)
app.put('/breeds/:id', (req, res) => {
    const { id } = req.params;
    const { name, description, origin, image_url } = req.body;

    if (!name || !origin || !image_url) {
        return res.status(400).send('Name, origin, and image_url are required.');
    }

    const stmt = db.prepare('UPDATE breeds SET name = ?, description = ?, origin = ?, image_url = ? WHERE id = ?');
    stmt.run(name, description || '', origin, image_url, id, function (err) {
        if (err) {
            res.status(500).send('Error updating breed');
        } else if (this.changes === 0) {
            res.status(404).send('Breed not found');
        } else {
            res.json({ id, name, description, origin, image_url });
        }
    });
});

// API endpoint to partially update an existing breed
app.patch('/breeds/:id', (req, res) => {
    const { id } = req.params;
    const fields = req.body;
    const validFields = ['name', 'description', 'origin', 'image_url'];
    const updates = Object.keys(fields).filter(field => validFields.includes(field));

    if (updates.length === 0) {
        return res.status(400).send('No valid fields to update.');
    }

    const query = `UPDATE breeds SET ${updates.map(field => `${field} = ?`).join(', ')} WHERE id = ?`;
    const values = updates.map(field => fields[field]);
    values.push(id);

    const stmt = db.prepare(query);
    stmt.run(values, function (err) {
        if (err) {
            res.status(500).send('Error updating breed');
        } else if (this.changes === 0) {
            res.status(404).send('Breed not found');
        } else {
            res.json({ id, ...fields });
        }
    });
});

// API endpoint to delete a breed
app.delete('/breeds/:id', (req, res) => {
    const { id } = req.params;

    const stmt = db.prepare('DELETE FROM breeds WHERE id = ?');
    stmt.run(id, function (err) {
        if (err) {
            res.status(500).send('Error deleting breed');
        } else if (this.changes === 0) {
            res.status(404).send('Breed not found');
        } else {
            res.status(204).send();
        }
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

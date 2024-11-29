const db = require('../index'); // assuming the db connection is exported from index.js

// Controller to get all items
const getItems = (req, res) => {
    db.all("SELECT * FROM items", (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ items: rows });
    });
};

// Controller to get an item by ID
const getItem = (req, res) => {
    const { id } = req.params;
    db.get("SELECT * FROM items WHERE id = ?", [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ message: 'Item not found' });
            return;
        }
        res.json({ item: row });
    });
};

// Controller to create a new item
const createItem = (req, res) => {
    const { name, description } = req.body;
    const stmt = db.prepare("INSERT INTO items (name, description) VALUES (?, ?)");
    stmt.run(name, description, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(201).json({ id: this.lastID, name, description });
    });
    stmt.finalize();
};

// Controller to update an existing item by ID
const updateItem = (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    const stmt = db.prepare("UPDATE items SET name = ?, description = ? WHERE id = ?");
    stmt.run(name, description, id, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ message: 'Item not found' });
            return;
        }
        res.json({ id, name, description });
    });
    stmt.finalize();
};

// Controller to delete an item by ID
const deleteItem = (req, res) => {
    const { id } = req.params;
    const stmt = db.prepare("DELETE FROM items WHERE id = ?");
    stmt.run(id, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ message: 'Item not found' });
            return;
        }
        res.json({ message: `Item with id ${id} deleted` });
    });
    stmt.finalize();
};

module.exports = {
    getItems,
    getItem,
    createItem,
    updateItem,
    deleteItem
};

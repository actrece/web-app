const sqlite3 = require('sqlite3').verbose();

// Open SQLite database
const db = new sqlite3.Database('./database/items.db');

// Initialize the database
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT
        )
    `);
});

// Database helper functions
const getAllItems = (callback) => {
    db.all('SELECT * FROM items', [], (err, rows) => {
        callback(err, rows);
    });
};

const getItemById = (id, callback) => {
    db.get('SELECT * FROM items WHERE id = ?', [id], (err, row) => {
        callback(err, row);
    });
};

const addItem = (item, callback) => {
    const { name, description } = item;
    db.run(
        'INSERT INTO items (name, description) VALUES (?, ?)',
        [name, description],
        function (err) {
            callback(err, this.lastID);
        }
    );
};

const updateItem = (id, item, callback) => {
    const { name, description } = item;
    db.run(
        'UPDATE items SET name = ?, description = ? WHERE id = ?',
        [name, description, id],
        function (err) {
            callback(err, this.changes); // Returns how many rows were updated
        }
    );
};

const deleteItem = (id, callback) => {
    db.run('DELETE FROM items WHERE id = ?', [id], function (err) {
        callback(err, this.changes); // Returns how many rows were deleted
    });
};

module.exports = { getAllItems, getItemById, addItem, updateItem, deleteItem };

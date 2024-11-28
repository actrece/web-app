const sqlite3 = require('sqlite3').verbose();

// Open SQLite database
const db = new sqlite3.Database(':memory:');

// Create table (if not exists)
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, description TEXT, date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");
});

// Functions to interact with the database
const getAllItems = (callback) => {
    db.all("SELECT * FROM items", [], (err, rows) => {
        callback(err, rows);
    });
};

const getItemById = (id, callback) => {
    db.get("SELECT * FROM items WHERE id = ?", [id], (err, row) => {
        callback(err, row);
    });
};

const addItem = (name, description, callback) => {
    db.run("INSERT INTO items (name, description) VALUES (?, ?)", [name, description], function (err) {
        callback(err, this.lastID);
    });
};

const updateItem = (id, name, description, callback) => {
    db.run("UPDATE items SET name = ?, description = ? WHERE id = ?", [name, description, id], (err) => {
        callback(err);
    });
};

const deleteItem = (id, callback) => {
    db.run("DELETE FROM items WHERE id = ?", [id], (err) => {
        callback(err);
    });
};

module.exports = {
    getAllItems,
    getItemById,
    addItem,
    updateItem,
    deleteItem
};

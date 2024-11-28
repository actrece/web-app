const Item = require('../models/item');

// Get all items
const getItems = (req, res) => {
    Item.getAllItems((err, items) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(items);
    });
};

// Get a single item
const getItem = (req, res) => {
    const { id } = req.params;
    Item.getItemById(id, (err, item) => {
        if (err || !item) {
            return res.status(404).json({ error: 'Item not found' });
        }
        res.json(item);
    });
};

// Add new item
const createItem = (req, res) => {
    const { name, description } = req.body;
    Item.addItem(name, description, (err, id) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id, name, description });
    });
};

// Update item
const updateItem = (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    Item.updateItem(id, name, description, (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json({ message: 'Item updated' });
    });
};

// Delete item
const deleteItem = (req, res) => {
    const { id } = req.params;
    Item.deleteItem(id, (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json({ message: 'Item deleted' });
    });
};

module.exports = {
    getItems,
    getItem,
    createItem,
    updateItem,
    deleteItem
};

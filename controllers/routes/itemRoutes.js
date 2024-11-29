const express = require('express');
const itemController = require('../controllers/itemController'); // This path should be correct

const router = express.Router();

// Route to get all items
router.get('/', itemController.getAllItems);

// Route to get an item by its ID
router.get('/:id', itemController.getItemById);

// Route to add a new item
router.post('/', itemController.addItem);

// Route to update an existing item by its ID
router.put('/:id', itemController.updateItem);

// Route to delete an item by its ID
router.delete('/:id', itemController.deleteItem);

module.exports = router;

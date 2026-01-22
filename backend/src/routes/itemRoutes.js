const express = require('express');
const ItemController = require('../controllers/ItemController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticateToken, ItemController.createItem);
router.get('/', ItemController.getAllItems);
router.get('/search', ItemController.searchItems);
router.get('/user/items', authenticateToken, ItemController.getUserItems);
router.get('/category/:category', ItemController.getItemsByCategory);
router.get('/:id', ItemController.getItemById);
router.put('/:id', authenticateToken, ItemController.updateItem);
router.put('/:id/resolve', authenticateToken, ItemController.resolveItem);
router.delete('/:id', authenticateToken, ItemController.deleteItem);


module.exports = router;

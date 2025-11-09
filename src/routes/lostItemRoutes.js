const express = require('express');
const {
  getLostItems,
  getLostItem,
  createLostItem,
  updateLostItem,
  deleteLostItem,
  getMyLostItems
} = require('../controllers/lostItemController');

const router = express.Router();

const { protect } = require('../middleware/auth');
const upload = require('../utils/upload');

router.route('/')
  .get(getLostItems)
  .post(protect, upload.array('images', 5), createLostItem);

router.get('/user/me', protect, getMyLostItems);

router.route('/:id')
  .get(getLostItem)
  .put(protect, upload.array('images', 5), updateLostItem)
  .delete(protect, deleteLostItem);

module.exports = router;

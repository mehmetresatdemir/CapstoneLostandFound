const ItemModel = require('../models/ItemModel');

class ItemController {
  static async createItem(req, res, next) {
    try {
      const userId = req.userId;
      const {
        title,
        description,
        category,
        itemStatus,
        locationFound,
        locationLost,
        dateLost,
        dateFound,
        rewardAmount,
        imageUrl
      } = req.body;

      if (!title || !description || !category || !itemStatus) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields'
        });
      }

      const result = await ItemModel.createItem({
        userId,
        title,
        description,
        category,
        itemStatus,
        locationFound,
        locationLost,
        dateLost,
        dateFound,
        rewardAmount,
        imageUrl
      });

      res.status(201).json({
        success: true,
        message: 'Item posted successfully',
        data: {
          itemId: result.insertId,
          title,
          description,
          category,
          itemStatus
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getItemById(req, res, next) {
    try {
      const { id } = req.params;

      const item = await ItemModel.getItemById(id);
      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item not found'
        });
      }

      const responses = await ItemModel.getItemResponses(id);

      res.json({
        success: true,
        message: 'Item retrieved successfully',
        data: {
          ...item,
          responses
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAllItems(req, res, next) {
    try {
      const { status, category, search } = req.query;

      const filters = {};
      if (status && ['lost', 'found'].includes(status)) {
        filters.itemStatus = status;
      }
      if (category) {
        filters.category = category;
      }
      if (search) {
        filters.search = search;
      }

      const items = await ItemModel.getAllItems(filters);

      res.json({
        success: true,
        message: 'Items retrieved successfully',
        data: items,
        count: items.length
      });
    } catch (error) {
      next(error);
    }
  }

  static async searchItems(req, res, next) {
    try {
      const { query } = req.query;

      if (!query || query.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Search query must be at least 2 characters'
        });
      }

      const items = await ItemModel.searchItems(query);

      res.json({
        success: true,
        message: 'Search results',
        data: items,
        count: items.length
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUserItems(req, res, next) {
    try {
      const userId = req.userId;

      const items = await ItemModel.getUserItems(userId);

      res.json({
        success: true,
        message: 'User items retrieved successfully',
        data: items,
        count: items.length
      });
    } catch (error) {
      next(error);
    }
  }

  static async getItemsByCategory(req, res, next) {
    try {
      const { category } = req.params;

      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'Category is required'
        });
      }

      const items = await ItemModel.getItemsByCategory(category);

      res.json({
        success: true,
        message: 'Items retrieved by category',
        data: items,
        count: items.length
      });
    } catch (error) {
      next(error);
    }
  }

  static async resolveItem(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.userId;

      const item = await ItemModel.getItemById(id);
      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item not found'
        });
      }

      if (item.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this item'
        });
      }

      await ItemModel.updateItemStatus(id, {
        isResolved: true,
        resolvedDate: new Date()
      });

      res.json({
        success: true,
        message: 'Item marked as resolved'
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteItem(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.userId;

      const item = await ItemModel.getItemById(id);
      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item not found'
        });
      }

      if (item.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to delete this item'
        });
      }

      await ItemModel.deleteItem(id);

      res.json({
        success: true,
        message: 'Item deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  static async addResponse(req, res, next) {
    try {
      const itemId = req.params.id;
      const responderId = req.userId;
      const { message, contactPhone, contactEmail } = req.body;

      if (!message) {
        return res.status(400).json({
          success: false,
          message: 'Message is required'
        });
      }

      const item = await ItemModel.getItemById(itemId);
      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item not found'
        });
      }

      const result = await ItemModel.addItemResponse(
        itemId,
        responderId,
        message,
        contactPhone || null,
        contactEmail || null
      );

      res.status(201).json({
        success: true,
        message: 'Response added successfully',
        data: {
          responseId: result.insertId
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getResponses(req, res, next) {
    try {
      const { id } = req.params;

      const item = await ItemModel.getItemById(id);
      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item not found'
        });
      }

      const responses = await ItemModel.getItemResponses(id);

      res.json({
        success: true,
        message: 'Responses retrieved successfully',
        data: responses,
        count: responses.length
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ItemController;

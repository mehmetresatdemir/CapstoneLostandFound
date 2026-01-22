const { executeQuery } = require('../config/database');

class ItemModel {
  static async createItem(itemData) {
    const {
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
    } = itemData;

    const sql = `
      INSERT INTO items (
        user_id, title, description, category, item_status,
        location_found, location_lost, date_lost, date_found,
        reward_amount, image_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await executeQuery(sql, [
      userId,
      title,
      description,
      category,
      itemStatus,
      locationFound || null,
      locationLost || null,
      dateLost || null,
      dateFound || null,
      rewardAmount || null,
      imageUrl || null
    ]);

    return result;
  }

  static async getItemById(itemId) {
    const sql = `
      SELECT i.*, u.first_name, u.last_name, u.email, u.phone
      FROM items i
      JOIN users u ON i.user_id = u.id
      WHERE i.id = ?
    `;
    const results = await executeQuery(sql, [itemId]);
    return results[0] || null;
  }

  static async getAllItems(filters = {}) {
    let sql = `
      SELECT i.*, u.first_name, u.last_name, u.email, u.phone
      FROM items i
      JOIN users u ON i.user_id = u.id
      WHERE i.is_resolved = FALSE
    `;
    const params = [];

    if (filters.itemStatus) {
      sql += ' AND i.item_status = ?';
      params.push(filters.itemStatus);
    }

    if (filters.category) {
      sql += ' AND i.category = ?';
      params.push(filters.category);
    }

    if (filters.search) {
      sql += ' AND (i.title LIKE ? OR i.description LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm);
    }

    sql += ' ORDER BY i.created_at DESC LIMIT 100';

    const results = await executeQuery(sql, params);
    return results;
  }

  static async getUserItems(userId) {
    const sql = `
      SELECT * FROM items
      WHERE user_id = ?
      ORDER BY is_resolved ASC, created_at DESC
    `;
    const results = await executeQuery(sql, [userId]);
    return results;
  }

  static async searchItems(searchTerm) {
    const sql = `
      SELECT i.*, u.first_name, u.last_name, u.email, u.phone
      FROM items i
      JOIN users u ON i.user_id = u.id
      WHERE (i.title LIKE ? OR i.description LIKE ? OR i.location_found LIKE ? OR i.location_lost LIKE ?)
      AND i.is_resolved = FALSE
      ORDER BY i.created_at DESC
      LIMIT 100
    `;
    const searchPattern = `%${searchTerm}%`;
    const results = await executeQuery(sql, [searchPattern, searchPattern, searchPattern, searchPattern]);
    return results;
  }

  static async updateItem(itemId, updates) {
    const {
      title,
      description,
      category,
      itemStatus,
      locationFound,
      locationLost,
      imageUrl,
      isResolved
    } = updates;

    const sql = `
      UPDATE items
      SET 
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        category = COALESCE(?, category),
        item_status = COALESCE(?, item_status),
        location_found = COALESCE(?, location_found),
        location_lost = COALESCE(?, location_lost),
        image_url = COALESCE(?, image_url),
        is_resolved = COALESCE(?, is_resolved),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    await executeQuery(sql, [
      title || null,
      description || null,
      category || null,
      itemStatus || null,
      locationFound || null,
      locationLost || null,
      imageUrl || null,
      isResolved !== undefined ? isResolved : null,
      itemId
    ]);
  }

  static async updateItemStatus(itemId, updates) {
    const { isResolved, resolvedDate } = updates;
    const sql = `
      UPDATE items
      SET is_resolved = ?, resolved_date = ?
      WHERE id = ?
    `;
    await executeQuery(sql, [isResolved, resolvedDate || new Date(), itemId]);
  }

  static async deleteItem(itemId) {
    const sql = 'DELETE FROM items WHERE id = ?';
    await executeQuery(sql, [itemId]);
  }

  static async getItemsByCategory(category) {
    const sql = `
      SELECT i.*, u.first_name, u.last_name, u.email, u.phone
      FROM items i
      JOIN users u ON i.user_id = u.id
      WHERE i.category = ? AND i.is_resolved = FALSE
      ORDER BY i.created_at DESC
      LIMIT 50
    `;
    const results = await executeQuery(sql, [category]);
    return results;
  }

  static async addItemResponse(itemId, responderId, message, contactPhone, contactEmail) {
    const sql = `
      INSERT INTO item_responses (item_id, responder_id, message, contact_phone, contact_email)
      VALUES (?, ?, ?, ?, ?)
    `;
    const result = await executeQuery(sql, [itemId, responderId, message, contactPhone, contactEmail]);
    return result;
  }

  static async getItemResponses(itemId) {
    const sql = `
      SELECT ir.*, u.first_name, u.last_name, u.email
      FROM item_responses ir
      JOIN users u ON ir.responder_id = u.id
      WHERE ir.item_id = ?
      ORDER BY ir.response_date DESC
    `;
    const results = await executeQuery(sql, [itemId]);
    return results;
  }
}

module.exports = ItemModel;

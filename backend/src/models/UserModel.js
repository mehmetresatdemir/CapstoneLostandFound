const { executeQuery } = require('../config/database');

class UserModel {
  static async createUser(userData) {
    const { firstName, lastName, email, phone, passwordHash } = userData;
    const sql = `
      INSERT INTO users (first_name, last_name, email, phone, password)
      VALUES (?, ?, ?, ?, ?)
    `;
    const result = await executeQuery(sql, [firstName, lastName, email, phone, passwordHash]);
    return result;
  }

  static async findUserByEmail(email) {
    const sql = 'SELECT * FROM users WHERE email = ?';
    const results = await executeQuery(sql, [email]);
    return results[0] || null;
  }

  static async findUserById(userId) {
    const sql = 'SELECT id, first_name, last_name, email, phone, created_at FROM users WHERE id = ?';
    const results = await executeQuery(sql, [userId]);
    return results[0] || null;
  }

  static async getUserById(userId) {
    const sql = `
      SELECT id, first_name, last_name, email, phone, created_at, updated_at
      FROM users WHERE id = ?
    `;
    const results = await executeQuery(sql, [userId]);
    return results[0] || null;
  }

  static async updateUserProfile(userId, updates) {
    const { firstName, lastName, phone } = updates;
    const sql = `
      UPDATE users
      SET first_name = ?, last_name = ?, phone = ?
      WHERE id = ?
    `;
    await executeQuery(sql, [firstName, lastName, phone, userId]);
  }
}

module.exports = UserModel;

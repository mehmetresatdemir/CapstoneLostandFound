const mysql = require('mysql2/promise');
const config = require('./config');

async function initializeDatabase() {
  const connection = await mysql.createConnection({
    host: config.database.host,
    user: config.database.user,
    password: config.database.password
  });

  try {
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${config.database.database}`);
    console.log(`Database ${config.database.database} created or already exists`);

    await connection.query(`USE ${config.database.database}`);

    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Users table created or already exists');

    // Create items table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(100) NOT NULL,
        item_status ENUM('lost', 'found') NOT NULL,
        location_found VARCHAR(255),
        location_lost VARCHAR(255),
        date_lost DATETIME,
        date_found DATETIME,
        reward_amount DECIMAL(10, 2),
        image_url VARCHAR(500),
        is_resolved BOOLEAN DEFAULT FALSE,
        resolved_date DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_status (item_status),
        INDEX idx_resolved (is_resolved),
        INDEX idx_category (category)
      )
    `);
    console.log('Items table created or already exists');

    // Create responses table for comments/messages between users
    await connection.query(`
      CREATE TABLE IF NOT EXISTS item_responses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        item_id INT NOT NULL,
        responder_id INT NOT NULL,
        message TEXT NOT NULL,
        contact_phone VARCHAR(20),
        contact_email VARCHAR(255),
        response_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
        FOREIGN KEY (responder_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_item_id (item_id),
        INDEX idx_responder_id (responder_id)
      )
    `);
    console.log('Item responses table created or already exists');

    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

module.exports = { initializeDatabase };

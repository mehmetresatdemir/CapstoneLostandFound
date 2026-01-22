-- CIU Lost & Found Database Schema
-- Base64 image storage with LONGTEXT
-- Claim tracking with is_resolved flag

CREATE DATABASE IF NOT EXISTS lost_and_found;
USE lost_and_found;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Items table
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
  image_url LONGTEXT,  -- LONGTEXT for base64 images
  is_resolved BOOLEAN DEFAULT FALSE,  -- TRUE when claimed
  resolved_date DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_status (item_status),
  INDEX idx_resolved (is_resolved),
  INDEX idx_category (category)
);

-- Item responses table
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
);

-- Verify tables
SHOW TABLES;
DESCRIBE items;

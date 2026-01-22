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



-- Verify tables
SHOW TABLES;
DESCRIBE items;

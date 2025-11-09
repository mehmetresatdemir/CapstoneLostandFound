const mysql = require('mysql2/promise');
const config = require('./config');

let pool;

async function initializePool() {
  try {
    pool = mysql.createPool(config.database);
    console.log('Database pool created successfully');
    return pool;
  } catch (error) {
    console.error('Failed to create database pool:', error);
    throw error;
  }
}

async function getConnection() {
  if (!pool) {
    await initializePool();
  }
  return pool.getConnection();
}

async function executeQuery(sql, values = []) {
  const connection = await getConnection();
  try {
    const [results] = await connection.execute(sql, values);
    return results;
  } finally {
    await connection.end();
  }
}

module.exports = {
  initializePool,
  getConnection,
  executeQuery
};

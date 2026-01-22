const mysql = require('mysql2/promise');
const config = require('./config');

async function updateDatabaseForImages() {
  const connection = await mysql.createConnection({
    host: config.database.host,
    user: config.database.user,
    password: config.database.password,
    database: config.database.database
  });

  try {
    await connection.query('ALTER TABLE items MODIFY COLUMN image_url LONGTEXT');
    console.log('Database updated: image_url column is now LONGTEXT');
  } catch (error) {
    console.error('Update failed:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

if (require.main === module) {
  updateDatabaseForImages()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { updateDatabaseForImages };

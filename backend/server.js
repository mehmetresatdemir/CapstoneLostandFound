require('dotenv').config();
const express = require('express');
const { initializeDatabase } = require('./src/config/initDatabase');
const { initializePool } = require('./src/config/database');
const config = require('./src/config/config');
const authRoutes = require('./src/routes/authRoutes');
const itemRoutes = require('./src/routes/itemRoutes');
const { errorHandler } = require('./src/middleware/errorHandler');

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server running' });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint not found' });
});
app.use(errorHandler);

async function startServer() {
  try {
    await initializeDatabase();
    await initializePool();

    const PORT = config.server.port;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} (${config.server.environment})`);
    });
  } catch (error) {
    console.error('Server startup failed:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;

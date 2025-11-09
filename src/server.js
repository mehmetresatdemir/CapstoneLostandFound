const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDatabase = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// Connect to database
connectDatabase();

// Initialize app
const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

// Serve static files (uploaded images)
app.use('/uploads', express.static('uploads'));

// Mount routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/lostitems', require('./routes/lostItemRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🔍 LOST AND FOUND SYSTEM - Backend API                 ║
║                                                           ║
║   Server running on: http://localhost:${PORT}                ║
║   Environment: ${process.env.NODE_ENV || 'development'}                              ║
║                                                           ║
║   API Endpoints:                                          ║
║   • POST   /api/auth/register                            ║
║   • POST   /api/auth/login                               ║
║   • GET    /api/auth/me                                  ║
║   • GET    /api/lostitems                                ║
║   • POST   /api/lostitems                                ║
║   • GET    /api/lostitems/:id                            ║
║   • PUT    /api/lostitems/:id                            ║
║   • DELETE /api/lostitems/:id                            ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = app;

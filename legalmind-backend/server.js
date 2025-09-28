import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Database } from './src/database/database.js';
import { DocumentController } from './src/controllers/documentController.js';
import { ResearchController } from './src/controllers/researchController.js';
import { DraftController } from './src/controllers/draftController.js';
import { DataController } from './src/controllers/dataController.js';
import { errorHandler } from './src/middleware/errorHandler.js';
import { rateLimiter } from './src/middleware/rateLimiter.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000;

// Initialize database
const db = new Database();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use(rateLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    database: db.isConnected() ? 'connected' : 'disconnected'
  });
});

// API routes
app.use('/api/legalmind', DocumentController);
app.use('/api/legalmind', ResearchController);
app.use('/api/legalmind', DraftController);
app.use('/api/legalmind', DataController);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  db.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down server...');
  db.close();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 LegalMind Backend API running on port ${PORT}`);
  console.log(`📊 Database: ${db.isConnected() ? 'Connected' : 'Disconnected'}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API docs: http://localhost:${PORT}/api/legalmind`);
});

export default app;
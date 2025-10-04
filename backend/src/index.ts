import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { initializeDatabase } from './models';
import menuRoutes from './routes/menu';
import orderRoutes from './routes/orders';
import logger, { stream } from './config/logger';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// HTTP request logging with Morgan
app.use(morgan('combined', { stream }));

// Routes
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Food Order API is running' });
});

// Download SQLite database file (protected)
app.get('/api/download/database', (req, res) => {
  try {
    const dbPath = path.join(__dirname, '../database.sqlite');
    
    // Check if database file exists
    if (!fs.existsSync(dbPath)) {
      return res.status(404).json({ error: 'Database file not found' });
    }

    // Get file stats
    const stats = fs.statSync(dbPath);
    const fileName = `om_db_${new Date().toISOString().split('T')[0]}.sqlite`;

    // Set headers for file download
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', stats.size);

    // Stream the file
    const fileStream = fs.createReadStream(dbPath);
    fileStream.pipe(res);

    fileStream.on('error', (error) => {
      logger.error('Error streaming database file:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error downloading database file' });
      }
    });

  } catch (error) {
    logger.error('Error downloading database:', error);
    res.status(500).json({ error: 'Failed to download database file' });
  }
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Error occurred:', { error: err.message, stack: err.stack });
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const startServer = async () => {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

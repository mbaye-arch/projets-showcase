import dotenv from 'dotenv';
import app from './app.js';
import { testConnection } from './config/db.js';

dotenv.config();

const PORT = Number(process.env.PORT || 5000);

const startServer = async () => {
  app.listen(PORT, async () => {
    console.log(`Server running on http://localhost:${PORT}`);

    try {
      await testConnection();
      console.log('Database connection established.');
    } catch (error) {
      console.warn(
        'Database unavailable at startup. API is running, but database-backed routes may fail until MySQL is available.',
        error.message
      );
    }
  });
};

startServer();

const mongoose = require('mongoose');

/**
 * Establishes connection to MongoDB using Mongoose.
 * Attempts primary MONGO_URI, then falls back to local MongoDB if primary fails.
 */
const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI || 'mongodb://localhost:27017/chat_app';
  try {
    const conn = await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[MongoDB] Primary connection failed: ${error.message}`);
    // Only attempt local fallback in development mode
    if (process.env.NODE_ENV !== 'production') {
      try {
        console.log('[MongoDB] Trying local fallback...');
        const localUri = 'mongodb://127.0.0.1:27017/chat_app';
        const conn = await mongoose.connect(localUri, {
          serverSelectionTimeoutMS: 3000,
        });
        console.log(`[MongoDB] Connected to local fallback: ${conn.connection.host}`);
        return;
      } catch (fallbackError) {
        console.error(`[MongoDB] Local fallback failed: ${fallbackError.message}`);
      }
    }
    console.error(`[MongoDB] Fatal Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

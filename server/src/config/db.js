import mongoose from 'mongoose';

let cachedConnection = null;
let connectionPromise = null;

const connectDB = async () => {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not configured');
  }

  connectionPromise = mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
  })
    .then((conn) => {
      cachedConnection = conn;
      console.log(`✅ MongoDB connected: ${conn.connection.host}`);
      return conn;
    })
    .catch((error) => {
      console.error(`❌ MongoDB connection error: ${error.message}`);
      connectionPromise = null;
      throw error;
    });

  return connectionPromise;
};

export default connectDB;

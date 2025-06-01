const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Try MongoDB Atlas first
    let mongoUri = process.env.MONGO_URI;
    
    // If Atlas connection fails in development, fallback to local
    if (process.env.NODE_ENV === 'development') {
      try {
        console.log('Attempting to connect to MongoDB Atlas...'.yellow);
        const conn = await mongoose.connect(mongoUri, {
          serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
        });
        console.log(`MongoDB Atlas Connected: ${conn.connection.host}`.cyan.underline);
        return;
      } catch (atlasError) {
        console.log('MongoDB Atlas connection failed, trying local MongoDB...'.yellow);
        mongoUri = 'mongodb://localhost:27017/taskmanager';
      }
    }

    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline);
  } catch (error) {
    console.error(`Error: ${error.message}`.red.underline.bold);
    console.log('\nTo fix MongoDB Atlas connection:'.yellow);
    console.log('1. Add your IP address to MongoDB Atlas Network Access whitelist'.yellow);
    console.log('2. Or use 0.0.0.0/0 to allow all IPs (not recommended for production)'.yellow);
    console.log('3. Or install and run MongoDB locally: https://www.mongodb.com/try/download/community'.yellow);
    process.exit(1);
  }
};

module.exports = connectDB;
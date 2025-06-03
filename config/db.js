const mongoose = require('mongoose');
const colors = require('colors');

const connectDB = async () => {
  try {
    // Loại bỏ các options đã deprecated trong MongoDB Driver 4.0+
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout sau 5s
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline.bold);
  } catch (error) {
    console.error(`Error: ${error.message}`.red.underline.bold);
    
    // Log thêm thông tin để debug
    console.error('Vui lòng thực hiện một trong các bước sau:'.yellow);
    console.error('1. Thêm IP của bạn vào MongoDB Atlas whitelist'.yellow);
    console.error('2. Sử dụng MongoDB local thay vì Atlas'.yellow);
    
    process.exit(1);
  }
};

module.exports = connectDB;
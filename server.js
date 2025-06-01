require('dotenv').config();
const express = require('express');
const colors = require('colors');
const connectDB = require('./config/db');
const path = require('path');
const { errorHandler } = require('./middleware/errorMiddleware');
const http = require('http');
const socketIo = require('socket.io');
const { startScheduledJobs } = require('./services/notificationScheduler');

// Kết nối database
connectDB();

const app = express();

// Middleware xử lý JSON
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Middleware CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    return res.status(200).json({});
  }
  next();
});

// Mount routes (API)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/teams', require('./routes/teamRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));
app.use('/api/timelogs', require('./routes/timeLogRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/activitylogs', require('./routes/activityLogRoutes'));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Phục vụ static file React build ở production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client', 'build')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

// Middleware xử lý lỗi
app.use(errorHandler);

// Khởi động server
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Socket.IO setup
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Store connected users
const connectedUsers = new Map();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`.cyan);

  // User authentication and registration
  socket.on('join', (userId) => {
    connectedUsers.set(userId, socket.id);
    socket.userId = userId;
    console.log(`User ${userId} joined with socket ${socket.id}`.green);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    if (socket.userId) {
      connectedUsers.delete(socket.userId);
      console.log(`User ${socket.userId} disconnected`.yellow);
    }
  });
});

// Make io available globally for sending notifications
global.io = io;
global.connectedUsers = connectedUsers;

server.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`.yellow.bold
  );
  
  // Start scheduled notification jobs
  startScheduledJobs();
});

// Graceful shutdown
const gracefulShutdown = () => {
  console.log('\nShutting down server gracefully...'.yellow.bold);
  server.close(() => {
    process.exit(0);
  });
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

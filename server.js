require('dotenv').config();
const express = require('express');
const fileUpload = require('express-fileupload');
const { basicRateLimit } = require('./middlewares/rateLimiting');
// Mở comment đoạn này nếu bạn muốn bỏ qua lỗi kết nối MongoDB
// process.env.SKIP_MONGODB = "true";

const connectDB = require('./config/db');
if (process.env.SKIP_MONGODB !== "true") {
  // Connect to database
  connectDB();
} else {
  console.log('Running without MongoDB connection (using mock data)'.yellow.bold);
}

const path = require('path');

// Route files
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const teamRoutes = require('./routes/teamRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const subTaskRoutes = require('./routes/subTaskRoutes');
const commentRoutes = require('./routes/commentRoutes');
const timeLogRoutes = require('./routes/timeLogRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const activityLogRoutes = require('./routes/activityLogRoutes');
const attachmentRoutes = require('./routes/attachmentRoutes');
const calendarRoutes = require('./routes/calendarRoutes');
const searchRoutes = require('./routes/searchRoutes');

const app = express();

// Apply basic rate limiting to all requests
app.use(basicRateLimit);

// Body parser
app.use(express.json());

// File upload middleware
app.use(fileUpload({
  createParentPath: true,
  limits: { 
    fileSize: 50 * 1024 * 1024 // 50MB max file size
  },
  abortOnLimit: true,
  responseOnLimit: "File size limit exceeded"
}));

// Enable CORS
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

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/subtasks', subTaskRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/timelogs', timeLogRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/activitylogs', activityLogRoutes);
app.use('/api/attachments', attachmentRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/search', searchRoutes);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

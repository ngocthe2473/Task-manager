const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const bcrypt = require('bcryptjs');

// Load env vars
dotenv.config();

// Import models
const User = require('../models/User');
const Team = require('../models/Team');
const Project = require('../models/Project');
const Task = require('../models/Task');

const seedData = async () => {
  try {
    console.log('Connecting to MongoDB Atlas...'.yellow);
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB Atlas'.green);

    // Xóa dữ liệu cũ
    console.log('Clearing existing data...'.yellow);
    await User.deleteMany();
    await Team.deleteMany();
    await Project.deleteMany();
    await Task.deleteMany();

    // Tạo users mẫu
    console.log('Creating sample users...'.yellow);    const hashedPassword = await bcrypt.hash('123456', 12);
    
    const users = await User.create([
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
        avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=random'
      },
      {
        name: 'Trần Ngọc Thế',
        email: 'the@example.com',
        password: hashedPassword,
        role: 'user',
        avatar: 'https://ui-avatars.com/api/?name=Trần+Ngọc+Thế&background=random'
      },
      {
        name: 'Nguyễn Tấn Long',
        email: 'long@example.com',
        password: hashedPassword,
        role: 'user',
        avatar: 'https://ui-avatars.com/api/?name=Nguyễn+Tấn+Long&background=random'
      },
      {
        name: 'Trần Đại Việt',
        email: 'viet@example.com',
        password: hashedPassword,
        role: 'user',
        avatar: 'https://ui-avatars.com/api/?name=Trần+Đại+Việt&background=random'
      }
    ]);

    // Tạo team mẫu
    console.log('Creating sample team...'.yellow);
    const team = await Team.create({
      name: 'Nhóm Phát Triển Web',
      description: 'Nhóm phát triển hệ thống quản lý công việc',
      manager: users[1]._id, // Thế làm manager
      members: [users[1]._id, users[2]._id, users[3]._id]
    });

    // Tạo project mẫu
    console.log('Creating sample project...'.yellow);
    const project = await Project.create({
      name: 'Hệ thống quản lý công việc',
      description: 'Phát triển ứng dụng web quản lý công việc cho nhóm',
      team: team._id,
      status: 'in_progress',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 ngày sau
    });

    // Tạo tasks mẫu
    console.log('Creating sample tasks...'.yellow);
    await Task.create([
      {
        title: 'Thiết kế giao diện đăng nhập',
        description: 'Tạo form đăng nhập với validation',
        project: project._id,
        assignee: users[1]._id,
        creator: users[0]._id,
        status: 'done', // Giữ nguyên vì 'done' đúng
        priority: 'high',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Phát triển API quản lý tasks',
        description: 'Tạo CRUD operations cho tasks',
        project: project._id,
        assignee: users[2]._id,
        creator: users[0]._id,
        status: 'inprogress', // Sửa 'in_progress' thành 'inprogress'
        priority: 'medium',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Tích hợp hệ thống notification',
        description: 'Thêm thông báo real-time cho users',
        project: project._id,
        assignee: users[3]._id,
        creator: users[0]._id,
        status: 'todo', // Giữ nguyên vì 'todo' đúng
        priority: 'low',
        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000)
      }
    ]);

    console.log('Sample data created successfully!'.green);
    console.log('Users created:'.cyan);
    console.log('- admin/123456 (Admin)');
    console.log('- the/123456 (Manager)');
    console.log('- long/123456 (Member)');
    console.log('- viet/123456 (Member)');
    
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`.red);
    process.exit(1);
  }
};

seedData();

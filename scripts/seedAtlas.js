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
const SubTask = require('../models/SubTask');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');

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
    console.log('Creating sample users...'.yellow);    const hashedPassword = await bcrypt.hash('Password123', 12);
    
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
      members: [
        { user: users[1]._id, team_role: 'leader' },
        { user: users[2]._id, team_role: 'member' },
        { user: users[3]._id, team_role: 'member' }
      ]
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
    const tasks = await Task.create([
      {
        title: 'Thiết kế giao diện đăng nhập',
        description: 'Tạo form đăng nhập với validation',
        project: project._id,
        assignee: users[1]._id,
        creator: users[0]._id,
        status: 'done',
        priority: 'high',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Phát triển API quản lý tasks',
        description: 'Tạo CRUD operations cho tasks',
        project: project._id,
        assignee: users[2]._id, // Nguyễn Tấn Long
        creator: users[0]._id,
        status: 'in-progress',
        priority: 'medium',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Tích hợp hệ thống notification',
        description: 'Thêm thông báo real-time cho users',
        project: project._id,
        assignee: users[3]._id,
        creator: users[0]._id,
        status: 'todo',
        priority: 'low',
        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Thiết kế giao diện task board',
        description: 'Tạo giao diện Kanban board cho quản lý tasks',
        project: project._id,
        assignee: users[2]._id, // Thêm task cho Nguyễn Tấn Long
        creator: users[0]._id,
        status: 'todo',
        priority: 'high',
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
      }
    ]);

    // Tạo subtasks cho mỗi task
    console.log('Creating sample subtasks...'.yellow);
    for (const [i, task] of tasks.entries()) {
      await SubTask.create([
        {
          title: `Subtask 1 for ${task.title}`,
          description: 'Mô tả subtask 1',
          parentTask: task._id,
          assignee: users[(i+1)%users.length]._id,
          status: 'todo',
          priority: 'medium',
          dueDate: new Date(Date.now() + (i+2) * 5 * 24 * 60 * 60 * 1000)
        },
        {
          title: `Subtask 2 for ${task.title}`,
          description: 'Mô tả subtask 2',
          parentTask: task._id,
          assignee: users[(i+2)%users.length]._id,
          status: 'in_progress',
          priority: 'high',
          dueDate: new Date(Date.now() + (i+3) * 5 * 24 * 60 * 60 * 1000)
        }
      ]);
    }

    // Tạo comments cho mỗi task
    console.log('Creating sample comments...'.yellow);
    for (const [i, task] of tasks.entries()) {
      const c1 = await Comment.create({
        text: `Bình luận đầu tiên cho task ${task.title}`,
        user: users[(i+1)%users.length]._id,
        task: task._id
      });
      // Reply cho comment đầu tiên
      await Comment.create({
        text: `Reply cho bình luận đầu tiên của task ${task.title}`,
        user: users[(i+2)%users.length]._id,
        task: task._id,
        parentComment: c1._id
      });
    }

    // Tạo notifications cho các user liên quan
    console.log('Creating sample notifications...'.yellow);
    for (const [i, task] of tasks.entries()) {
      await Notification.create([
        {
          user: task.assignee,
          content: `Bạn được giao task: ${task.title}`,
          type: 'task_assigned',
          relatedEntity: task._id,
          onModel: 'Task'
        },
        {
          user: users[0]._id,
          content: `Task ${task.title} đã được tạo mới trong project ${project.name}`,
          type: 'project_update',
          relatedEntity: project._id,
          onModel: 'Project'
        }
      ]);
    }

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

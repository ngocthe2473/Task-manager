const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const bcrypt = require('bcryptjs');

// Load env vars
dotenv.config();

// Define models before using them
const User = mongoose.model('User', new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String },
  // Define the role field with proper enum values that match your schema
  role: { type: String, enum: ['admin', 'manager', 'member'], default: 'member' }
}));

const Project = mongoose.model('Project', new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}));

const Task = mongoose.model('Task', new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ['todo', 'inprogress', 'review', 'done'], default: 'todo' },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  dueDate: { type: Date }
}));

const Comment = mongoose.model('Comment', new mongoose.Schema({
  text: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  createdAt: { type: Date, default: Date.now }
}));

// Connect to DB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/TaskDB')
  .then(() => console.log('MongoDB connected...'.cyan.underline))
  .catch(err => console.error(`Error connecting to MongoDB: ${err.message}`.red.bold));

// Generate random date between two dates
const randomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Clear database and insert seed data
const importData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Task.deleteMany();
    await Project.deleteMany();
    await Comment.deleteMany();

    console.log('Data cleared...'.red.inverse);

    // Create users (using 'member' instead of 'user' for role)
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    const users = [
      {
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        name: 'Admin User',
        role: 'admin'
      },
      {
        username: 'john',
        email: 'john@example.com',
        password: hashedPassword,
        name: 'John Doe',
        role: 'member'  // Changed from 'user' to 'member'
      },
      {
        username: 'jane',
        email: 'jane@example.com',
        password: hashedPassword,
        name: 'Jane Smith',
        role: 'member'  // Changed from 'user' to 'member'
      }
    ];

    const createdUsers = await User.insertMany(users);
    console.log('Users created...'.green.inverse);

    // Create projects
    const projects = [
      {
        name: 'Website Redesign',
        description: 'Redesign the company website with a modern look',
        owner: createdUsers[0]._id,
        members: [createdUsers[0]._id, createdUsers[1]._id]
      },
      {
        name: 'Mobile App Development',
        description: 'Develop a new mobile app for customers',
        owner: createdUsers[1]._id,
        members: [createdUsers[1]._id, createdUsers[2]._id]
      }
    ];

    const createdProjects = await Project.insertMany(projects);
    console.log('Projects created...'.green.inverse);

    // Create tasks
    const statuses = ['todo', 'inprogress', 'review', 'done'];
    const priorities = ['Low', 'Medium', 'High'];
    
    const tasks = [];
    
    for (let i = 0; i < 20; i++) {
      const projectIndex = i % 2; // Alternate between projects
      const userIndex = i % 3; // Alternate between users
      
      const dueDate = randomDate(new Date(), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
      
      tasks.push({
        title: `Task ${i + 1}`,
        description: `This is the description for task ${i + 1}`,
        status: statuses[i % 4],
        priority: priorities[i % 3],
        createdBy: createdUsers[userIndex]._id,
        assignee: createdUsers[(userIndex + 1) % 3]._id,
        project: createdProjects[projectIndex]._id,
        dueDate
      });
    }

    const createdTasks = await Task.insertMany(tasks);
    console.log('Tasks created...'.green.inverse);

    // Create comments
    const comments = [];
    
    for (let i = 0; i < 30; i++) {
      const taskIndex = i % createdTasks.length;
      const userIndex = i % 3;
      
      comments.push({
        text: `This is comment ${i + 1} on this task.`,
        user: createdUsers[userIndex]._id,
        task: createdTasks[taskIndex]._id,
        createdAt: randomDate(new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), new Date())
      });
    }

    await Comment.insertMany(comments);
    console.log('Comments created...'.green.inverse);

    console.log('Data imported!'.green.inverse);
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

// Execute the import
importData();

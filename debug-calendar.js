const mongoose = require('mongoose');
const User = require('./models/User');
const Task = require('./models/Task');
const config = require('./config/db');

async function debugCalendar() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoURI);
    console.log('Connected to MongoDB');

    // Find the user
    const user = await User.findOne({ email: 'vo.thi.son17@company.com' });
    if (!user) {
      console.log('User not found');
      return;
    }
    
    console.log('User found:', user.name, user.email, user.role);
    console.log('User ID:', user._id);

    // Find all tasks for this user
    const allTasks = await Task.find({
      $or: [
        { assignee: user._id },
        { createdBy: user._id }
      ]
    }).populate('assignee', 'name email').populate('project', 'name');

    console.log('\nAll tasks for user:', allTasks.length);
    allTasks.forEach(task => {
      console.log(`- ${task.title} (${task.status}) - Due: ${task.dueDate}`);
    });

    // Check tasks in current date range (June 2025)
    const startDate = new Date('2025-06-01');
    const endDate = new Date('2025-06-30');
    
    const tasksInRange = await Task.find({
      $and: [
        {
          $or: [
            { assignee: user._id },
            { createdBy: user._id }
          ]
        },
        {
          $or: [
            { dueDate: { $gte: startDate, $lte: endDate } },
            { startDate: { $gte: startDate, $lte: endDate } },
            {
              $and: [
                { startDate: { $lte: startDate } },
                { dueDate: { $gte: endDate } }
              ]
            }
          ]
        }
      ]
    }).populate('assignee', 'name email').populate('project', 'name');

    console.log('\nTasks in June 2025:', tasksInRange.length);
    tasksInRange.forEach(task => {
      console.log(`- ${task.title} (${task.status}) - Due: ${task.dueDate}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

debugCalendar();

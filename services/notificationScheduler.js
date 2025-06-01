const cron = require('node-cron');
const Task = require('../models/Task');
const { createTaskNotification } = require('../controllers/notificationController');

// Check for due date reminders every hour
const checkDueDateReminders = () => {
  cron.schedule('0 * * * *', async () => {
    try {
      console.log('Checking for due date reminders...');
      
      const now = new Date();
      const twentyFourHours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const fourHours = new Date(now.getTime() + 4 * 60 * 60 * 1000);
      const oneHour = new Date(now.getTime() + 60 * 60 * 1000);
      
      // Find tasks due within 24 hours
      const tasksDue24h = await Task.find({
        dueDate: {
          $gte: now,
          $lte: twentyFourHours
        },
        status: { $ne: 'completed' }
      }).populate('assignee creator');
      
      // Find tasks due within 4 hours
      const tasksDue4h = await Task.find({
        dueDate: {
          $gte: now,
          $lte: fourHours
        },
        status: { $ne: 'completed' }
      }).populate('assignee creator');
      
      // Find tasks due within 1 hour
      const tasksDue1h = await Task.find({
        dueDate: {
          $gte: now,
          $lte: oneHour
        },
        status: { $ne: 'completed' }
      }).populate('assignee creator');
      
      // Find overdue tasks
      const overdueTasks = await Task.find({
        dueDate: { $lt: now },
        status: { $ne: 'completed' }
      }).populate('assignee creator');
      
      // Send 24-hour reminders
      for (const task of tasksDue24h) {
        if (task.assignee) {
          await createTaskNotification(task.assignee._id, 'task_due_soon', task._id, {
            taskTitle: task.title,
            content: `Task "${task.title}" is due in 24 hours`
          });
        }
        if (task.creator && task.creator._id.toString() !== task.assignee?._id.toString()) {
          await createTaskNotification(task.creator._id, 'task_due_soon', task._id, {
            taskTitle: task.title,
            content: `Task "${task.title}" is due in 24 hours`
          });
        }
      }
      
      // Send 4-hour reminders
      for (const task of tasksDue4h) {
        if (task.assignee) {
          await createTaskNotification(task.assignee._id, 'task_due_soon', task._id, {
            taskTitle: task.title,
            content: `Task "${task.title}" is due in 4 hours`
          });
        }
      }
      
      // Send 1-hour reminders
      for (const task of tasksDue1h) {
        if (task.assignee) {
          await createTaskNotification(task.assignee._id, 'task_due_soon', task._id, {
            taskTitle: task.title,
            content: `Task "${task.title}" is due in 1 hour`
          });
        }
      }
      
      // Send overdue notifications
      for (const task of overdueTasks) {
        if (task.assignee) {
          await createTaskNotification(task.assignee._id, 'task_overdue', task._id, {
            taskTitle: task.title
          });
        }
        if (task.creator && task.creator._id.toString() !== task.assignee?._id.toString()) {
          await createTaskNotification(task.creator._id, 'task_overdue', task._id, {
            taskTitle: task.title
          });
        }
      }
      
      console.log(`Processed ${tasksDue24h.length} 24h reminders, ${tasksDue4h.length} 4h reminders, ${tasksDue1h.length} 1h reminders, ${overdueTasks.length} overdue notifications`);
      
    } catch (error) {
      console.error('Error checking due date reminders:', error);
    }
  });
};

// Check for daily digest notifications (every day at 9 AM)
const checkDailyDigest = () => {
  cron.schedule('0 9 * * *', async () => {
    try {
      console.log('Sending daily digest notifications...');
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // Get all users with tasks
      const tasks = await Task.find({
        $or: [
          { dueDate: { $gte: today, $lt: tomorrow } },
          { status: 'in-progress' }
        ]
      }).populate('assignee creator');
      
      // Group tasks by user
      const userTasks = {};
      
      tasks.forEach(task => {
        if (task.assignee) {
          if (!userTasks[task.assignee._id]) {
            userTasks[task.assignee._id] = { user: task.assignee, tasks: [] };
          }
          userTasks[task.assignee._id].tasks.push(task);
        }
      });
      
      // Send digest to each user
      for (const userId in userTasks) {
        const userTaskData = userTasks[userId];
        const taskCount = userTaskData.tasks.length;
        const dueTodayCount = userTaskData.tasks.filter(t => 
          t.dueDate && t.dueDate >= today && t.dueDate < tomorrow
        ).length;
        
        await createTaskNotification(userId, 'daily_digest', null, {
          content: `Daily Digest: You have ${taskCount} active tasks, ${dueTodayCount} due today`
        });
      }
      
      console.log(`Sent daily digest to ${Object.keys(userTasks).length} users`);
      
    } catch (error) {
      console.error('Error sending daily digest:', error);
    }
  });
};

module.exports = {
  startScheduledJobs: () => {
    checkDueDateReminders();
    checkDailyDigest();
    console.log('Scheduled notification jobs started');
  }
};

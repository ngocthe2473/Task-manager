// Fake database service to simulate API calls
import { v4 as uuidv4 } from 'uuid';

// Fake users
const users = [
  { id: '1', name: 'John Doe', email: 'john@example.com', avatar: 'https://i.pravatar.cc/150?img=1' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', avatar: 'https://i.pravatar.cc/150?img=2' },
  { id: '3', name: 'Mike Johnson', email: 'mike@example.com', avatar: 'https://i.pravatar.cc/150?img=3' },
  { id: '4', name: 'Sarah Brown', email: 'sarah@example.com', avatar: 'https://i.pravatar.cc/150?img=4' },
  { id: '5', name: 'Alex Wilson', email: 'alex@example.com', avatar: 'https://i.pravatar.cc/150?img=5' }
];

// Fake projects
const projects = [
  { id: '1', name: 'Website Redesign', description: 'Redesign the company website with a modern look' },
  { id: '2', name: 'Mobile App Development', description: 'Develop a new mobile app for customers' },
  { id: '3', name: 'Database Migration', description: 'Migrate current database to a new platform' }
];

// Generate random tasks
const generateTasks = () => {
  const statuses = ['todo', 'inprogress', 'review', 'done'];
  const priorities = ['Low', 'Medium', 'High'];
  const tasks = [];

  // Generate 30 random tasks
  for (let i = 0; i < 30; i++) {
    const projectIndex = i % projects.length;
    const assigneeIndex = i % users.length;
    const statusIndex = i % statuses.length;
    
    // Create a due date sometime in the next 30 days
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 30));
    
    tasks.push({
      id: uuidv4(),
      title: `Task ${i + 1}`,
      description: `This is the description for task ${i + 1}. It contains details about what needs to be done.`,
      status: statuses[statusIndex],
      priority: priorities[i % priorities.length],
      assignee: users[assigneeIndex].id,
      assigneeName: users[assigneeIndex].name,
      project: projects[projectIndex].id,
      projectName: projects[projectIndex].name,
      dueDate: dueDate.toISOString().split('T')[0],
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 20 * 24 * 60 * 60 * 1000)).toISOString(),
      comments: generateComments(i % 5 + 1) // Each task gets 1-5 comments
    });
  }
  
  return tasks;
};

// Generate random comments
const generateComments = (count) => {
  const comments = [];
  
  for (let i = 0; i < count; i++) {
    const userIndex = Math.floor(Math.random() * users.length);
    const createdAt = new Date(Date.now() - Math.floor(Math.random() * 10 * 24 * 60 * 60 * 1000));
    
    comments.push({
      id: uuidv4(),
      text: `This is comment ${i + 1} on this task. It provides feedback or additional information.`,
      user: users[userIndex].id,
      userName: users[userIndex].name,
      userAvatar: users[userIndex].avatar,
      createdAt: createdAt.toISOString()
    });
  }
  
  return comments;
};

// Generate all tasks
const tasks = generateTasks();

// Fake API functions
export const getUsers = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...users]);
    }, 500);
  });
};

export const getProjects = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...projects]);
    }, 500);
  });
};

export const getAllTasks = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...tasks]);
    }, 800);
  });
};

export const getTasksByStatus = (status) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(tasks.filter(task => task.status === status));
    }, 500);
  });
};

export const getTaskById = (id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const task = tasks.find(task => task.id === id);
      if (task) {
        resolve({...task});
      } else {
        reject(new Error('Task not found'));
      }
    }, 300);
  });
};

export const updateTask = (id, updates) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const taskIndex = tasks.findIndex(task => task.id === id);
      if (taskIndex !== -1) {
        tasks[taskIndex] = {...tasks[taskIndex], ...updates};
        resolve(tasks[taskIndex]);
      } else {
        reject(new Error('Task not found'));
      }
    }, 300);
  });
};

export const addTask = (newTask) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const task = {
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        comments: [],
        ...newTask
      };
      tasks.push(task);
      resolve(task);
    }, 300);
  });
};

export const deleteTask = (id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const taskIndex = tasks.findIndex(task => task.id === id);
      if (taskIndex !== -1) {
        tasks.splice(taskIndex, 1);
        resolve({ success: true });
      } else {
        reject(new Error('Task not found'));
      }
    }, 300);
  });
};

export default {
  getUsers,
  getProjects,
  getAllTasks,
  getTasksByStatus,
  getTaskById,
  updateTask,
  addTask,
  deleteTask
};

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('../models/User');
const Team = require('../models/Team');
const Project = require('../models/Project');
const Task = require('../models/Task');
const SubTask = require('../models/SubTask');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');
const TimeLog = require('../models/TimeLog');

// Connect to MongoDB Atlas
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('MongoDB Atlas connected...');
  } catch (err) {
    console.error('Error connecting to MongoDB Atlas:', err.message);
    process.exit(1);
  }
};

// Helper function to generate Vietnamese names
const generateVietnameseNames = () => {
  const firstNames = [
    'Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng',
    'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý', 'Đinh', 'Đào', 'Lưu', 'Cao',
    'Trịnh', 'Tô', 'Lam', 'Tống', 'Thái', 'Lâm', 'Hà', 'Vương', 'Châu', 'Mai'
  ];
  
  const middleNames = ['Văn', 'Thị', 'Ngọc', 'Minh', 'Hoàng', 'Thanh', 'Quang', 'Thế', 'Tấn', 'Đức'];
  
  const lastNames = [
    'An', 'Bình', 'Cường', 'Dũng', 'Em', 'Phúc', 'Giang', 'Hải', 'Inh', 'Khôi',
    'Long', 'Minh', 'Nam', 'Oanh', 'Phương', 'Quân', 'Rồng', 'Sơn', 'Tuấn', 'Uyên',
    'Vinh', 'Xuân', 'Yên', 'Zung', 'Anh', 'Bảo', 'Chi', 'Duyên', 'Hoa', 'Lan',
    'Mai', 'Nga', 'Pha', 'Quyên', 'Thảo', 'Vy', 'Hương', 'Linh', 'Nhi', 'Trang',
    'Hùng', 'Tài', 'Đạt', 'Thắng', 'Hạnh', 'Lộc', 'Phát', 'Thịnh', 'Vũ', 'Hiếu'
  ];

  const departments = [
    'Development', 'Quality Assurance', 'Design', 'Marketing', 'Sales', 'Human Resources',
    'Finance', 'Operations', 'DevOps', 'Security', 'Data Science', 'Product Management',
    'Customer Support', 'Business Analysis', 'Infrastructure', 'Mobile Development',
    'Frontend Development', 'Backend Development', 'Testing', 'Research'
  ];

  const positions = [
    'Software Engineer', 'Senior Developer', 'Team Lead', 'Project Manager', 'Product Owner',
    'Scrum Master', 'QA Engineer', 'DevOps Engineer', 'UI/UX Designer', 'Data Analyst',
    'Marketing Manager', 'Sales Representative', 'HR Specialist', 'Financial Analyst',
    'System Administrator', 'Security Engineer', 'Business Analyst', 'Technical Writer',
    'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Mobile Developer',
    'Database Administrator', 'Cloud Architect', 'Solutions Architect', 'Tech Lead'
  ];

  return {
    name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${middleNames[Math.floor(Math.random() * middleNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
    department: departments[Math.floor(Math.random() * departments.length)],
    position: positions[Math.floor(Math.random() * positions.length)]
  };
};

// Generate massive realistic data
const generateMassiveData = async () => {
  try {
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Team.deleteMany({}),
      Project.deleteMany({}),
      Task.deleteMany({}),
      SubTask.deleteMany({}),
      Comment.deleteMany({}),
      Notification.deleteMany({}),
      ActivityLog.deleteMany({}),
      TimeLog.deleteMany({})
    ]);

    // Hash password - ALL USERS HAVE PASSWORD "Password123"
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Password123', salt);
    console.log('🔐 Password hashed (Password123 for all users)');

    // Create 200+ users
    console.log('👥 Creating massive user base...');
    const usersData = [];
    
    // Add specific admin users first
    usersData.push(
      { name: 'System Administrator', email: 'admin@company.com', role: 'admin', department: 'IT Management', position: 'System Administrator' },
      { name: 'Project Manager', email: 'pm@company.com', role: 'admin', department: 'Project Management', position: 'Senior Project Manager' },
      { name: 'Tech Lead', email: 'techlead@company.com', role: 'admin', department: 'Development', position: 'Technical Lead' }
    );

    // Generate 200+ random users
    for (let i = 0; i < 250; i++) {
      const userData = generateVietnameseNames();
      const emailPrefix = userData.name.toLowerCase()
        .replace(/\s+/g, '.')
        .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
        .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
        .replace(/[ìíịỉĩ]/g, 'i')
        .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
        .replace(/[ùúụủũưừứựửữ]/g, 'u')
        .replace(/[ỳýỵỷỹ]/g, 'y')
        .replace(/đ/g, 'd')
        .replace(/[^a-z.]/g, '');
      
      usersData.push({
        name: userData.name,
        email: `${emailPrefix}${i}@company.com`,
        role: Math.random() < 0.1 ? 'admin' : 'user', // 10% admin, 90% user
        department: userData.department,
        position: userData.position
      });
    }

    const users = await User.insertMany(
      usersData.map(userData => ({
        ...userData,
        password: hashedPassword,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=random`,
        phone: `+84${Math.floor(Math.random() * 900000000) + 100000000}`,
        address: `${Math.floor(Math.random() * 999) + 1} Đường ${['Nguyễn Văn Cừ', 'Lê Lợi', 'Trần Hưng Đạo', 'Phạm Văn Đồng', 'Võ Văn Tần'][Math.floor(Math.random() * 5)]}, Quận ${Math.floor(Math.random() * 12) + 1}, TP.HCM`,
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
      }))
    );
    console.log(`✅ Created ${users.length} users`);

    // Create 50+ teams with realistic structures
    console.log('👫 Creating comprehensive team structure...');
    const teamNames = [
      'Frontend Development Team Alpha', 'Frontend Development Team Beta', 'Frontend Development Team Gamma',
      'Backend Services Team Core', 'Backend Services Team Advanced', 'Backend Services Team Cloud',
      'Mobile Development iOS Team', 'Mobile Development Android Team', 'Mobile Development React Native Team',
      'Quality Assurance Manual Testing', 'Quality Assurance Automation', 'Quality Assurance Performance',
      'UI/UX Design Team Creative', 'UI/UX Design Team Research', 'UI/UX Design Team Product',
      'DevOps Infrastructure Team', 'DevOps Security Team', 'DevOps Monitoring Team',
      'Data Science Analytics Team', 'Data Science Machine Learning Team', 'Data Science Business Intelligence',
      'Product Management Core', 'Product Management Innovation', 'Product Management Strategy',
      'Marketing Digital Team', 'Marketing Content Team', 'Marketing Social Media Team',
      'Sales Enterprise Team', 'Sales SMB Team', 'Sales Channel Partners Team',
      'Customer Support Tier 1', 'Customer Support Tier 2', 'Customer Support Technical',
      'Human Resources Recruitment', 'Human Resources Operations', 'Human Resources Development',
      'Finance Accounting Team', 'Finance Analysis Team', 'Finance Planning Team',
      'Security Application Team', 'Security Infrastructure Team', 'Security Compliance Team',
      'Research & Development Innovation', 'Research & Development Emerging Tech', 'Research & Development AI/ML',
      'Operations Business Team', 'Operations Technical Team', 'Operations Support Team',
      'Architecture Solutions Team', 'Architecture Cloud Team', 'Architecture Integration Team'
    ];

    const teamsData = [];
    for (let i = 0; i < teamNames.length; i++) {
      const teamUsers = users.slice(i * 5, (i + 1) * 5 + Math.floor(Math.random() * 8)); // 5-13 members per team
      const leader = teamUsers[Math.floor(Math.random() * Math.min(3, teamUsers.length))];
      
      teamsData.push({
        name: teamNames[i],
        description: `${teamNames[i]} chuyên trách ${teamNames[i].toLowerCase().includes('frontend') ? 'phát triển giao diện người dùng' : 
          teamNames[i].toLowerCase().includes('backend') ? 'phát triển backend và API services' :
          teamNames[i].toLowerCase().includes('mobile') ? 'phát triển ứng dụng di động' :
          teamNames[i].toLowerCase().includes('qa') ? 'đảm bảo chất lượng sản phẩm' :
          teamNames[i].toLowerCase().includes('design') ? 'thiết kế UI/UX và trải nghiệm người dùng' :
          teamNames[i].toLowerCase().includes('devops') ? 'vận hành hạ tầng và triển khai ứng dụng' :
          'các hoạt động chuyên môn trong lĩnh vực của mình'
        }. Team có kinh nghiệm và chuyên môn cao trong việc deliver các sản phẩm chất lượng.`,
        members: teamUsers.map(user => ({
          user: user._id,
          role: user._id.equals(leader._id) ? 'leader' : 'member'
        })),
        teamLead: leader._id,
        createdAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000)
      });
    }

    const teams = await Team.insertMany(teamsData);
    console.log(`✅ Created ${teams.length} teams`);

    // Create 100+ diverse projects
    console.log('📊 Creating massive project portfolio...');
    const projectTemplates = [
      {
        name: 'E-commerce Platform Modernization',
        description: 'Modernize legacy e-commerce platform with microservices architecture, real-time inventory, advanced search, and personalization engine',
        priority: 'High',
        tags: ['E-commerce', 'Microservices', 'React', 'Node.js', 'Redis']
      },
      {
        name: 'AI-Powered Customer Service Bot',
        description: 'Develop intelligent chatbot with NLP capabilities for automated customer support, ticket routing, and sentiment analysis',
        priority: 'Medium',
        tags: ['AI', 'NLP', 'Chatbot', 'Python', 'TensorFlow']
      },
      {
        name: 'Real-time Analytics Dashboard',
        description: 'Build comprehensive analytics dashboard with real-time data visualization, custom reports, and predictive analytics',
        priority: 'High',
        tags: ['Analytics', 'Dashboard', 'Real-time', 'D3.js', 'BigQuery']
      },
      {
        name: 'Mobile Banking Application',
        description: 'Secure mobile banking app with biometric authentication, P2P transfers, investment tracking, and financial planning tools',
        priority: 'High',
        tags: ['Mobile', 'Banking', 'Security', 'React Native', 'Blockchain']
      },
      {
        name: 'IoT Device Management Platform',
        description: 'Comprehensive IoT platform for device management, data collection, real-time monitoring, and automated alerts',
        priority: 'Medium',
        tags: ['IoT', 'Platform', 'Monitoring', 'AWS IoT', 'MQTT']
      },
      {
        name: 'Enterprise Resource Planning System',
        description: 'Complete ERP solution covering HR, Finance, Inventory, CRM, and Business Intelligence modules',
        priority: 'High',
        tags: ['ERP', 'Enterprise', 'Finance', 'HR', 'CRM']
      },
      {
        name: 'Cloud Migration Initiative',
        description: 'Migrate on-premise infrastructure to cloud with containerization, auto-scaling, and disaster recovery',
        priority: 'High',
        tags: ['Cloud', 'Migration', 'AWS', 'Docker', 'Kubernetes']
      },
      {
        name: 'Cybersecurity Enhancement Program',
        description: 'Implement advanced security measures including SIEM, endpoint protection, vulnerability management, and security training',
        priority: 'High',
        tags: ['Security', 'SIEM', 'Endpoint Protection', 'Compliance', 'Training']
      }
    ];

    const projectsData = [];
    for (let i = 0; i < 120; i++) {
      const template = projectTemplates[i % projectTemplates.length];
      const randomTeam = teams[Math.floor(Math.random() * teams.length)];
      const startDate = new Date(Date.now() - Math.random() * 200 * 24 * 60 * 60 * 1000);
      const duration = Math.random() * 365 + 90; // 90-455 days
      
      projectsData.push({
        name: `${template.name} ${i > projectTemplates.length ? `- Phase ${Math.floor(i / projectTemplates.length) + 1}` : ''}`,
        description: template.description + ` Dự án được thực hiện bởi ${randomTeam.name} với timeline ${Math.floor(duration)} ngày và budget được phân bổ theo từng milestone.`,
        team: randomTeam._id,
        status: ['planning', 'in_progress', 'completed', 'on_hold'][Math.floor(Math.random() * 4)],
        priority: template.priority,
        startDate: startDate,
        endDate: new Date(startDate.getTime() + duration * 24 * 60 * 60 * 1000),
        budget: Math.floor(Math.random() * 5000000000) + 100000000, // 100M - 5B VNĐ
        progress: Math.floor(Math.random() * 100),
        tags: template.tags,
        createdAt: startDate
      });
    }

    const projects = await Project.insertMany(projectsData);
    console.log(`✅ Created ${projects.length} projects`);

    // Create 2000+ tasks with realistic distribution
    console.log('📋 Creating massive task collection...');
    const taskTypes = ['Feature', 'Bug Fix', 'Enhancement', 'Research', 'Documentation', 'Testing', 'Refactoring', 'Security', 'Performance', 'Integration'];
    const taskPriorities = ['Low', 'Medium', 'High', 'Urgent'];
    const taskStatuses = ['TODO', 'IN_PROGRESS', 'REVIEW', 'TESTING', 'DONE'];
    
    const tasksData = [];
    for (let i = 0; i < 2500; i++) {
      const project = projects[Math.floor(Math.random() * projects.length)];
      const projectTeam = teams.find(t => t._id.equals(project.team));
      const assignee = projectTeam.members[Math.floor(Math.random() * projectTeam.members.length)];
      const reporter = projectTeam.members[Math.floor(Math.random() * projectTeam.members.length)];
      
      const taskType = taskTypes[Math.floor(Math.random() * taskTypes.length)];
      const priority = taskPriorities[Math.floor(Math.random() * taskPriorities.length)];
      const status = taskStatuses[Math.floor(Math.random() * taskStatuses.length)];
      
      const createdDate = new Date(project.startDate.getTime() + Math.random() * (Date.now() - project.startDate.getTime()));
      const dueDate = new Date(createdDate.getTime() + (Math.random() * 30 + 1) * 24 * 60 * 60 * 1000); // 1-30 days from creation
      
      tasksData.push({
        title: `${taskType}: ${[
          'Implement user authentication system',
          'Fix memory leak in data processing',
          'Optimize database query performance',
          'Add real-time notification feature',
          'Create responsive mobile interface',
          'Integrate third-party payment gateway',
          'Implement advanced search functionality',
          'Add data export capabilities',
          'Create automated backup system',
          'Implement role-based access control',
          'Add multi-language support',
          'Create admin dashboard',
          'Implement caching mechanism',
          'Add API rate limiting',
          'Create user onboarding flow',
          'Implement data validation',
          'Add email notification system',
          'Create reporting module',
          'Implement file upload feature',
          'Add social media integration',
          'Create mobile push notifications',
          'Implement data encryption',
          'Add user profile management',
          'Create audit logging system',
          'Implement search filters',
          'Add batch processing capabilities',
          'Create error monitoring system',
          'Implement data synchronization',
          'Add calendar integration',
          'Create workflow automation'
        ][Math.floor(Math.random() * 30)]} - ${project.name}`,
        description: `Chi tiết implement cho task ${taskType.toLowerCase()} trong project ${project.name}. Task này require ${['frontend skills', 'backend development', 'database optimization', 'API integration', 'security implementation'][Math.floor(Math.random() * 5)]} và expected delivery trong ${Math.floor(Math.random() * 10) + 1} ngày làm việc.`,
        assignedTo: assignee.user,
        reporter: reporter.user,
        project: project._id,
        priority: priority,
        status: status,
        tags: [taskType.toLowerCase(), priority.toLowerCase(), project.tags[0]?.toLowerCase()].filter(Boolean),
        dueDate: dueDate,
        estimatedHours: Math.floor(Math.random() * 40) + 4, // 4-44 hours
        actualHours: status === 'DONE' ? Math.floor(Math.random() * 50) + 2 : 0,
        progress: status === 'DONE' ? 100 : 
                 status === 'TESTING' ? Math.floor(Math.random() * 20) + 80 :
                 status === 'REVIEW' ? Math.floor(Math.random() * 20) + 70 :
                 status === 'IN_PROGRESS' ? Math.floor(Math.random() * 60) + 10 :
                 Math.floor(Math.random() * 10),
        createdAt: createdDate,
        updatedAt: new Date(createdDate.getTime() + Math.random() * (Date.now() - createdDate.getTime()))
      });
    }

    const tasks = await Task.insertMany(tasksData);
    console.log(`✅ Created ${tasks.length} tasks`);

    // Create 5000+ subtasks
    console.log('📝 Creating comprehensive subtask collection...');
    const subtasksData = [];
    for (let i = 0; i < 5000; i++) {
      const parentTask = tasks[Math.floor(Math.random() * tasks.length)];
      const assignee = users[Math.floor(Math.random() * users.length)];
      
      subtasksData.push({
        title: `Subtask ${i + 1}: ${[
          'Setup development environment',
          'Create database schema',
          'Implement API endpoints',
          'Write unit tests',
          'Create UI components',
          'Add error handling',
          'Implement validation logic',
          'Create documentation',
          'Perform code review',
          'Deploy to staging',
          'Update user guide',
          'Add logging functionality',
          'Implement security measures',
          'Optimize performance',
          'Add monitoring alerts'
        ][Math.floor(Math.random() * 15)]}`,
        description: `Chi tiết subtask cho ${parentTask.title}. Cần hoàn thành trong ${Math.floor(Math.random() * 5) + 1} ngày.`,
        parentTask: parentTask._id,
        assignedTo: assignee._id,
        status: ['TODO', 'IN_PROGRESS', 'DONE'][Math.floor(Math.random() * 3)],
        priority: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
        estimatedHours: Math.floor(Math.random() * 8) + 1,
        actualHours: Math.floor(Math.random() * 10),
        dueDate: new Date(parentTask.createdAt.getTime() + Math.random() * 14 * 24 * 60 * 60 * 1000),
        createdAt: new Date(parentTask.createdAt.getTime() + Math.random() * 2 * 24 * 60 * 60 * 1000)
      });
    }

    const subtasks = await SubTask.insertMany(subtasksData);
    console.log(`✅ Created ${subtasks.length} subtasks`);

    // Create 10000+ comments
    console.log('💬 Creating massive comment dataset...');
    const commentTemplates = [
      'Đã review code và có một số feedback',
      'Task này cần thêm unit tests',
      'UI design trông good, nhưng cần optimize performance',
      'Đã merge PR, ready for testing',
      'Cần clarify requirements thêm',
      'Bug đã được fix, please verify',
      'Implementation looks solid',
      'Cần update documentation',
      'API integration working as expected',
      'Performance đã improve 50%',
      'Security vulnerability đã được address',
      'User feedback rất positive',
      'Cần refactor code để maintainable hơn',
      'Database query đã được optimize',
      'Frontend responsive design completed',
      'Backend API đã được implement',
      'Testing coverage đã đạt 90%',
      'Deployment successful to production',
      'User acceptance testing passed',
      'Code review approved'
    ];

    const commentsData = [];
    for (let i = 0; i < 12000; i++) {
      const task = tasks[Math.floor(Math.random() * tasks.length)];
      const author = users[Math.floor(Math.random() * users.length)];
      
      commentsData.push({
        content: commentTemplates[Math.floor(Math.random() * commentTemplates.length)] + ` (Comment #${i + 1})`,
        author: author._id,
        task: task._id,
        createdAt: new Date(task.createdAt.getTime() + Math.random() * (Date.now() - task.createdAt.getTime()))
      });
    }

    const comments = await Comment.insertMany(commentsData);
    console.log(`✅ Created ${comments.length} comments`);

    // Create 8000+ time logs
    console.log('⏰ Creating comprehensive time tracking data...');
    const timeLogsData = [];
    for (let i = 0; i < 8000; i++) {
      const task = tasks[Math.floor(Math.random() * tasks.length)];
      const user = users[Math.floor(Math.random() * users.length)];
      const date = new Date(task.createdAt.getTime() + Math.random() * (Date.now() - task.createdAt.getTime()));
      const hours = Math.random() * 8 + 0.5; // 0.5 to 8.5 hours
      
      timeLogsData.push({
        user: user._id,
        task: task._id,
        hours: parseFloat(hours.toFixed(2)),
        description: [
          'Development work',
          'Code review',
          'Testing',
          'Bug fixing',
          'Documentation',
          'Meeting discussion',
          'Research',
          'Debugging',
          'Implementation',
          'Optimization'
        ][Math.floor(Math.random() * 10)],
        date: date,
        createdAt: date
      });
    }

    const timeLogs = await TimeLog.insertMany(timeLogsData);
    console.log(`✅ Created ${timeLogs.length} time logs`);

    // Create 15000+ notifications
    console.log('🔔 Creating massive notification system...');
    const notificationTypes = ['task_assigned', 'task_updated', 'task_completed', 'comment_added', 'due_date_reminder', 'project_update'];
    const notificationsData = [];
    
    for (let i = 0; i < 15000; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const type = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
      const task = tasks[Math.floor(Math.random() * tasks.length)];
      
      notificationsData.push({
        user: user._id,
        type: type,
        title: `${type.replace('_', ' ').toUpperCase()}: ${task.title}`,
        message: `Notification #${i + 1} - ${type} for task: ${task.title.substring(0, 50)}...`,
        relatedTask: type.includes('task') ? task._id : undefined,
        relatedProject: type.includes('project') ? task.project : undefined,
        isRead: Math.random() < 0.7, // 70% read
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Last 30 days
      });
    }

    const notifications = await Notification.insertMany(notificationsData);
    console.log(`✅ Created ${notifications.length} notifications`);

    // Create 20000+ activity logs
    console.log('📈 Creating comprehensive activity logging...');
    const activities = [
      'created_task', 'updated_task', 'completed_task', 'assigned_task', 'commented_task',
      'created_project', 'updated_project', 'joined_team', 'left_team', 'uploaded_file',
      'deleted_task', 'moved_task', 'changed_priority', 'changed_status', 'added_tag'
    ];
    
    const activityLogsData = [];
    for (let i = 0; i < 20000; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const activity = activities[Math.floor(Math.random() * activities.length)];
      const task = tasks[Math.floor(Math.random() * tasks.length)];
      const project = projects[Math.floor(Math.random() * projects.length)];
      
      activityLogsData.push({
        user: user._id,
        action: activity,
        description: `${user.name} ${activity.replace('_', ' ')} ${activity.includes('task') ? task.title : project.name}`,
        relatedTask: activity.includes('task') ? task._id : undefined,
        relatedProject: activity.includes('project') ? project._id : task.project,
        metadata: {
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
        },
        createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000) // Last 90 days
      });
    }

    const activityLogs = await ActivityLog.insertMany(activityLogsData);
    console.log(`✅ Created ${activityLogs.length} activity logs`);

    // Print comprehensive summary
    console.log('\n🎉 MASSIVE SEED DATA CREATION COMPLETED!');
    console.log('='.repeat(60));
    console.log(`👥 Users: ${users.length} (ALL passwords: Password123)`);
    console.log(`👫 Teams: ${teams.length}`);
    console.log(`📊 Projects: ${projects.length}`);
    console.log(`📋 Tasks: ${tasks.length}`);
    console.log(`📝 Subtasks: ${subtasks.length}`);
    console.log(`💬 Comments: ${comments.length}`);
    console.log(`⏰ Time Logs: ${timeLogs.length}`);
    console.log(`🔔 Notifications: ${notifications.length}`);
    console.log(`📈 Activity Logs: ${activityLogs.length}`);
    console.log('='.repeat(60));
    console.log(`📊 TOTAL DOCUMENTS: ${users.length + teams.length + projects.length + tasks.length + subtasks.length + comments.length + timeLogs.length + notifications.length + activityLogs.length}`);
    
    // Sample users for testing
    console.log('\n📋 SAMPLE USERS FOR TESTING:');
    console.log('🔑 Email: admin@company.com (System Admin)');
    console.log('🔑 Email: pm@company.com (Project Manager)');
    console.log('🔑 Email: techlead@company.com (Tech Lead)');
    console.log('🔑 Password: Password123 (for ALL users)');
    console.log('\n💡 This dataset simulates a large enterprise environment');
    console.log('💡 Perfect for load testing and performance optimization');
    
  } catch (error) {
    console.error('❌ Error creating massive seed data:', error);
    throw error;
  }
};

// Run the massive seed script
const runMassiveSeed = async () => {
  console.log('🚀 Starting MASSIVE seed data generation...');
  console.log('⚠️  This will create 60,000+ documents - please wait...\n');
  
  const startTime = Date.now();
  
  try {
    await connectDB();
    await generateMassiveData();
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log(`\n✅ Database connection closed`);
    console.log(`⏱️  Total time: ${duration} seconds`);
    console.log('🎯 Massive seed data generation completed successfully!');
    
  } catch (error) {
    console.error('💥 Fatal error during seed generation:', error);
  } finally {
    mongoose.connection.close();
  }
};

runMassiveSeed();

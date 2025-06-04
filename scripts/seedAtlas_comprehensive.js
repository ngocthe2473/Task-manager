const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
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
    await mongoose.connect('mongodb+srv://hoanglong1212003:Hoanglong123@cluster0.ktjq5.mongodb.net/TaskManager?retryWrites=true&w=majority', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Atlas connected...');
  } catch (err) {
    console.error('Error connecting to MongoDB Atlas:', err.message);
    process.exit(1);
  }
};

// Comprehensive seed data
const seedData = async () => {
  try {
    // Clear existing data
    console.log('Clearing existing data...');
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

    // Hash password - TẤT CẢ USER ĐỀU CÓ MẬT KHẨU LÀ "Password123"
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Password123', salt);

    // Create 50+ realistic users
    console.log('Creating users...');
    const usersData = [
      // Admins
      { name: 'Nguyễn Văn Admin', email: 'admin@taskmanager.com', role: 'admin', department: 'IT Management', position: 'System Administrator' },
      { name: 'Trần Thị Quản Lý', email: 'manager@taskmanager.com', role: 'admin', department: 'Project Management', position: 'Project Manager' },
      
      // Development Team
      { name: 'Nguyễn Tấn Long', email: 'long.nguyen@dev.com', role: 'user', department: 'Development', position: 'Senior Frontend Developer' },
      { name: 'Trần Ngọc Thế', email: 'the.tran@dev.com', role: 'user', department: 'Development', position: 'Backend Developer' },
      { name: 'Trần Đại Việt', email: 'viet.tran@dev.com', role: 'user', department: 'Development', position: 'Full Stack Developer' },
      { name: 'Lê Minh Quân', email: 'quan.le@dev.com', role: 'user', department: 'Development', position: 'Frontend Developer' },
      { name: 'Phạm Thanh Hương', email: 'huong.pham@dev.com', role: 'user', department: 'Development', position: 'UI/UX Developer' },
      { name: 'Võ Hoàng Nam', email: 'nam.vo@dev.com', role: 'user', department: 'Development', position: 'Mobile Developer' },
      { name: 'Đặng Thị Lan', email: 'lan.dang@dev.com', role: 'user', department: 'Development', position: 'DevOps Engineer' },
      { name: 'Bùi Văn Hùng', email: 'hung.bui@dev.com', role: 'user', department: 'Development', position: 'Backend Developer' },
      
      // QA Team
      { name: 'Hoàng Thị Mai', email: 'mai.hoang@qa.com', role: 'user', department: 'Quality Assurance', position: 'Senior QA Engineer' },
      { name: 'Lý Văn Đức', email: 'duc.ly@qa.com', role: 'user', department: 'Quality Assurance', position: 'QA Automation' },
      { name: 'Ngô Thị Hoa', email: 'hoa.ngo@qa.com', role: 'user', department: 'Quality Assurance', position: 'Manual Tester' },
      { name: 'Đinh Văn Sơn', email: 'son.dinh@qa.com', role: 'user', department: 'Quality Assurance', position: 'Performance Tester' },
      
      // Design Team
      { name: 'Lưu Thị Xuân', email: 'xuan.luu@design.com', role: 'user', department: 'Design', position: 'UI/UX Designer' },
      { name: 'Cao Văn Tuấn', email: 'tuan.cao@design.com', role: 'user', department: 'Design', position: 'Graphic Designer' },
      { name: 'Đỗ Thị Linh', email: 'linh.do@design.com', role: 'user', department: 'Design', position: 'Product Designer' },
      
      // Marketing Team
      { name: 'Trịnh Văn Minh', email: 'minh.trinh@marketing.com', role: 'user', department: 'Marketing', position: 'Digital Marketing Manager' },
      { name: 'Phan Thị Thu', email: 'thu.phan@marketing.com', role: 'user', department: 'Marketing', position: 'Content Creator' },
      { name: 'Vũ Văn Tài', email: 'tai.vu@marketing.com', role: 'user', department: 'Marketing', position: 'SEO Specialist' },
      { name: 'Kiều Thị Nga', email: 'nga.kieu@marketing.com', role: 'user', department: 'Marketing', position: 'Social Media Manager' },
      
      // Sales Team
      { name: 'Hồ Văn Thắng', email: 'thang.ho@sales.com', role: 'user', department: 'Sales', position: 'Sales Manager' },
      { name: 'Lại Thị Yến', email: 'yen.lai@sales.com', role: 'user', department: 'Sales', position: 'Sales Representative' },
      { name: 'Mạc Văn Đạt', email: 'dat.mac@sales.com', role: 'user', department: 'Sales', position: 'Business Developer' },
      
      // HR Team
      { name: 'Đào Thị Vân', email: 'van.dao@hr.com', role: 'user', department: 'Human Resources', position: 'HR Manager' },
      { name: 'Tô Văn Bình', email: 'binh.to@hr.com', role: 'user', department: 'Human Resources', position: 'Recruiter' },
      
      // Finance Team
      { name: 'Chu Thị Oanh', email: 'oanh.chu@finance.com', role: 'user', department: 'Finance', position: 'Financial Analyst' },
      { name: 'Dương Văn Khôi', email: 'khoi.duong@finance.com', role: 'user', department: 'Finance', position: 'Accountant' },
      
      // Operations Team
      { name: 'Hàn Thị Bích', email: 'bich.han@ops.com', role: 'user', department: 'Operations', position: 'Operations Manager' },
      { name: 'Lộc Văn Tùng', email: 'tung.loc@ops.com', role: 'user', department: 'Operations', position: 'System Administrator' },
      
      // Interns and Junior Staff
      { name: 'Nguyễn Thị Thảo', email: 'thao.nguyen@intern.com', role: 'user', department: 'Development', position: 'Frontend Intern' },
      { name: 'Lê Văn Hiếu', email: 'hieu.le@intern.com', role: 'user', department: 'Development', position: 'Backend Intern' },
      { name: 'Trương Thị Ly', email: 'ly.truong@intern.com', role: 'user', department: 'Design', position: 'Design Intern' },
      { name: 'Phùng Văn Đông', email: 'dong.phung@intern.com', role: 'user', department: 'Marketing', position: 'Marketing Intern' },
      
      // Contractors and Freelancers
      { name: 'Đinh Thị Cẩm', email: 'cam.dinh@freelance.com', role: 'user', department: 'Development', position: 'Frontend Contractor' },
      { name: 'Vương Văn Hải', email: 'hai.vuong@freelance.com', role: 'user', department: 'Development', position: 'Mobile App Developer' },
      { name: 'Ôn Thị Mỹ', email: 'my.on@freelance.com', role: 'user', department: 'Design', position: 'Freelance Designer' },
      
      // Test users
      { name: 'Test User', email: 'test@example.com', role: 'user', department: 'Development', position: 'Test Developer' },
      { name: 'Demo User', email: 'demo@example.com', role: 'user', department: 'Development', position: 'Demo Developer' },
      { name: 'John Smith', email: 'john.smith@company.com', role: 'user', department: 'Development', position: 'International Developer' },
      { name: 'Jane Doe', email: 'jane.doe@company.com', role: 'user', department: 'Design', position: 'International Designer' },
      
      // Additional Vietnamese names for more diversity
      { name: 'Nguyễn Văn Anh', email: 'anh.nguyen@company.com', role: 'user', department: 'Development', position: 'Software Engineer' },
      { name: 'Trần Thị Bình', email: 'binh.tran@company.com', role: 'user', department: 'QA', position: 'QA Engineer' },
      { name: 'Lê Văn Cường', email: 'cuong.le@company.com', role: 'user', department: 'DevOps', position: 'DevOps Engineer' },
      { name: 'Phạm Thị Dung', email: 'dung.pham@company.com', role: 'user', department: 'Design', position: 'UX Researcher' },
      { name: 'Hoàng Văn Em', email: 'em.hoang@company.com', role: 'user', department: 'Backend', position: 'API Developer' },
      { name: 'Vũ Thị Phương', email: 'phuong.vu@company.com', role: 'user', department: 'Frontend', position: 'React Developer' },
      { name: 'Đỗ Văn Giang', email: 'giang.do@company.com', role: 'user', department: 'Mobile', position: 'iOS Developer' },
      { name: 'Bùi Thị Hạnh', email: 'hanh.bui@company.com', role: 'user', department: 'Mobile', position: 'Android Developer' },
      { name: 'Lý Văn Ích', email: 'ich.ly@company.com', role: 'user', department: 'Data', position: 'Data Analyst' },
      { name: 'Đinh Thị Kiều', email: 'kieu.dinh@company.com', role: 'user', department: 'Security', position: 'Security Engineer' }
    ];

    const users = await User.insertMany(
      usersData.map(userData => ({
        ...userData,
        password: hashedPassword, // TẤT CẢ ĐỀU LÀ Password123
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=random`,
        phone: `+84${Math.floor(Math.random() * 900000000) + 100000000}`,
        address: `${Math.floor(Math.random() * 999) + 1} Đường ABC, Quận ${Math.floor(Math.random() * 12) + 1}, TP.HCM`,
        createdAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000) // Random date within last 180 days
      }))
    );
    console.log(`✅ Created ${users.length} users (Password: Password123 for all)`);

    // Create comprehensive teams with realistic structures
    console.log('Creating teams...');
    const teamsData = [
      {
        name: 'Nhóm Phát Triển Web Frontend',
        description: 'Team chuyên phát triển giao diện người dùng và trải nghiệm người dùng cho các ứng dụng web sử dụng React, Vue.js, Angular',
        members: [
          { user: users[2]._id, role: 'leader' },   // Nguyễn Tấn Long
          { user: users[5]._id, role: 'member' },   // Lê Minh Quân
          { user: users[6]._id, role: 'member' },   // Phạm Thanh Hương
          { user: users[30]._id, role: 'member' },  // Nguyễn Thị Thảo (Intern)
          { user: users[34]._id, role: 'member' },  // Đinh Thị Cẩm (Contractor)
          { user: users[45]._id, role: 'member' }   // Vũ Thị Phương (React Dev)
        ]
      },
      {
        name: 'Nhóm Phát Triển Backend & API',
        description: 'Team phát triển API, database, microservices và các service backend cho hệ thống sử dụng Node.js, Python, Java',
        members: [
          { user: users[3]._id, role: 'leader' },   // Trần Ngọc Thế
          { user: users[9]._id, role: 'member' },   // Bùi Văn Hùng
          { user: users[31]._id, role: 'member' },  // Lê Văn Hiếu (Intern)
          { user: users[8]._id, role: 'member' },   // Đặng Thị Lan (DevOps)
          { user: users[44]._id, role: 'member' }   // Hoàng Văn Em (API Dev)
        ]
      },
      {
        name: 'Nhóm Full Stack Development',
        description: 'Team phát triển end-to-end cho các dự án phức tạp, xử lý cả frontend và backend',
        members: [
          { user: users[4]._id, role: 'leader' },   // Trần Đại Việt
          { user: users[7]._id, role: 'member' },   // Võ Hoàng Nam (Mobile)
          { user: users[35]._id, role: 'member' },  // Vương Văn Hải (Mobile Contractor)
          { user: users[40]._id, role: 'member' }   // Nguyễn Văn Anh
        ]
      },
      {
        name: 'Nhóm Mobile Development',
        description: 'Team chuyên phát triển ứng dụng di động iOS và Android',
        members: [
          { user: users[7]._id, role: 'leader' },   // Võ Hoàng Nam
          { user: users[46]._id, role: 'member' },  // Đỗ Văn Giang (iOS)
          { user: users[47]._id, role: 'member' },  // Bùi Thị Hạnh (Android)
          { user: users[35]._id, role: 'member' }   // Vương Văn Hải (Mobile Contractor)
        ]
      },
      {
        name: 'Nhóm Kiểm Thử Chất Lượng (QA)',
        description: 'Team đảm bảo chất lượng sản phẩm thông qua testing manual, automation và performance testing',
        members: [
          { user: users[10]._id, role: 'leader' },  // Hoàng Thị Mai
          { user: users[11]._id, role: 'member' },  // Lý Văn Đức (Automation)
          { user: users[12]._id, role: 'member' },  // Ngô Thị Hoa (Manual)
          { user: users[13]._id, role: 'member' },  // Đinh Văn Sơn (Performance)
          { user: users[41]._id, role: 'member' }   // Trần Thị Bình
        ]
      },
      {
        name: 'Nhóm Thiết Kế UI/UX',
        description: 'Team thiết kế giao diện người dùng, trải nghiệm người dùng và nghiên cứu người dùng',
        members: [
          { user: users[14]._id, role: 'leader' },  // Lưu Thị Xuân
          { user: users[15]._id, role: 'member' },  // Cao Văn Tuấn (Graphic)
          { user: users[16]._id, role: 'member' },  // Đỗ Thị Linh (Product)
          { user: users[32]._id, role: 'member' },  // Trương Thị Ly (Intern)
          { user: users[36]._id, role: 'member' },  // Ôn Thị Mỹ (Freelancer)
          { user: users[43]._id, role: 'member' }   // Phạm Thị Dung (UX Research)
        ]
      },
      {
        name: 'Nhóm Marketing Digital',
        description: 'Team marketing và quảng bá sản phẩm bao gồm SEO, SEM, Social Media, Content Marketing',
        members: [
          { user: users[17]._id, role: 'leader' },  // Trịnh Văn Minh
          { user: users[18]._id, role: 'member' },  // Phan Thị Thu (Content)
          { user: users[19]._id, role: 'member' },  // Vũ Văn Tài (SEO)
          { user: users[20]._id, role: 'member' },  // Kiều Thị Nga (Social Media)
          { user: users[33]._id, role: 'member' }   // Phùng Văn Đông (Intern)
        ]
      },
      {
        name: 'Nhóm Kinh Doanh & Bán Hàng',
        description: 'Team phát triển kinh doanh, bán hàng và quan hệ khách hàng',
        members: [
          { user: users[21]._id, role: 'leader' },  // Hồ Văn Thắng
          { user: users[22]._id, role: 'member' },  // Lại Thị Yến
          { user: users[23]._id, role: 'member' }   // Mạc Văn Đạt
        ]
      },
      {
        name: 'Nhóm DevOps & Hạ tầng',
        description: 'Team quản lý hạ tầng, triển khai ứng dụng và monitoring hệ thống',
        members: [
          { user: users[8]._id, role: 'leader' },   // Đặng Thị Lan
          { user: users[29]._id, role: 'member' },  // Lộc Văn Tùng
          { user: users[42]._id, role: 'member' }   // Lê Văn Cường
        ]
      },
      {
        name: 'Nhóm Hỗ Trợ & Vận Hành',
        description: 'Team vận hành hệ thống, hỗ trợ khách hàng và quản lý nhân sự',
        members: [
          { user: users[28]._id, role: 'leader' },  // Hàn Thị Bích
          { user: users[24]._id, role: 'member' },  // Đào Thị Vân (HR)
          { user: users[25]._id, role: 'member' },  // Tô Văn Bình (HR)
          { user: users[26]._id, role: 'member' },  // Chu Thị Oanh (Finance)
          { user: users[27]._id, role: 'member' }   // Dương Văn Khôi (Finance)
        ]
      },
      {
        name: 'Nhóm Data & Analytics',
        description: 'Team phân tích dữ liệu, machine learning và business intelligence',
        members: [
          { user: users[48]._id, role: 'leader' },  // Lý Văn Ích (Data Analyst)
          { user: users[1]._id, role: 'member' }    // Trần Thị Quản Lý (Manager support)
        ]
      },
      {
        name: 'Nhóm Bảo Mật & Security',
        description: 'Team đảm bảo an ninh thông tin và bảo mật hệ thống',
        members: [
          { user: users[49]._id, role: 'leader' },  // Đinh Thị Kiều (Security Engineer)
          { user: users[0]._id, role: 'member' }    // Admin user
        ]
      }
    ];

    const teams = await Team.insertMany(
      teamsData.map(teamData => ({
        ...teamData,
        teamLead: teamData.members.find(m => m.role === 'leader')?.user,
        createdAt: new Date(Date.now() - Math.random() * 120 * 24 * 60 * 60 * 1000) // Random date within last 120 days
      }))
    );
    console.log(`✅ Created ${teams.length} teams`);

    // Create diverse and realistic projects
    console.log('Creating projects...');
    const projectsData = [
      // Large Scale Projects
      {
        name: 'TaskManager Pro - Enterprise Edition',
        description: 'Nâng cấp hệ thống quản lý task hiện tại thành phiên bản enterprise với các tính năng advanced như AI-powered task scheduling, advanced analytics, real-time collaboration, và enterprise security features',
        team: teams[0]._id, // Frontend team
        status: 'in_progress',
        priority: 'High',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2025-12-30'),
        budget: 2000000000, // 2 tỷ VNĐ
        progress: 65,
        tags: ['React', 'TypeScript', 'Enterprise', 'AI', 'Analytics']
      },
      {
        name: 'Microservices Architecture Migration',
        description: 'Migration từ monolithic architecture sang microservices architecture để improve scalability và maintainability. Bao gồm API Gateway, Service Discovery, và Container Orchestration',
        team: teams[1]._id, // Backend team
        status: 'in_progress',
        priority: 'High',
        startDate: new Date('2024-03-01'),
        endDate: new Date('2025-10-31'),
        budget: 1500000000, // 1.5 tỷ VNĐ
        progress: 45,
        tags: ['Microservices', 'Docker', 'Kubernetes', 'API Gateway', 'Node.js']
      },
      {
        name: 'Mobile App Ecosystem',
        description: 'Phát triển ecosystem ứng dụng mobile hoàn chỉnh bao gồm iOS app, Android app, và cross-platform solutions. Tích hợp with wearables và IoT devices',
        team: teams[3]._id, // Mobile team
        status: 'in_progress',
        priority: 'High',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2025-11-30'),
        budget: 1800000000, // 1.8 tỷ VNĐ
        progress: 35,
        tags: ['React Native', 'Swift', 'Kotlin', 'Flutter', 'IoT']
      },
      {
        name: 'AI-Powered Analytics Platform',
        description: 'Xây dựng platform phân tích dữ liệu sử dụng AI/ML để provide insights về productivity, performance prediction, và automated reporting',
        team: teams[10]._id, // Data team
        status: 'planning',
        priority: 'Medium',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-09-30'),
        budget: 1200000000, // 1.2 tỷ VNĐ
        progress: 10,
        tags: ['Machine Learning', 'Python', 'TensorFlow', 'Data Science', 'Analytics']
      },
      
      // Mid-size Projects
      {
        name: 'Comprehensive Testing Automation Suite',
        description: 'Xây dựng framework tự động hóa testing toàn diện bao gồm unit testing, integration testing, E2E testing, performance testing, và security testing',
        team: teams[4]._id, // QA team
        status: 'in_progress',
        priority: 'Medium',
        startDate: new Date('2024-04-15'),
        endDate: new Date('2025-08-31'),
        budget: 800000000, // 800 triệu VNĐ
        progress: 70,
        tags: ['Selenium', 'Jest', 'Cypress', 'JMeter', 'Automation']
      },
      {
        name: 'Design System & Component Library',
        description: 'Thiết kế và phát triển design system toàn diện với component library, style guides, và design tokens để ensure consistency across all products',
        team: teams[5]._id, // Design team
        status: 'in_progress',
        priority: 'Medium',
        startDate: new Date('2024-05-01'),
        endDate: new Date('2025-07-31'),
        budget: 600000000, // 600 triệu VNĐ
        progress: 55,
        tags: ['Design System', 'Figma', 'Storybook', 'Component Library', 'UI/UX']
      },
      {
        name: 'Digital Marketing Automation Platform',
        description: 'Platform tự động hóa marketing campaigns bao gồm email marketing, social media scheduling, lead nurturing, và customer journey mapping',
        team: teams[6]._id, // Marketing team
        status: 'in_progress',
        priority: 'Medium',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2025-12-31'),
        budget: 900000000, // 900 triệu VNĐ
        progress: 40,
        tags: ['Marketing Automation', 'Email Marketing', 'CRM', 'Analytics', 'Lead Generation']
      },
      {
        name: 'Customer Relationship Management System',
        description: 'Hệ thống CRM toàn diện để quản lý customer lifecycle, sales pipeline, customer support, và business intelligence',
        team: teams[7]._id, // Sales team
        status: 'planning',
        priority: 'Medium',
        startDate: new Date('2025-02-01'),
        endDate: new Date('2025-11-30'),
        budget: 1000000000, // 1 tỷ VNĐ
        progress: 15,
        tags: ['CRM', 'Sales Pipeline', 'Customer Support', 'Business Intelligence']
      },
      {
        name: 'Cloud Infrastructure Modernization',
        description: 'Modernization toàn bộ cloud infrastructure với focus vào scalability, security, cost optimization, và disaster recovery',
        team: teams[8]._id, // DevOps team
        status: 'in_progress',
        priority: 'High',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-06-30'),
        budget: 1100000000, // 1.1 tỷ VNĐ
        progress: 80,
        tags: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'DevOps']
      },
      
      // Smaller Projects
      {
        name: 'Real-time Chat & Collaboration Features',
        description: 'Tích hợp real-time chat, video calls, screen sharing, và collaborative editing vào platform',
        team: teams[2]._id, // Full Stack team
        status: 'completed',
        priority: 'Medium',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-08-31'),
        budget: 400000000, // 400 triệu VNĐ
        progress: 100,
        tags: ['WebRTC', 'Socket.io', 'Real-time', 'Collaboration', 'Chat']
      },
      {
        name: 'Advanced Security & Compliance',
        description: 'Implementation các security measures advanced bao gồm multi-factor authentication, encryption, audit logging, và compliance với GDPR/SOC2',
        team: teams[11]._id, // Security team
        status: 'in_progress',
        priority: 'High',
        startDate: new Date('2024-07-01'),
        endDate: new Date('2025-05-31'),
        budget: 500000000, // 500 triệu VNĐ
        progress: 60,
        tags: ['Security', 'Compliance', 'Encryption', 'MFA', 'Audit']
      },
      {
        name: 'Performance Optimization Initiative',
        description: 'Comprehensive performance optimization cho tất cả applications bao gồm frontend optimization, database tuning, caching strategies',
        team: teams[2]._id, // Full Stack team
        status: 'in_progress',
        priority: 'Medium',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-04-30'),
        budget: 300000000, // 300 triệu VNĐ
        progress: 25,
        tags: ['Performance', 'Optimization', 'Caching', 'Database', 'Frontend']
      },
      {
        name: 'API Documentation & Developer Portal',
        description: 'Xây dựng comprehensive API documentation và developer portal với interactive examples, SDKs, và community features',
        team: teams[1]._id, // Backend team
        status: 'completed',
        priority: 'Low',
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-09-30'),
        budget: 200000000, // 200 triệu VNĐ
        progress: 100,
        tags: ['API Documentation', 'Developer Portal', 'SDK', 'Documentation']
      },
      {
        name: 'Internationalization (i18n) Implementation',
        description: 'Implementation đa ngôn ngữ và localization cho tất cả products để support global expansion',
        team: teams[0]._id, // Frontend team
        status: 'planning',
        priority: 'Low',
        startDate: new Date('2025-03-01'),
        endDate: new Date('2025-08-31'),
        budget: 250000000, // 250 triệu VNĐ
        progress: 5,
        tags: ['Internationalization', 'Localization', 'Multi-language', 'Global']
      },
      {
        name: 'Employee Training & Development Platform',
        description: 'Platform internal để training employees về new technologies, best practices, và professional development',
        team: teams[9]._id, // Support team
        status: 'planning',
        priority: 'Low',
        startDate: new Date('2025-04-01'),
        endDate: new Date('2025-10-31'),
        budget: 150000000, // 150 triệu VNĐ
        progress: 0,
        tags: ['Training', 'Education', 'HR', 'Professional Development']
      }
    ];

    const projects = await Project.insertMany(
      projectsData.map(projectData => ({
        ...projectData,
        createdAt: new Date(Date.now() - Math.random() * 150 * 24 * 60 * 60 * 1000), // Random date within last 150 days
        updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)  // Random recent update
      }))
    );
    console.log(`✅ Created ${projects.length} projects`);

    // Create comprehensive and realistic tasks
    console.log('Creating tasks...');
    const taskStatuses = ['todo', 'in-progress', 'review', 'done'];
    const taskPriorities = ['low', 'medium', 'high', 'urgent'];
    
    const tasksData = [];
    
    // Generate tasks for each project
    for (let i = 0; i < projects.length; i++) {
      const project = projects[i];
      const team = teams.find(t => t._id.toString() === project.team.toString());
      const teamMembers = team.members.map(m => m.user);
      
      // Number of tasks per project (varies based on project size)
      const taskCount = Math.floor(Math.random() * 20) + 10; // 10-30 tasks per project
      
      for (let j = 0; j < taskCount; j++) {
        const assignee = teamMembers[Math.floor(Math.random() * teamMembers.length)];
        const creator = teamMembers[Math.floor(Math.random() * teamMembers.length)];
        const status = taskStatuses[Math.floor(Math.random() * taskStatuses.length)];
        const priority = taskPriorities[Math.floor(Math.random() * taskPriorities.length)];
        
        // Generate realistic task titles and descriptions based on project type
        const taskTitles = [
          `Implement ${project.tags?.[0] || 'feature'} integration for ${project.name}`,
          `Design UI components for ${project.name}`,
          `Setup ${project.tags?.[1] || 'infrastructure'} for ${project.name}`,
          `Write unit tests for ${project.name} modules`,
          `Create API endpoints for ${project.name}`,
          `Optimize performance for ${project.name}`,
          `Implement security measures for ${project.name}`,
          `Create documentation for ${project.name}`,
          `Setup monitoring and logging for ${project.name}`,
          `Implement data migration for ${project.name}`,
          `Create user authentication system`,
          `Design responsive layouts`,
          `Implement real-time notifications`,
          `Setup CI/CD pipeline`,
          `Create admin dashboard`,
          `Implement search functionality`,
          `Setup database optimization`,
          `Create mobile-responsive design`,
          `Implement file upload system`,
          `Setup error tracking and monitoring`
        ];
        
        const title = taskTitles[Math.floor(Math.random() * taskTitles.length)];
        const description = `Chi tiết implementation cho task: ${title}. Bao gồm research, design, development, testing và deployment. Cần coordinate với team members và ensure code quality standards.`;
        
        tasksData.push({
          title,
          description,
          project: project._id,
          assignee,
          creator,
          status,
          priority,
          dueDate: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000), // Due within next 90 days
          estimatedHours: Math.floor(Math.random() * 40) + 8, // 8-48 hours
          tags: project.tags?.slice(0, 2) || ['task'],
          createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000), // Created within last 60 days
          updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)   // Updated within last week
        });
      }
    }

    const tasks = await Task.insertMany(tasksData);
    console.log(`✅ Created ${tasks.length} tasks`);

    // Create subtasks for some tasks
    console.log('Creating subtasks...');
    const subtasksData = [];
    
    // Create 2-5 subtasks for each task (for about 30% of tasks)
    const tasksWithSubtasks = tasks.filter(() => Math.random() < 0.3);
    
    for (const task of tasksWithSubtasks) {
      const subtaskCount = Math.floor(Math.random() * 4) + 2; // 2-5 subtasks
      
      for (let i = 0; i < subtaskCount; i++) {
        const subtaskTitles = [
          'Research và phân tích requirements',
          'Thiết kế solution architecture',
          'Implement core functionality',
          'Write unit tests',
          'Create integration tests',
          'Code review và refactoring',
          'Documentation và comments',
          'Testing và debugging',
          'Performance optimization',
          'Deployment preparation'
        ];
        
        subtasksData.push({
          title: subtaskTitles[Math.floor(Math.random() * subtaskTitles.length)],
          description: `Subtask chi tiết cho task: ${task.title}`,
          task: task._id,
          completed: Math.random() < 0.6, // 60% chance of being completed
          createdAt: new Date(task.createdAt.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000),
          updatedAt: new Date()
        });
      }
    }

    const subtasks = await SubTask.insertMany(subtasksData);
    console.log(`✅ Created ${subtasks.length} subtasks`);

    // Create realistic comments
    console.log('Creating comments...');
    const commentsData = [];
    
    const commentTemplates = [
      'Tôi đã hoàn thành phần implementation này. Các bạn có thể review được không?',
      'Có vấn đề về performance ở đây, cần optimize thêm.',
      'Documentation đã được update, mọi người check lại nhé.',
      'Cần thêm validation cho input này.',
      'UI/UX team feedback là cần adjust màu sắc và spacing.',
      'API response time hơi chậm, có thể cache được không?',
      'Unit tests đã pass hết, ready cho integration testing.',
      'Có conflict với branch develop, cần resolve.',
      'Client feedback positive về feature này.',
      'Cần thêm error handling cho edge cases.',
      'Code review comments đã được address.',
      'Database migration script đã ready.',
      'Security scan detected một số issues cần fix.',
      'Cross-browser testing completed, works well.',
      'Mobile responsive test passed.',
      'Load testing results show good performance.',
      'Integration với third-party API successful.',
      'User acceptance testing feedback received.',
      'Deployment to staging environment successful.',
      'Production deployment scheduled for next week.'
    ];
    
    // Add comments to about 70% of tasks
    const tasksWithComments = tasks.filter(() => Math.random() < 0.7);
    
    for (const task of tasksWithComments) {
      const team = teams.find(t => t._id.toString() === task.project.toString());
      const teamMembers = team?.members?.map(m => m.user) || [task.assignee, task.creator];
      const commentCount = Math.floor(Math.random() * 5) + 1; // 1-5 comments per task
      
      for (let i = 0; i < commentCount; i++) {
        const author = teamMembers[Math.floor(Math.random() * teamMembers.length)];
        const content = commentTemplates[Math.floor(Math.random() * commentTemplates.length)];
        
        commentsData.push({
          content,
          task: task._id,
          author,
          likes: Math.floor(Math.random() * 5), // 0-4 likes
          createdAt: new Date(task.createdAt.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000),
          updatedAt: new Date()
        });
      }
    }

    const comments = await Comment.insertMany(commentsData);
    console.log(`✅ Created ${comments.length} comments`);

    // Create time logs
    console.log('Creating time logs...');
    const timeLogsData = [];
    
    // Create time logs for about 50% of tasks
    const tasksWithTimeLogs = tasks.filter(() => Math.random() < 0.5);
    
    for (const task of tasksWithTimeLogs) {
      const logCount = Math.floor(Math.random() * 8) + 2; // 2-9 time logs per task
      
      for (let i = 0; i < logCount; i++) {
        const activities = [
          'Research và phân tích requirements',
          'Coding và implementation',
          'Testing và debugging',
          'Code review',
          'Documentation',
          'Meeting và discussion',
          'Bug fixing',
          'Performance optimization',
          'Refactoring',
          'Integration testing'
        ];
        
        timeLogsData.push({
          user: task.assignee,
          task: task._id,
          description: activities[Math.floor(Math.random() * activities.length)],
          duration: Math.floor(Math.random() * 480) + 30, // 30 minutes to 8 hours
          date: new Date(task.createdAt.getTime() + Math.random() * 20 * 24 * 60 * 60 * 1000),
          createdAt: new Date()
        });
      }
    }

    const timeLogs = await TimeLog.insertMany(timeLogsData);
    console.log(`✅ Created ${timeLogs.length} time logs`);

    // Create notifications
    console.log('Creating notifications...');
    const notificationsData = [];
    
    const notificationTypes = [
      'task_assigned',
      'task_updated',
      'task_completed',
      'comment_added',
      'project_updated',
      'deadline_approaching',
      'team_invitation',
      'mention'
    ];
    
    const notificationMessages = {
      task_assigned: 'Bạn đã được assign task mới',
      task_updated: 'Task đã được cập nhật',
      task_completed: 'Task đã được hoàn thành',
      comment_added: 'Có comment mới trên task của bạn',
      project_updated: 'Project đã được cập nhật',
      deadline_approaching: 'Task sắp đến deadline',
      team_invitation: 'Bạn được mời vào team mới',
      mention: 'Bạn được mention trong comment'
    };
    
    // Create notifications for users
    for (let i = 0; i < 200; i++) { // 200 notifications
      const user = users[Math.floor(Math.random() * users.length)];
      const type = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
      const relatedTask = tasks[Math.floor(Math.random() * tasks.length)];
      
      notificationsData.push({
        user: user._id,
        type,
        message: notificationMessages[type],
        relatedTask: relatedTask._id,
        read: Math.random() < 0.6, // 60% chance of being read
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Within last 30 days
      });
    }

    const notifications = await Notification.insertMany(notificationsData);
    console.log(`✅ Created ${notifications.length} notifications`);

    // Create activity logs
    console.log('Creating activity logs...');
    const activityLogsData = [];
    
    const actions = [
      'task_created',
      'task_updated',
      'task_completed',
      'task_deleted',
      'comment_added',
      'project_created',
      'project_updated',
      'team_created',
      'team_updated',
      'user_joined',
      'subtask_created',
      'subtask_completed'
    ];
    
    // Create activity logs for various actions
    for (let i = 0; i < 500; i++) { // 500 activity logs
      const user = users[Math.floor(Math.random() * users.length)];
      const action = actions[Math.floor(Math.random() * actions.length)];
      const relatedTask = tasks[Math.floor(Math.random() * tasks.length)];
      const relatedProject = projects[Math.floor(Math.random() * projects.length)];
      
      activityLogsData.push({
        user: user._id,
        action,
        entityType: action.includes('task') ? 'Task' : action.includes('project') ? 'Project' : 'Team',
        entityId: action.includes('task') ? relatedTask._id : relatedProject._id,
        description: `${user.name} ${action.replace('_', ' ')} ${action.includes('task') ? relatedTask.title : relatedProject.name}`,
        metadata: {
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          ip: `192.168.1.${Math.floor(Math.random() * 254) + 1}`
        },
        createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000) // Within last 60 days
      });
    }

    const activityLogs = await ActivityLog.insertMany(activityLogsData);
    console.log(`✅ Created ${activityLogs.length} activity logs`);

    // Print summary
    console.log('\n🎉 SEED DATA CREATION COMPLETED!');
    console.log('====================================');
    console.log(`👥 Users: ${users.length} (Password: Password123 for ALL users)`);
    console.log(`👫 Teams: ${teams.length}`);
    console.log(`📊 Projects: ${projects.length}`);
    console.log(`📋 Tasks: ${tasks.length}`);
    console.log(`📝 Subtasks: ${subtasks.length}`);
    console.log(`💬 Comments: ${comments.length}`);
    console.log(`⏰ Time Logs: ${timeLogs.length}`);
    console.log(`🔔 Notifications: ${notifications.length}`);
    console.log(`📈 Activity Logs: ${activityLogs.length}`);
    console.log('====================================');
    
    // Sample users for testing
    console.log('\n📋 SAMPLE USERS FOR TESTING:');
    console.log('Email: admin@taskmanager.com (Admin)');
    console.log('Email: long.nguyen@dev.com (Frontend Lead)');
    console.log('Email: the.tran@dev.com (Backend Lead)');
    console.log('Email: test@example.com (Test User)');
    console.log('Password: Password123 (for ALL users)');
    
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  }
};

// Run the seed script
const runSeed = async () => {
  await connectDB();
  await seedData();
  mongoose.connection.close();
  console.log('\n✅ Database connection closed. Seed completed!');
};

runSeed();

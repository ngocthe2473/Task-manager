const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Team = require('./models/Team');
const User = require('./models/User');

// Load env vars
dotenv.config();

// Connect to DB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/TaskDB');
    console.log('MongoDB connected...');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err.message);
    process.exit(1);
  }
};

const seedTeams = async () => {
  try {
    await connectDB();
    
    // Find existing users
    const users = await User.find({}).limit(3);
    if (users.length === 0) {
      console.log('No users found. Please run the main seed script first.');
      return;
    }
    
    console.log(`Found ${users.length} users`);
    
    // Delete existing teams
    await Team.deleteMany({});
    console.log('Deleted existing teams');
    
    // Create sample teams
    const teams = [
      {
        name: 'Frontend Development Team',
        description: 'Team responsible for UI/UX development and frontend architecture',
        members: [
          { user: users[0]._id, role: 'leader', joinedAt: new Date() },
          ...(users[1] ? [{ user: users[1]._id, role: 'member', joinedAt: new Date() }] : [])
        ]
      },
      {
        name: 'Backend Development Team',
        description: 'Team handling server-side development and API design',
        members: [
          { user: users[0]._id, role: 'member', joinedAt: new Date() },
          ...(users[2] ? [{ user: users[2]._id, role: 'leader', joinedAt: new Date() }] : [])
        ]
      }
    ];
    
    if (users.length >= 2) {
      teams.push({
        name: 'QA Testing Team',
        description: 'Quality assurance and testing team',
        members: [
          { user: users[1]._id, role: 'leader', joinedAt: new Date() },
          ...(users[2] ? [{ user: users[2]._id, role: 'member', joinedAt: new Date() }] : [])
        ]
      });
    }
    
    // Insert teams
    const createdTeams = await Team.insertMany(teams);
    console.log(`${createdTeams.length} teams created successfully`);
    
    // Display created teams
    createdTeams.forEach((team, index) => {
      console.log(`Team ${index + 1}: ${team.name} (${team.members.length} members)`);
    });
    
    console.log('Teams seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding teams:', error);
    process.exit(1);
  }
};

seedTeams();

const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    team_role: {
      type: String,
      enum: ['leader', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Find team leaders
TeamSchema.methods.getLeaders = function() {
  return this.members.filter(member => member.team_role === 'leader').map(member => member.user);
};

// Check if a user is in the team
TeamSchema.methods.isMember = function(userId) {
  return this.members.some(member => member.user.toString() === userId.toString());
};

// Check if a user is a team leader
TeamSchema.methods.isLeader = function(userId) {
  return this.members.some(
    member => member.user.toString() === userId.toString() && member.team_role === 'leader'
  );
};

// Add a member to the team
TeamSchema.methods.addMember = function(userId, role = 'member') {
  if (!this.isMember(userId)) {
    this.members.push({
      user: userId,
      team_role: role
    });
  }
  return this;
};

// Change a member's role
TeamSchema.methods.changeRole = function(userId, newRole) {
  const memberIndex = this.members.findIndex(member => 
    member.user.toString() === userId.toString()
  );
  
  if (memberIndex !== -1) {
    this.members[memberIndex].team_role = newRole;
  }
  return this;
};

module.exports = mongoose.model('Team', TeamSchema);
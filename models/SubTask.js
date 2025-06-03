const mongoose = require('mongoose');

const subTaskSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String 
  },
  parentTask: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Task', 
    required: true 
  },
  assignee: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },  status: { 
    type: String, 
    enum: ['todo', 'in_progress', 'done'], 
    default: 'todo' 
  },
  completed: {
    type: Boolean,
    default: false
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high'], 
    default: 'medium' 
  },
  dueDate: { 
    type: Date 
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Middleware để cập nhật updatedAt
subTaskSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('SubTask', subTaskSchema);

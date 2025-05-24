const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['todo', 'inprogress', 'review', 'done'],
    default: 'todo'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  dueDate: {
    type: Date
  },
  startTime: {
    type: String
  },
  endTime: {
    type: String
  },
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
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

TaskSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Thêm phương thức để lấy subtasks
TaskSchema.methods.getSubtasks = function() {
  return mongoose.model('Task').find({ parentTask: this._id });
};

// Thêm phương thức kiểm tra xem task có phải là subtask không
TaskSchema.methods.isSubtask = function() {
  return this.parentTask !== null;
};

// Thêm virtual field để hiển thị có subtasks hay không
TaskSchema.virtual('hasSubtasks').get(async function() {
  const count = await mongoose.model('Task').countDocuments({ parentTask: this._id });
  return count > 0;
});

module.exports = mongoose.model('Task', TaskSchema);
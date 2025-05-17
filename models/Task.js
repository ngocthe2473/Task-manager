const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['todo', 'in_progress', 'done'],
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
  // Thêm trường để hỗ trợ subtasks
  parentTask: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    default: null
  },
  // Mảng attachments cho task
  attachments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Attachment'
  }],
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
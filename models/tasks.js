const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  project: {
    type: String,
    required: true
  },
  worker: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    required: true
  },
  comment: {
    type: String,
    required: false
  },
  startDate: {
    type: String,
    required: true
  },
  endDate: {
    type: String,
    required: true
  }
});

const Tasks = mongoose.model('Tasks', TaskSchema);

module.exports = Tasks;

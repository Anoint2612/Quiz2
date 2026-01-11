const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  email: {
    type: String,
    default: null
  },
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  questions: {
    type: Array,
    default: []
  },
  answers: {
    type: Map,
    of: String,
    default: {}
  },
  visitedQuestions: {
    type: [Number],
    default: []
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date,
    default: null
  },
  submitted: {
    type: Boolean,
    default: false
  },
  score: {
    type: Number,
    default: 0
  },
  timeTaken: {
    type: Number,
    default: 0
  },
  totalQuestions: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Quiz', QuizSchema);

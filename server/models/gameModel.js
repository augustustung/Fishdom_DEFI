const mongoose = require('mongoose')

const scoreSchema = mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    // ref: 'User',
    required: true
  },
  score: {
    type: Number,
    default: 0
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('Score', scoreSchema)
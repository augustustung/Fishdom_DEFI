const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 15
  },
  password: {
    type: String,
    required: true
  },
  playTurn: {
    type: Number,
    default: 0
  },
  score: {
    type: Number,
    default: 0
  },
  balance: {
    type: Number,
    default: 0
  },
  status: {
    type: Number,
    default: 1
  },
  walletAddress: {
    type: String,
    unique: true,
    default: ''
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

module.exports = mongoose.model('User', userSchema)
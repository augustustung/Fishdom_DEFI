const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
  playTurn: {
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
  },
  selectedNFT: {
    type: Number,
    default: 0
  }
})

module.exports = mongoose.model('User', userSchema)
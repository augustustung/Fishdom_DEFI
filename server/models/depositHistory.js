const mongoose = require('mongoose')

const depositHistory = mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    // ref: 'User',
    required: true
  },
  txHash: {
    type: String,
    default: 0
  },
  amount: {
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

module.exports = mongoose.model('DepositHistory', depositHistory)
const mongoose = require('mongoose')

const HavestStaking = mongoose.Schema({
  walletAddress: {
    type: String,
    default: ""
  },
  stakeId: {
    type: String,
    default: 0
  },
  txHash: {
    type: String,
    default: 0
  },
  type: {
    type: String
  },
  amount: {
    type: String,
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

module.exports = mongoose.model('HavestStaking', HavestStaking)
const mongoose = require('mongoose')

const staking = mongoose.Schema({
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
  amount: {
    type: String,
    default: 0
  },
  duration: {
    type: String,
    default: 0
  },
  apr: {
    type: String,
    default: 0
  },
  isClaimed: {
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

module.exports = mongoose.model('Staking', staking)
const mongoose = require('mongoose')

const Market = mongoose.Schema({
  seller: {
    type: String,
    required: true
  },
  amount: {
    type: String,
    default: '0'
  },
  tokenId: {
    type: Number,
    default: 0
  },
  isHidden: {
    type: Number,
    default: 0 // 1: hide, 0: show
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

module.exports = mongoose.model('Market', Market)
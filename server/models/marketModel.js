const mongoose = require('mongoose')

const Market = mongoose.Schema({
  txHash: {
    type: String,
    require: true
  },
  seller: {
    type: String,
    required: true
  },
  price: {
    type: String,
    default: '0'
  },
  tokenId: {
    type: String,
    default: 0
  },
  itemId: {
    type: String,
    default: 0
  },
  isHidden: {
    type: Number,
    default: 0 // 1: hide, 0: show || buy --> hide
  },
  isDeleted: {
    type: Number,
    default: 0 // 1: deleted, 0: show || withdraw --> delete
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
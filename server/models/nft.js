const mongoose = require('mongoose')

const nftSchema = mongoose.Schema({
  walletAddress: {
    type: String,
    required: true
  },
  nftId: {
    type: String,
    require: true
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

module.exports = mongoose.model('NFT', nftSchema)
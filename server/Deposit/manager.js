'use strict'
const functions = require('./functions');
const User = require('../models/userModel');

async function requestDepositFishdomToken(req, res) {
  let txHash = req.body.txHash;
  let userData = await User.findById(req.user._id);
  let balance = await functions.handleDepositToken(txHash, userData);
  if (balance) {
    await userData.update({
      balance: userData.balance + balance
    })
    await userData.save();
    return res.status(200).json({
      balance: userData.balance
    })
  }
  return res.status(500).json({ msg: "failed" })
}

async function requestWithdraw(req, res) {
  let userData = User.findById(req.user._id);
  let amount = req.payload.body;

  if (userData && userData.balance >= amount) {
    let withdrawRes = await functions.handleWithraw(userData.walletAddress, amount);
    if (withdrawRes) {
      await userData.update({
        balance: userData.balance - amount
      });
      await userData.save();
      return res.status(200).json({
        tx: withdrawRes,
        balance: userData.balance
      })
    }
  }
  return res.status(500).json({ msg: "failed" })
}

module.exports = {
  requestDepositFishdomToken,
  requestWithdraw
}
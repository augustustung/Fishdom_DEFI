'use strict'
const functions = require('./functions');
const User = require('../models/userModel');
const DepositHistory = require('../models/depositHistory');

async function requestDepositFishdomToken(req, res) {
  try {
    let txHash = req.body.txHash;
    let existingTx = await DepositHistory.findOne({
      txHash: txHash
    });
    if (existingTx) {
      return res.status(500).json({ msg: "EXISTING_TXHASH" })
    }
    let userData = await User.findById(req.user._id);
    let balance = await functions.handleDepositToken(txHash, userData);
    if (balance) {
      await userData.update({
        balance: userData.balance + parseFloat(balance)
      })
      await userData.save();
      await DepositHistory.create({
        userId: req.user._id,
        txHash: txHash,
        amount: parseFloat(balance)
      });
      return res.status(200).json({
        balance: userData.balance + parseFloat(balance)
      })
    }
    return res.status(500).json({ msg: "failed" })
  } catch (error) {
    return res.status(500).json({ msg: "failed" })
  }
}

async function requestWithdraw(req, res) {
  let userData = await User.findById(req.user._id);
  let amount = parseFloat(req.body.amount);
  if (userData && userData.balance >= amount) {
    let withdrawRes = await functions.handleWithraw(userData.walletAddress, amount);
    if (withdrawRes) {
      await userData.update({
        balance: userData.balance - amount
      });
      await userData.save();
      return res.status(200).json({
        tx: withdrawRes,
        balance: userData.balance - amount
      })
    }
  }
  return res.status(500).json({ msg: "failed" })
}

module.exports = {
  requestDepositFishdomToken,
  requestWithdraw
}
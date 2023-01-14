'use strict';
const StakingFunctions = require('./functions');

async function stake(req, res) {
  try {
    let data = await StakingFunctions.handleStake(req.body.txHash);
    if (data) {
      return res.status(200).json({ msg: "success" })
    } else {
      return res.status(500).json({ msg: 'failed' })
    }
  } catch (error) {
    console.error(__filename, error);
    return res.status(500).json({ msg: 'failed' })
  }
}

async function unstake(req, res) {
  try {
    let data = await StakingFunctions.handleUnstake(req.body.txHash);
    if (data) {
      return res.status(200).json({ msg: "success" })
    } else {
      return res.status(500).json({ msg: 'failed' })
    }
  } catch (error) {
    console.error(__filename, error);
    return res.status(500).json({ msg: 'failed' })
  }
}

async function claim(req, res) {
  try {
    let data = await StakingFunctions.handleClaim(req.body.txHash);
    if (data) {
      return res.status(200).json({ data: data })
    } else {
      return res.status(500).json({ msg: 'failed' })
    }
  } catch (error) {
    console.error(__filename, error);
    return res.status(500).json({ msg: 'failed' })
  }
}

async function getList(req, res) {
  try {
    let filter = req.body.filter || {};
    let skip = req.body.skip || 0;
    let limit = req.body.limit || 20;
    let order = JSON.parse(req.body.order || "{ \"createdAt\": -1 }");
    filter.isClaimed = 0;
    filter.walletAddress = req.user.walletAddress;
    let data = await StakingFunctions.handleGetList(filter, skip, limit, order);
    if (data) {
      return res.status(200).json({ data: data })
    } else {
      return res.status(500).json({ msg: 'failed' })
    }
  } catch (error) {
    console.error(__filename, error);
    return res.status(500).json({ msg: 'failed' })
  }
}

module.exports = {
  stake, unstake,
  claim, getList
}
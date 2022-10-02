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

  } catch (error) {
    console.error(__filename, error);
    return res.status(500).json({ msg: 'failed' })
  }
}

async function claim(req, res) {
  try {

  } catch (error) {
    console.error(__filename, error);
    return res.status(500).json({ msg: 'failed' })
  }
}

async function getList(req, res) {
  try {

  } catch (error) {
    console.error(__filename, error);
    return res.status(500).json({ msg: 'failed' })
  }
}

module.exports = {
  stake, unstake,
  claim, getList
}
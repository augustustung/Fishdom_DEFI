'use strict';
const HavestStakingFunction = require('./functions');

async function getList(req, res) {
  try {
    let filter = req.body.filter || {};
    let skip = req.body.skip || 0;
    let limit = req.body.limit || 20;
    let order = JSON.parse(req.body.order || "{ \"createdAt\": -1 }");
    filter.walletAddress = req.user.walletAddress;
    let data = await HavestStakingFunction.handleGetList(filter, skip, limit, order);
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
  getList
}
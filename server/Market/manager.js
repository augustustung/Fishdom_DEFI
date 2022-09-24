'use strict';
const MarketFunctions = require('./functions');

async function sellItem(req, res) {
  let txHash = req.body.txHash;
  let data = await MarketFunctions.handleSellItem(txHash, req.user._id);
  if (data) {
    return res.status(200).json({ data })
  } else {
    return res.status(500).json({ msg: "failed" });
  }
}

async function getList(req, res) {
  let filter = req.body.filter || {};
  let skip = req.body.skip || 0;
  let limit = req.body.limit || 20;
  let order = req.body.order || { createdAt: -1 };
  let data = await MarketFunctions.handleGetList(filter, skip, limit, order);
  if (data) {
    return res.status(200).json({ data })
  } else {
    return res.status(500).json({ msg: "failed" });
  }
}

async function buyItem(req, res) {
  let txHash = req.body.txHash;
  let data = await MarketFunctions.handleBuyItem(txHash, req.user._id);
  if (data) {
    return res.status(200).json({ data })
  } else {
    return res.status(500).json({ msg: "failed" });
  }
}

async function withdraw(req, res) {
  let txHash = req.body.txHash;
  let data = await MarketFunctions.handleWithdraw(txHash, req.user._id);
  if (data) {
    return res.status(200).json({ data })
  } else {
    return res.status(500).json({ msg: "failed" });
  }
}

module.exports = {
  sellItem,
  getList,
  buyItem,
  withdraw
}
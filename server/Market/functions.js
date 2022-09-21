const { ethers } = require('ethers');
require('dotenv').config();
const UtilFunctions = require('../utils');
const User = require('../models/userModel');
const Market = require('../models/marketModel');

async function _getDetailItem(provider, txHash, userData) {
  let {
    dataDecoded,
    txUncofirmed,
    txConfirmed,
    inputData
  } = await UtilFunctions.decodeTxData(provider, txHash, ['uint256', 'uint256'], ['uint256', 'uint256']);

  if (dataDecoded && dataDecoded.length > 0) {
    if (!(
      txUncofirmed.to === process.env.FISDOM_MARKET &&
      txUncofirmed.from === userData.walletAddress
    )) {
      throw "failed to decode tx";
    }
    if (!txConfirmed) {
      throw "tx not found"
    }
    return {
      seller: dataDecoded[0]._hex,
      amount: ethers.utils.formatEther(dataDecoded[1], 18),
      tokenId: parseInt(inputData[0].toString())
    }
  } else {
    throw "failed to decode tx";
  }
}

async function handleSellItem(txHash, userId) {
  if (!txHash) return undefined;
  return new Promise(async (resolve, reject) => {
    try {
      const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_ENDPOINT)
      let userData = await User.findById(userId);
      let data = await _getDetailItem(provider, txHash, userData);
      if (data) {
        await Market.create(data);
        resolve('success');
      } else {
        reject('failed');
      }
    } catch (error) {
      reject('failed');
      console.error(__filename, error);
    }
  })
}

async function handleGetList(filter, skip, limit, order) {
  return new Promise(async (resolve, reject) => {
    try {
      let data = await Market.
        find(filter).
        limit(limit).
        skip(skip).
        sort(order);
      if (data && data.length > 0) {
        let count = await Market.count(filter);
        resolve({ data: data, count: count });
      } else {
        resolve({ data: [], count: 0 });
      }
    } catch (error) {
      console.error(__filename, error);
      reject('failed');
    }
  })
}

module.exports = {
  handleSellItem,
  handleGetList
}
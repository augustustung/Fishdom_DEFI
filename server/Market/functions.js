const { ethers } = require('ethers');
require('dotenv').config();
const UtilFunctions = require('../utils');
const User = require('../models/userModel');
const Market = require('../models/marketModel');
const FishdomMarket = require('../contracts/FishdomMarket.sol/FishdomMarket.json');
const NFTModel = require('../models/nft');

async function _getDetailItem(provider, txHash, userData) {
  const {
    eventData, txUncofirmed, txConfirmed
  } = await UtilFunctions.decodeTxData(
    provider, txHash,
    [
      `event MarketItemCreated(
        uint256 indexed itemId,
        uint256 indexed tokenId,
        address seller,
        uint256 price
      )`
    ]
  );

  if (eventData && eventData.args && eventData.args.length > 0) {
    if (!(
      txUncofirmed.to === FishdomMarket.networks[97].address &&
      txUncofirmed.from.toLowerCase() === userData.walletAddress
    )) {
      throw "invalid sender";
    }
    if (!txConfirmed) {
      throw "tx not found"
    }

    return {
      itemId: eventData.args.itemId.toString(),
      tokenId: eventData.args.tokenId.toString(),
      seller: eventData.args.seller,
      price: ethers.utils.formatEther(eventData.args.price.toString(), 18)
    }
  } else {
    throw "failed to decode tx";
  }
}

async function handleSellItem(txHash, userId) {
  if (!txHash) return undefined;
  return new Promise(async (resolve, reject) => {
    try {
      let existingItem = await Market.findOne({
        txHash: txHash,
        isDeleted: 0,
        isHidden: 0
      });
      if (existingItem) {
        reject('failed');
        return;
      }
      const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_ENDPOINT);
      let userData = await User.findById(userId);

      let data = await _getDetailItem(provider, txHash, userData);
      if (data) {
        await Market.create({
          ...data,
          txHash: txHash
        });
        await NFTModel.updateOne(
          { nftId: data.tokenId },
          { walletAddress: FishdomMarket.networks[97].address }
        );
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

async function _preBuy(provider, txHash, userData) {
  const {
    eventData, txUncofirmed, txConfirmed
  } = await UtilFunctions.decodeTxData(
    provider, txHash,
    [
      `event BuyMarketItem(
        uint256 indexed itemId,
        uint256 indexed tokenId,
        uint256 price,
        address seller,
        address buyer
      )`
    ]
  );

  if (!(txConfirmed && txConfirmed.to === FishdomMarket.networks[97].address)) {
    console.log('invalid contract');
    return undefined;
  }

  if (!(txConfirmed && txConfirmed.from.toLowerCase() === userData.walletAddress)) {
    console.log('invalid buyer');
    return undefined;
  }

  if (eventData && eventData.args && eventData.args.length > 0) {
    const { args } = eventData;
    return {
      itemId: args.itemId.toString(),
      tokenId: args.tokenId.toString(),
      seller: args.seller,
      price: args.price.toString(),
      buyer: args.buyer
    }
  }
  return undefined;
}

async function handleBuyItem(txHash, userId) {
  if (!txHash) return undefined;
  return new Promise(async (resolve, reject) => {
    try {
      const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_ENDPOINT);
      let userData = await User.findById(userId);
      let data = await _preBuy(provider, txHash, userData);
      if (data) {
        await Market.updateOne(
          {
            tokenId: data.tokenId,
            itemId: data.itemId,
            seller: data.seller
          },
          {
            isHidden: 1
          }
        );

        await NFTModel.updateOne(
          { nftId: data.tokenId },
          { walletAddress: data.buyer }
        );
        resolve("success")
      } else {
        reject("failed");
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
      let commonFilter = {
        ...filter,
        isDeleted: 0,
        isHidden: 0
      };
      let data = await Market.
        find(commonFilter).
        limit(limit).
        skip(skip).
        sort(order);
      if (data && data.length > 0) {
        let count = await Market.count(commonFilter);
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

async function handleWithdraw(txHash, userId) {
  return new Promise(async (resolve, reject) => {
    try {
      const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_ENDPOINT);
      let userData = await User.findById(userId);
      const {
        eventData, txUncofirmed, txConfirmed
      } = await UtilFunctions.decodeTxData(
        provider, txHash,
        [`event WithdrawItem(
          uint256 indexed itemId,
          uint256 indexed tokenId,
          address owner
        )`]
      );

      if (!(txConfirmed && txConfirmed.to === FishdomMarket.networks[97].address)) {
        console.log('invalid contract');
        return undefined;
      }

      if (!(txConfirmed && txConfirmed.from.toLowerCase() === userData.walletAddress)) {
        console.log('invalid owner');
        return undefined;
      }

      if (eventData && eventData.args && eventData.args.length > 0) {
        const { args } = eventData;
        if (!args.owner.toLowerCase() === userData.walletAddress) {
          reject("not owner");
          return;
        } else {
          await NFTModel.updateOne(
            { nftId: args.tokenId.toString() },
            { walletAddress: args.owner.toLowerCase() }
          );
          await Market.updateOne(
            {
              tokenId: args.tokenId.toString(),
              itemId: args.itemId.toString()
            },
            {
              isDeleted: 1
            }
          );
          resolve('success');
        }
      }
    } catch (error) {
      console.error(__filename, error);
    }
  })
}


module.exports = {
  handleSellItem,
  handleGetList,
  handleBuyItem,
  handleWithdraw
}
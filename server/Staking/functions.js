require('dotenv').config()
const StakingModel = require("../models/stakingModel")
const HavestStakingModel = require("../models/havestStakingModel")
const UtilFunctions = require("../utils")
const { ethers } = require('ethers')

async function handleStake(txHash) {
  const existedItem = await StakingModel.findOne({ txHash: txHash })
  if (existedItem) {
    return undefined;
  }
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_ENDPOINT)
  const decodedData = await UtilFunctions.decodeTxData(
    provider,
    txHash,
    [`
      event Staked(
        uint256 indexed stakeId,
        address indexed owner,
        uint256 amount,
        uint256 duration,
        uint256 apr
      )
    `]
  );

  if (decodedData) {
    const res = await StakingModel.create({
      walletAddress: decodedData.eventData.args.owner.toString().toLowerCase(),
      txHash: txHash,
      amount: decodedData.eventData.args.amount.toString(),
      duration: decodedData.eventData.args.duration.toString(),
      apr: decodedData.eventData.args.apr.toString(),
      stakeId: decodedData.eventData.args.stakeId.toString()
    })
    if (res) {
      return res;
    } else {
      return undefined;
    }
  } else {
    return undefined;
  }
}

async function handleUnstake(txHash) {
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_ENDPOINT)
  const decodedData = await UtilFunctions.decodeTxData(
    provider,
    txHash,
    [`
      event Unstaked(
        uint256 indexed stakeId,
        address indexed owner,
        uint256 claimed
      )
    `]
  );
  if (decodedData) {
    const stakedData = await StakingModel.findOneAndDelete({
      walletAddress: decodedData.eventData.args.owner.toString().toLowerCase(),
      stakeId: decodedData.eventData.args.stakeId.toString()
    })
    if (!stakedData) {
      return undefined;
    }
    const claimData = await HavestStakingModel.create({
      walletAddress: decodedData.eventData.args.owner.toString().toLowerCase(),
      stakeId: decodedData.eventData.args.stakeId.toString(),
      txHash: txHash,
      type: "UNSTAKE",
      amount: decodedData.eventData.args.claimed.toString(),
    })
    if (claimData) {
      return claimData
    } else {
      return undefined
    }
  } else {
    return undefined;
  }
}

async function handleClaim(txHash) {
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_ENDPOINT)
  const decodedData = await UtilFunctions.decodeTxData(
    provider,
    txHash,
    [`
      event Claimed(
        uint256 indexed stakeId,
        address indexed owner,
        uint256 indexed amount
      )
    `]
  );

  if (decodedData) {
    const stakedData = await StakingModel.findOne({
      walletAddress: decodedData.eventData.args.owner.toString().toLowerCase(),
      stakeId: decodedData.eventData.args.stakeId.toString(),
      isClaimed: 0
    });

    if (!stakedData) {
      return undefined;
    }
    await stakedData.update({ isClaimed: 1 });
    const claimData = await HavestStakingModel.create({
      walletAddress: decodedData.eventData.args.owner.toString().toLowerCase(),
      stakeId: decodedData.eventData.args.stakeId.toString(),
      txHash: txHash,
      type: "CLAIM",
      amount: decodedData.eventData.args.amount.toString(),
    })
    if (claimData) {
      return claimData
    } else {
      return undefined
    }
  } else {
    return undefined;
  }
}

async function handleGetList(filter, skip, limit, order) {
  return new Promise(async (resolve, reject) => {
    try {
      let commonFilter = {
        ...filter
      };
      let data = await StakingModel.
        find(commonFilter).
        limit(limit).
        skip(skip).
        sort(order);
      if (data && data.length > 0) {
        let count = await StakingModel.count(commonFilter);
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
  handleStake,
  handleUnstake,
  handleClaim,
  handleGetList
}
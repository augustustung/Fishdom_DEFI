require('dotenv').config();
const router = require("express").Router();
const auth = require("../middlewares/auth");
const ScoreModel = require('../models/gameModel');
const UserModel = require('../models/userModel');
const NFTModel = require('../models/nft');
const moment = require('moment');
const path = require('path');
const { ethers } = require('ethers');
const FishdomNFT = require('../contracts/FishdomNFT.sol/FishdomNFT.json');
const UtilFunctions = require('../utils');

router.get("/leader-board", auth, async (req, res) => {
  const leaderBoardData = await ScoreModel.aggregate([
    {
      $match: {
        createdAt: {
          $gte: moment().startOf('month').toDate(),
          $lte: moment().endOf('month').toDate()
        }
      }
    },
    {
      $group: {
        _id: {
          userId: "$userId"
        },
        score: {
          "$sum": "$score"
        }
      }
    },
    {
      $sort: {
        score: -1
      }
    },
    {
      $limit: 15
    },
    {
      $project: {
        _id: 0,
        userId: "$_id.userId",
        score: {
          "$sum": "$score"
        }
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "userData"
      }
    },
    {
      "$unwind": "$userData"
    },
    {
      $project: {
        _id: 0,
        userId: "$_id.userId",
        score: {
          "$sum": "$score"
        },
        userName: "$userData.name",
        userWallet: "$userData.walletAddress"
      }
    },
  ]);

  return res.status(200).json(leaderBoardData)
});

router.post("/buy-turn", auth, async (req, res) => {
  if (!req.body.turn) {
    return res.status(500).json({ msg: "Invalid number of turns " });
  }
  const FEE = 100
  const user = await UserModel.findById(req.user._id);
  if (user.balance >= FEE * req.body.turn) {
    await user.update({
      playTurn: user.playTurn + req.body.turn,
      balance: user.balance - FEE * req.body.turn
    });
    await user.save();
    res.status(200).json({ msg: 'ok' });
  } else {
    res.status(500).json({ msg: 'over allowance' });
  }
});

router.post('/play', auth, async (req, res) => {
  const user = await UserModel.findById(req.user._id);
  if (user.playTurn === 0) {
    res.status(200).json({ msg: 'not have enough turn' });
  }
  await user.update({ playTurn: user.playTurn - 1 });
  await user.save();
  res.status(200).json({ msg: 'ok' })
});

router.post("/save-score", auth, async (req, res) => {
  if (!req.body.score) {
    return res.status(500).json({ msg: "Invalid score" })
  }
  let data = await ScoreModel.create({
    userId: req.user._id,
    score: req.body.score
  });
  let userData = await UserModel.findById(req.user._id)
  if (userData) {
    await userData.update({ balance: userData.balance + parseInt(score) })
    await userData.save();
  }
  return res.status(200).json(data);
});

router.post("/mint", auth, async (req, res) => {
  let amount = req.body.amount;
  let nftId = req.body.nftId;
  let txHash = req.body.txHash;

  let adminWallet = process.env.OWNER_ADDRESS.toLowerCase()
  if (!nftId) {
    const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_ENDPOINT)
    const signer = new ethers.Wallet(process.env.OWNER_PK, provider)
    const contractInstance = new ethers.Contract(
      FishdomNFT.networks[process.env.NETWORK_ID].address,
      FishdomNFT.abi,
      signer
    );
    let _hash, _skipVerify, _confirmedTx
    if (!txHash) {
      const mintTx = await contractInstance.mint(parseInt(amount));
      console.log(mintTx);
      _confirmedTx = await mintTx.wait(1)
      console.log('confirmed')
      _hash = mintTx.hash
      _skipVerify = true
    } else {
      _skipVerify = false
      _hash = txHash;
    }
    const decodedData = await UtilFunctions.decodeTxData(provider, _hash, [`event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)`], { skipVerify: _skipVerify, confirmedTx: _confirmedTx, mintAmount: parseInt(amount) })
    if (!decodedData) {
      return res.status(500).json({ msg: 'failed' });
    }

    for (let event of decodedData.eventData) {
      if (!nftId) {
        nftId = [event.args['tokenId'].toString()]
      } else {
        nftId.push(event.args['tokenId'].toString())
      }
    }
  } else {
    nftId = JSON.parse(nftId)
    for (let _nftId of nftId) {
      const existedNFT = await NFTModel.findOne({ nftId: _nftId })
      if (existedNFT) {
        return res.status(500).json({ msg: "Existed NFT: " + _nftId })
      }
    }
  }

  const insertData = nftId.map(_nft => ({
    walletAddress: adminWallet,
    nftId: _nft
  }))
  const result = await NFTModel.create(insertData)
  if (result) {
    return res.status(200).json({ data: result });
  } else {
    return res.status(500).json({ msg: "failed" });
  }

});

router.post("/getListNFT", auth, async (req, res) => {
  let userId = req.user._id;
  let limit = req.body.limit || 6;
  let skip = req.body.skip || 0;

  let userData = await UserModel.findById(userId);
  if (!userData) {
    return res.status(500).json({ msg: 'failed' });
  }

  let data = await NFTModel.find({
    walletAddress: userData.walletAddress,
  }).limit(limit).skip(skip);
  let count = 0;
  if (data && data.length > 0) {
    count = await NFTModel.count({
      walletAddress: userData.walletAddress,
    });
  }

  return res.status(200).json({ data: data, count: count });
});

router.get("/metadata/:id.json", async (req, res) => {
  let id = req.params.id;
  /* ex: 1-left.json 1-right.json */
  if (id) {
    id = id.split('-')
    let parseId = parseInt(id[0]);
    let entropy = (parseId + 100 - 2 + 44 - 5 + 31) % 5;
    return res.sendFile(path.resolve(__filename, '../../metadata/player/' + entropy + '-' + id[1] + '.png'));
  }
  return res.status(500).json({ msg: 'invalid id' });
});

router.get("/idle/:id.json", async (req, res) => {
  let id = req.params.id;
  if (id) {
    id = parseInt(id);
    let entropy = (id + 100 - 2 + 44 - 5 + 31) % 5;
    return res.sendFile(path.resolve(__filename, '../../metadata/idle/' + entropy + '.png'));
  }
  return res.status(500).json({ msg: 'invalid id' });
});

module.exports = router;
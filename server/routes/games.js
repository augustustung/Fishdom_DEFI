const router = require("express").Router();
const auth = require("../middlewares/auth");
const ScoreModel = require('../models/gameModel');
const UserModel = require('../models/userModel');
const NFTModel = require('../models/nft');
const moment = require('moment');
const path = require('path');
const { ethers } = require('ethers');
const FishdomNFT = require('../contracts/FishdomNFT.sol/FishdomNFT.json');

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
  const user = await UserModel.findById(req.user._id);
  if (userData.balance >= 1000 * req.body.turn) {
    await user.update({
      playTurn: user.playTurn + req.body.turn,
      balance: userData.balance - 1000 * req.body.turn
    });
    await user.save();
    res.status(200).json({ msg: 'ok' });
  } else {
    res.status(500).json({ msg: 'over allowance' });
  }
});

router.post('/play', auth, async (req, res) => {
  const user = await UserModel.findById(req.user._id);

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
  console.log('save score', data)
  return res.status(200).json(data);
});

router.post("/mint", auth, async (req, res) => {
  let tokenId = req.payload.tokenId;
  let userId = req.user._id;
  let userData = await UserModel.findById(userId);
  if (!userData) {
    return res.status(500).json({ msg: 'failed' });
  }

  const contractInstance = new ethers.Contract(
    FishdomNFT.networks[97].address,
    FishdomNFT.abi
  );
  let ownerOf = await contractInstance.ownerOf(tokenId);
  if (ownerOf !== userData.walletAddress) {
    return res.status(500).json({ msg: 'failed' });
  }

  await NFTModel.create({
    walletAddress: userData.walletAddress,
    tokenId: tokenId.toString()
  })

  return res.status(200).json({ msg: 'success' });
});

router.get("/metadata/:id.json", async (req, res) => {
  let id = req.params.id;
  if (id) {
    id = parseInt(id);
    let entropy = (id + 100 - 2 + 44 - 5 + 31) % 5;
    return res.sendFile(path.resolve(__filename, '../../metadata/player/' + entropy + '.png'));
  }
  return res.status(500).json({ msg: 'invalid id' });
});

module.exports = router;
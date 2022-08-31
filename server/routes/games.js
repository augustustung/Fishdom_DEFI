const router = require("express").Router();
const auth = require("../middlewares/auth");
const ScoreModel = require('../models/gameModel');
const UserModel = require('../models/userModel');
const moment = require('moment');

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
  console.log('found user', user);
  console.log('remain user turn', user.playTurn);
  console.log(user.playTurn + req.body.turn)

  await user.update({ playTurn: user.playTurn + req.body.turn });
  await user.save();
  res.status(200).json({ msg: 'ok' })
});

router.post('/play', auth, async (req, res) => {
  const user = await UserModel.findById(req.user._id);
  console.log('found user', user);
  console.log('remain user turn', user.playTurn);

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

module.exports = router;
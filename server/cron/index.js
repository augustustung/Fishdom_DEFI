const ScoreModel = require('../models/gameModel')
const moment = require('moment');
const { CronInstance } = require('./cronInstance');
const UserModel = require('../models/userModel');

async function payUserScore() {
  const totalUser = await ScoreModel.aggregate([
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
  if (totalUser.length > 0) {
    for (const userScore of totalUser) {
      await UserModel.findOneAndUpdate(
        { walletAddress: userScore.userWallet },
        { $inc: { balance: userScore.score } },
        { new: true },
        function (err, res) {
          if (err) {
            console.error(err, 'error')
          }
          if (res) {
            console.info(res, 'res')
          }
        }
      )
    }
  }
}

async function startSchedule() {
  console.info("startSchedule ", new Date());
  CronInstance.schedule('* * * * *', payUserScore)
}

module.exports = startSchedule
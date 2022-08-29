const router = require("express").Router();
const auth = require("../middlewares/auth");
const ScoreModel = require('../models/gameModel');
const UserModel = require('../models/userModel');

router.get("/leader-board", auth, (req, res) => {

});

router.post("/buy-turn", auth, (req, res) => {
  if (!req.body.turn) {
    return res.status(500).json({ msg: "Invalid number of turns " });
  }
  const user = await UserModel.findById(req.user._id);
  console.log('found user', user);
  console.log('remain user turn', user.playTurn);
  const res = await UserModel.updateOne({ id: req.user._id }, { playTurn: user.playTurn + req.body.turn });
  res.status(200).json({ msg: 'ok' })
});

router.post("/save-score", auth, async (req, res) => {
  if (!req.body.score) {
    return res.status(500).json({ msg: "Invalid score" })
  }
  let res = await ScoreModel.create({
    userId: req.user._id,
    score: req.body.score
  });
  return res.status(200).json({ msg: "ok" });
});

module.exports = router;
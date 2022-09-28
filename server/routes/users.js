const router = require("express").Router();
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../middlewares/auth");
const manager = require('../Deposit/manager');

router.post('/register', async (req, res) => {
  //validation
  if (!req.body.name || !req.body.password) {
    return res.status(400).json({ msg: "Please enter all fields!" });
  }
  if (req.body.name.length > 15) {
    return res.status(400).json({ msg: "Name length is 15 characters MAX!" });
  }
  if (!req.body.walletAddress) {
    return res.status(400).json({ msg: "Invalid wallet address" });
  }

  bcrypt.genSalt(10, function (err, salt) {
    bcrypt.hash(req.body.password, salt, function (err, hash) {
      // Store hash in your password DB.
      const newUser = new User({
        name: req.body.name,
        password: hash,
        walletAddress: req.body.walletAddress
      });
      newUser
        .save()
        .then((user) => {
          const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
          res.json({
            user,
            token
          })
        })
        .catch((err) => res.status(400).json("Error: " + err));
    });
  });
});

router.post('/login', async (req, res) => {
  const user = await User.findOne({ walletAddress: req.body.walletAddress });
  if (!user) {
    return res.status(200).json({ msg: "NOT_FOUND" })
  } else {
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    res.json({
      token: token,
      user: user,
    });
  }
});

router.post('/update', auth, async (req, res) => {
  const data = req.body.data || {}
  await User.updateOne(
    {
      id: req.user._id
    },
    data
  );
  return res.status(200).json({ msg: "success" })
});

router.post("/deposit", auth, manager.requestDepositFishdomToken);

router.post("/withdraw", auth, manager.requestWithdraw);

router.get("/:id", auth, async (req, res) => {
  console.log("request came for id ", req.user._id)
  const user = await User.findById(req.user._id);
  console.log("found stuff: ", user)
  res.json(user);
});

module.exports = router;
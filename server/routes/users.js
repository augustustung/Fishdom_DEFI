const router = require("express").Router();
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const auth = require("../middlewares/auth");
const manager = require('../Deposit/manager');
const { ethers } = require("ethers");

router.post('/login', async (req, res) => {
  try {
    const message = req.body.message
    const signature = req.body.signature
    const chainId = req.body.chainId
    const walletAddress = req.body.walletAddress
    if (chainId !== parseInt(process.env.NETWORK_ID)) {
      res.status(500).json({ msg: "INVALID_CHAIN_ID" })
      return
    }
    const signerAddr = ethers.utils.verifyMessage(message, signature);
    if (!walletAddress === signerAddr) {
      res.status(500).json({ msg: "INVALID_SIGNER" })
      return
    }
    let user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
    if (!user) {
      user = new User({
        walletAddress: walletAddress.toLowerCase(),
      });
      await user.save();
    }
    const token = jwt.sign({ _id: user._id, walletAddress: walletAddress.toLowerCase() }, process.env.JWT_SECRET);
    res.json({
      token: token,
      user: user,
    });
  } catch (error) {
    console(__filename, error);
    res.status(500).json({ msg: "failed" })
  }
});

router.post('/update', auth, async (req, res) => {
  const data = req.body.data || {}
  await User.updateOne(
    {
      _id: req.user._id
    },
    data
  );
  const user = await User.findById(req.user._id);
  return res.status(200).json({ data: user });
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
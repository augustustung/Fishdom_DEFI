const router = require("express").Router();
const User = require("../model/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../middlewares/auth");

router.post("/register", async (req, res) => {
  //validation
  if (!req.body.name || !req.body.password) {
    return res.status(400).json({ msg: "Please enter all fields!" });
  }
  if (req.body.name.length > 15) {
    return res.status(400).json({ msg: "Name length is 15 characters MAX!" });
  }
  const user = await User.findOne({ name: req.body.name });
  if (user) {
    return res.status(400).json({ msg: "User already exists!" });
  }

  bcrypt.genSalt(10, function (err, salt) {
    bcrypt.hash(req.body.password, salt, function (err, hash) {
      // Store hash in your password DB.
      const newUser = new User({
        name: req.body.name,
        password: hash,
      });
      newUser
        .save()
        .then((user) => res.json(user))
        .catch((err) => res.status(400).json("Error: " + err));
    });
  });
});

router.post("/login", async (req, res) => {
  //validation
  if (!req.body.name || !req.body.password) {
    return res.status(400).json({ msg: "Please enter all fields!" });
  }
  const user = await User.findOne({ name: req.body.name });
  if (!user) {
    return res.status(400).json({ msg: "User doesn't exist!" });
  }

  bcrypt.compare(req.body.password, user.password, function (err, response) {
    if (!response) {
      return res.status(400).send({ msg: "Authentication Error" });
    } else {
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
      res.json({
        token: token,
        user: {
          id: user._id,
          name: user.name,
          date: user.date,
        },
      });
    }
  });
});

router.get("/:id", auth, async (req, res) => {
  console.log("request came for id ", req.user._id)
  const user = await User.findById(req.user._id);
  console.log("found stuff: ", user)
  res.json(user);
});

module.exports = router;
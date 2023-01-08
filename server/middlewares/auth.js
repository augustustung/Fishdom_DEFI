require('dotenv').config()
const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
  let secret = req.header("secret");
  if (secret && secret === process.env.JWT_SECRET) {
    next()
  } else {
    let token = req.header('authorization')
    if (!token) {
      return res.status(401).json({ msg: "No Token - Authorization Denied" })
    }
    token = token.split(" ")[1];
    if (!token) {
      return res.status(401).json({ msg: "No Token - Authorization Denied" })
    }
    try {
      const verified = jwt.verify(token, process.env.JWT_SECRET)
      if (!verified) {
        return res.status(401).json({ msg: "Cannot Verify - Authorization Denied" })
      }
      req.user = verified
      next()
    } catch (err) {
      res.status(401).json({ msg: err })
      return
    }
  }
}
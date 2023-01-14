const router = require("express").Router();
const auth = require("../middlewares/auth");
const manager = require('../HavestStaking/manager');

router.post("/get", auth, manager.getList);

module.exports = router;
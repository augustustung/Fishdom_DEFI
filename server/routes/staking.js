const router = require("express").Router();
const auth = require("../middlewares/auth");
const manager = require('../Staking/manager');

router.post('/stake', auth, manager.stake);

router.post('/unstake', auth, manager.unstake);

router.post("/claim", auth, manager.claim);

router.post("/get", auth, manager.getList);

module.exports = router;
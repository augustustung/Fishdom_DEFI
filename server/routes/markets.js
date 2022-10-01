const router = require("express").Router();
const auth = require("../middlewares/auth");
const manager = require('../Market/manager');

router.post('/sell', auth, manager.sellItem);

router.post('/buy', auth, manager.buyItem);

router.post("/withdraw", auth, manager.withdraw);

router.post("/get", manager.getList);

module.exports = router;
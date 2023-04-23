const express = require("express");
require("dotenv").config();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const connectDb = require('./config/connectDb');
connectDb();

const app = express();
app.use(cors({}));
app.use(bodyParser.urlencoded({ limit: '50mb' }))
app.use(bodyParser.json());
const port = process.env.PORT || 5000;

const gamesRouter = require("./routes/games");
const usersRouter = require("./routes/users");
const marketRouter = require("./routes/markets");
const stakingRouter = require("./routes/staking");
const havestRouter = require("./routes/havest");
app.use("/api/games", gamesRouter);
app.use("/api/users", usersRouter);
app.use("/api/markets", marketRouter);
app.use("/api/stakings", stakingRouter);
app.use("/api/havests", havestRouter);
app.use(express.static(path.join(__dirname, "./metadata")));

app.listen(port, async () => {
  const Cronjob = require('./cron')
  await Cronjob();
  console.log(`Example app listening at http://localhost:${port}`);
});
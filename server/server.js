const express = require("express");
require("dotenv").config();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
// const server = require('http').createServer(app)
// const io = require('socket.io')(server)
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


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

// let roomData = {}

// io.on('connection', connected);
// setInterval(serverLoop, 1000 / 60);

// function connected(socket) {
//   console.info('has connection', socket.id);

//   //For Game Start
//   socket.on("gameRequest", (cb) => {
//     const newRoomId = crypto.randomBytes(32);
//     const roomIds = Object.keys(roomData)
//     let isDuplicateRoomId = true;
//     while (isDuplicateRoomId) {
//       for (let i = 0; i <= roomIds.length; i++) {
//         if (roomIds[i] === newRoomId) {
//           newRoomId = crypto.randomBytes(32);
//         } else {
//           isDuplicateRoomId = false;
//           break;
//         }
//       }
//     }
//     console.log("New room id: ", newRoomId);
//     socket.join(newRoomId);
//     roomData[newRoomId] = {};
//     cb(newRoomId);
//   })

//   socket.on("playerReady", (roomId) => {
//     roomData[roomId].isStart = true;

//     socket.on('playerMove', (x, y) => {

//     })
//   })
// }

// function serverLoop() {
// }

// // app.use(express.static(path.join(__dirname, "../frontend/build")));
// // app.get("*", (req, res) =>
// //   res.sendFile(path.join(__dirname, "../frontend/build/index.html"))
// // );

// server.listen(port, () => {
//   console.log(`Example app listening at http://localhost:${port}`);
// });
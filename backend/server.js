const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

let players = {};
let hostId = null;

io.on("connection", (socket) => {
  socket.on("join-game", (name) => {
    players[socket.id] = { name, score: 500, hasReviewed: false, isHost: false };
    if (!hostId) {
      hostId = socket.id;
      players[socket.id].isHost = true;
      socket.emit("set-host", true);
    } else {
      socket.emit("set-host", false);
    }
    io.emit("update-leaderboard", Object.values(players));
  });

  socket.on("submit-answer", ({ answer, bet }) => {
    if (players[socket.id]) {
      players[socket.id].answer = answer;
      players[socket.id].bet = bet;
    }
  });

  socket.on("review-answer", ({ targetId, isCorrect }) => {
    if (players[socket.id] && players[targetId]) {
      if (isCorrect) {
        players[targetId].score += players[targetId].bet;
      } else {
        players[targetId].score -= players[targetId].bet;
      }
      players[socket.id].hasReviewed = true;
      io.emit("update-leaderboard", Object.values(players));
    }
  });

  socket.on("start-correction", () => {
    io.emit("start-correction-countdown", 5);
    io.emit("disable-submission");
    const answers = Object.values(players).map((player) => ({
      name: player.name,
      answer: player.answer,
      bet: player.bet,
      id: player.id,
    }));
    io.emit("show-answers", answers);
  });

  socket.on("end-game", () => {
    const finalScores = Object.values(players).sort((a, b) => b.score - a.score);
    io.emit("game-over", finalScores);
  });

  socket.on("disconnect", () => {
    delete players[socket.id];
    if (socket.id === hostId) {
      const playerIds = Object.keys(players);
      if (playerIds.length > 0) {
        hostId = playerIds[0];
        players[hostId].isHost = true;
        io.to(hostId).emit("set-host", true);
      } else {
        hostId = null;
      }
    }
    io.emit("update-leaderboard", Object.values(players));
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
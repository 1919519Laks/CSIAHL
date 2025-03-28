const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());

let players = {};

io.on("connection", (socket) => {
  console.log("Player connected:", socket.id);

  socket.on("join-game", (name) => {
    let isNewHost = Object.values(players).length === 0;

    players[socket.id] = { name, score: 500, reviewed: false, isHost: isNewHost };

    if (isNewHost) {
      console.log("New host assigned:", socket.id);
    }
    io.emit("update-leaderboard", getSortedLeaderboard());
    io.to(socket.id).emit("set-host", isNewHost);
  });

  socket.on("submit-answer", ({ answer, bet }) => {
    if (players[socket.id]) {
      players[socket.id].answer = answer;
      players[socket.id].bet = bet;
      players[socket.id].reviewed = false;
    }
  });

  socket.on("peer-review", ({ playerId, correct }) => {
    if (players[playerId]) {
      players[playerId].score += correct ? players[playerId].bet * 2 : -players[playerId].bet;
      players[playerId].reviewed = true;
      io.emit("update-leaderboard", getSortedLeaderboard());
    }

    const reviewers = Object.values(players).filter((p) => !p.isHost);
    if (reviewers.every((p) => p.reviewed)) {
      setTimeout(() => {
        resetForNextRound();
        io.emit("enable-submission");
        io.emit("correction-ended");
        console.log("Server emitted enable-submission and correction-ended");
      }, 3000);
    }
  });

  socket.on("disconnect", () => {
    delete players[socket.id];
    let newHost = Object.values(players).find((p) => p.isHost);

    if (!newHost && Object.values(players).length > 0) {
      players[Object.keys(players)[0]].isHost = true;
      io.to(Object.keys(players)[0]).emit("set-host", true);
      console.log("New host assigned after disconnect:", Object.keys(players)[0]);
    }
    io.emit("update-leaderboard", getSortedLeaderboard());
  });

  socket.on("end-game", () => {
    io.emit("game-over", getSortedLeaderboard());
    players = {};
  });

  socket.on("start-correction", () => {
    distributeAnswersForReview();
    io.emit("disable-submission");
  });
});

function distributeAnswersForReview() {
  let reviewList = Object.entries(players)
    .filter(([id, p]) => p.answer && !p.reviewed && !p.isHost)
    .map(([id, p]) => ({ id, name: p.name, answer: p.answer, bet: p.bet }));

  let playerIds = Object.keys(players).filter((id) => !players[id].isHost);

  if (reviewList.length === 0 || playerIds.length === 0) {
    return;
  }

  let reviewIndex = 0;

  playerIds.forEach((playerId) => {
    let assigned = false;
    for (let i = 0; i < reviewList.length; i++) {
        let potentialIndex = (reviewIndex + i) % reviewList.length;

        if (reviewList[potentialIndex].id !== playerId) {
            io.to(playerId).emit("review-answer", reviewList[potentialIndex]);
            reviewIndex = (potentialIndex + 1) % reviewList.length;
            assigned = true;
            break;
        }
    }
    if (!assigned){
        console.log(`could not assign review to ${playerId}`);
    }
  });
}

function resetForNextRound() {
  Object.values(players).forEach(p => {
    p.answer = null;
    p.reviewed = false;
  });
}

function getSortedLeaderboard() {
  return Object.values(players)
    .sort((a, b) => b.score - a.score)
    .map((p, index) => ({
      rank: index + 1,
      name: p.name,
      score: p.score,
    }));
}

server.listen(3001, () => console.log("Server running on port 3001"));
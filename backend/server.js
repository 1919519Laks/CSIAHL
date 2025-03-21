const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());

let players = {}; // Store player data

io.on("connection", (socket) => {
  console.log("Player connected:", socket.id);

  socket.on("join-game", (name) => {
    players[socket.id] = { name, score: 500 };
    io.emit("update-leaderboard", getSortedLeaderboard());
  });

  socket.on("submit-answer", ({ answer, bet }) => {
    players[socket.id].bet = bet;
    players[socket.id].answer = answer;
    io.emit("awaiting-peer-review", players);
  });

  socket.on("peer-review", ({ playerId, correct }) => {
    if (correct) {
      players[playerId].score += players[playerId].bet * 2;
    } else {
      players[playerId].score -= players[playerId].bet;
    }
    io.emit("update-leaderboard", getSortedLeaderboard());
  });

  socket.on("disconnect", () => {
    delete players[socket.id];
    io.emit("update-leaderboard", getSortedLeaderboard());
  });
});

function getSortedLeaderboard() {
  return Object.values(players)
    .sort((a, b) => b.score - a.score)
    .map((p, index) => ({ rank: index + 1, name: p.name, score: p.score }));
}

server.listen(3001, () => console.log("Server running on port 3001"));

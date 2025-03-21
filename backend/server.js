const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } }); // ✅ This must be defined before io.on()

app.use(cors());

let players = {};

io.on("connection", (socket) => {
  console.log("Player connected:", socket.id);

  socket.on("join-game", (name) => {
    players[socket.id] = { name, score: 500, reviewed: false };
    io.emit("update-leaderboard", getSortedLeaderboard());
  });

  socket.on("peer-review", ({ playerId, correct }) => {
    if (players[playerId]) {
      players[playerId].score += correct ? players[playerId].bet * 2 : -players[playerId].bet;
      players[playerId].reviewed = true;
      io.emit("update-leaderboard", getSortedLeaderboard());
    }

    // Auto-advance to next question if all are reviewed
    if (Object.values(players).every((p) => p.reviewed)) {
      setTimeout(nextQuestion, 3000);
    }
  });

  socket.on("disconnect", () => {
    delete players[socket.id];
    io.emit("update-leaderboard", getSortedLeaderboard());
  });
  socket.on("end-game", () => {
    io.emit("game-over", getSortedLeaderboard());
  });
  
});

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

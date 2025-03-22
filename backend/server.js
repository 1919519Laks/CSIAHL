const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } }); // ✅ This must be defined before `io.on()`

app.use(cors());

let players = {};
let hostId = null; // Store the host's socket ID

io.on("connection", (socket) => {
  console.log("Player connected:", socket.id);

  socket.on("join-game", (name) => {
    if (!hostId) {
      hostId = socket.id;
    }

    players[socket.id] = { name, score: 500, reviewed: false, isHost: socket.id === hostId };
    io.emit("update-leaderboard", getSortedLeaderboard());
    io.to(socket.id).emit("set-host", socket.id === hostId);
  });

  socket.on("disconnect", () => {
    delete players[socket.id];

    if (socket.id === hostId) {
      const remainingPlayers = Object.keys(players);
      hostId = remainingPlayers.length > 0 ? remainingPlayers[0] : null;
      if (hostId) {
        io.to(hostId).emit("set-host", true);
      }
    }

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

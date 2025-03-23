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
let teams = {};
let teamSize = 0;
let gameMode = "solo";

io.on("connection", (socket) => {
  socket.on("set-team-size", (size) => {
    teamSize = size;
  });

  socket.on("set-game-mode", (mode) => {
    gameMode = mode;
  });

  socket.on("join-game", ({ name }) => {
    players[socket.id] = { name, score: 500, hasReviewed: false, isHost: false, team: null };

    if (!hostId) {
      hostId = socket.id;
      players[socket.id].isHost = true;
      socket.emit("set-host", true);
    } else {
      socket.emit("set-host", false);
    }
    io.emit("update-leaderboard", Object.values(players));
  });

  socket.on("start-game", () => {
    if (gameMode === "teams" && teamSize > 0) {
      assignTeams();
    }
    io.emit("game-started");
  });

  socket.on("submit-answer", ({ answer, bet, team }) => {
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
      team: player.team,
    }));
    io.emit("show-answers", answers);
  });

  socket.on("end-game", () => {
    const finalScores = Object.values(players).sort((a, b) => b.score - a.score);
    io.emit("game-over", finalScores);

    // Reset game data
    players = {};
    hostId = null;
    teams = {};
    teamSize = 0;
    gameMode = "solo";

    console.log("Game reset:", { players, hostId, teams, teamSize, gameMode });
  });

  socket.on("disconnect", () => {
    if (players[socket.id]) {
      const teamName = players[socket.id].team;
      if (teams[teamName]) {
        teams[teamName] = teams[teamName].filter((id) => id !== socket.id);
        if (teams[teamName].length === 0) {
          delete teams[teamName];
        }
      }
      delete players[socket.id];
    }
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

function assignTeams() {
  const playerIds = Object.keys(players);
  const shuffledIds = playerIds.sort(() => 0.5 - Math.random());
  let teamCount = 0;

  for (let i = 0; i < shuffledIds.length; i++) {
    const playerId = shuffledIds[i];
    const teamName = `Team ${teamCount + 1}`;

    if (!teams[teamName]) {
      teams[teamName] = [];
    }

    teams[teamName].push(playerId);
    players[playerId].team = teamName;

    if (teams[teamName].length >= teamSize) {
      teamCount++;
    }
  }
}

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());

let players = {};

// Function to shuffle an array (Fisher-Yates shuffle)
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

io.on("connection", (socket) => {
  console.log("Player connected:", socket.id);

  socket.on("join-game", (name) => {
    players[socket.id] = { name, score: 500, reviewed: false };
    io.emit("update-leaderboard", getSortedLeaderboard());
  });

  socket.on("submit-answer", ({ answer, bet }) => {
    if (players[socket.id]) {
      players[socket.id].answer = answer;
      players[socket.id].bet = bet;
      players[socket.id].reviewed = false; // Reset reviewed status
      // Notify everyone that answers are ready for review
      const reviewList = Object.entries(players)
        .filter(([id, p]) => p.answer && !p.reviewed)
        .map(([id, p]) => ({ id, name: p.name, answer: p.answer, bet: p.bet }));

      const shuffledReviewList = shuffle(reviewList);
      io.emit("awaiting-peer-review", shuffledReviewList);
    }
  });

  socket.on("peer-review", ({ playerId, correct }) => {
    if (players[playerId]) {
      players[playerId].score += correct ? players[playerId].bet * 2 : -players[playerId].bet;
      players[playerId].reviewed = true;
      io.emit("update-leaderboard", getSortedLeaderboard());
    }

    // Auto-advance to next question if all are reviewed
    if (Object.values(players).every((p) => p.reviewed)) {
      setTimeout(() => {
        // Reset answers and reviewed status for the next round
        Object.values(players).forEach(p => {
          p.answer = null;
          p.reviewed = false;
        });
        // You would emit the next question here if you were managing questions
        // io.emit("new-question", { question: "Next Question Here" });
      }, 3000);
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

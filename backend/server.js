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
    }

    // Shuffle answers and distribute one per player
    distributeAnswersForReview();
  });

  socket.on("peer-review", ({ playerId, correct }) => {
    if (players[playerId]) {
      players[playerId].score += correct ? players[playerId].bet * 2 : -players[playerId].bet;
      players[playerId].reviewed = true;
      io.emit("update-leaderboard", getSortedLeaderboard());
    }

    // Auto-advance if all reviews are done
    if (Object.values(players).every((p) => p.reviewed)) {
      setTimeout(resetForNextRound, 3000);
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

// Distribute answers randomly for review
function distributeAnswersForReview() {
  let reviewList = Object.entries(players)
    .filter(([id, p]) => p.answer && !p.reviewed)
    .map(([id, p]) => ({ id, name: p.name, answer: p.answer, bet: p.bet }));

  reviewList = shuffle(reviewList); // Shuffle the order

  Object.keys(players).forEach((playerId, index) => {
    const answerToReview = reviewList[index]; // Assign each player one answer
    if (answerToReview && answerToReview.id !== playerId) {
      io.to(playerId).emit("review-answer", answerToReview);
    }
  });
}

// Reset answers for the next round
function resetForNextRound() {
  Object.values(players).forEach(p => {
    p.answer = null;
    p.reviewed = false;
  });
}

// Fisher-Yates Shuffle
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
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

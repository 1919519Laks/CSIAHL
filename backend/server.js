let currentQuestionIndex = 0;

function nextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    // Move to the next question
    Object.values(players).forEach((p) => (p.reviewed = false)); // Reset reviews
    io.emit("new-question", questions[currentQuestionIndex]);
  } else {
    // Game over - show final scores
    io.emit("game-over", getSortedLeaderboard());
  }
}

io.on("connection", (socket) => {
  socket.on("start-game", () => {
    currentQuestionIndex = 0;
    io.emit("new-question", questions[currentQuestionIndex]);
  });

  socket.on("peer-review", ({ playerId, correct }) => {
    if (players[playerId]) {
      players[playerId].score += correct ? players[playerId].bet * 2 : -players[playerId].bet;
      players[playerId].reviewed = true;
      io.emit("update-leaderboard", getSortedLeaderboard());
    }

    // If all answers are reviewed, move to the next question
    if (Object.values(players).every((p) => p.reviewed)) {
      setTimeout(nextQuestion, 3000); // 3-second delay before next question
    }
  });
});

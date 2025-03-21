function getSortedLeaderboard() {
    return Object.values(players)
      .sort((a, b) => b.score - a.score)
      .map((p, index) => ({
        rank: index + 1,
        name: p.name,
        score: p.score,
      }));
  }
  
  socket.on("join-game", (name) => {
    players[socket.id] = { name, score: 500 };
    io.emit("update-leaderboard", getSortedLeaderboard());
  });
  
  socket.on("peer-review", ({ playerId, correct }) => {
    if (correct) {
      players[playerId].score += players[playerId].bet * 2;
    } else {
      players[playerId].score -= players[playerId].bet;
    }
    io.emit("update-leaderboard", getSortedLeaderboard());
  });
  
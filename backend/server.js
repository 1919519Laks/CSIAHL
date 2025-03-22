let hostId = null; // Store the host's socket ID

io.on("connection", (socket) => {
  console.log("Player connected:", socket.id);

  socket.on("join-game", (name) => {
    // If there's no host, set the first player as host
    if (!hostId) {
      hostId = socket.id;
    }

    players[socket.id] = { name, score: 500, reviewed: false, isHost: socket.id === hostId };
    
    // Send updated host info to all clients
    io.emit("update-leaderboard", getSortedLeaderboard());
    io.to(socket.id).emit("set-host", socket.id === hostId);
  });

  socket.on("disconnect", () => {
    delete players[socket.id];

    // If the host leaves, pick a new host
    if (socket.id === hostId) {
      const remainingPlayers = Object.keys(players);
      hostId = remainingPlayers.length > 0 ? remainingPlayers[0] : null;

      // Notify new host
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

import { useState, useEffect } from "react";

function Leaderboard({ socket }) {
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    socket.on("update-leaderboard", (data) => {
      setLeaderboard(data);
    });

    return () => {
      socket.off("update-leaderboard");
    };
  }, [socket]);

  return (
    <div className="p-5 border bg-gray-800 text-white rounded-md w-80">
      <h2 className="text-xl font-bold mb-2">Leaderboard</h2>
      <ul>
        {leaderboard.map((player) => (
          <li key={player.name} className="mb-1 text-lg">
            {player.rank}. {player.name} - {player.score} pts
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Leaderboard;

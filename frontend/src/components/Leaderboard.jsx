import { useState, useEffect } from "react";
import EndGameButton from "./EndGameButton";

export default function Leaderboard({ socket, isHost }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    socket.on("update-leaderboard", (data) => {
      const filteredLeaderboard = data.filter((player) => !player.isHost);
      setLeaderboard(filteredLeaderboard);
    });

    socket.on("game-over", (finalScores) => {
      const filteredFinalScores = finalScores.filter((player) => !player.isHost);
      setLeaderboard(filteredFinalScores);
      setGameOver(true);
    });

    return () => {
      socket.off("update-leaderboard");
      socket.off("game-over");
    };
  }, [socket]);

  if (gameOver) {
    return (
      <div className="p-5 border bg-gray-800 text-white rounded-md w-80 text-center">
        <h2 className="text-2xl font-bold mb-2">🏆 Final Podium 🏆</h2>
        {leaderboard.length > 0 && (
          <div className="text-lg">
            <p className="text-yellow-400 font-bold text-xl">
              🥇 {leaderboard[0]?.name} - {leaderboard[0]?.score} pts
            </p>
            {leaderboard[1] && (
              <p className="text-gray-300 text-lg">
                🥈 {leaderboard[1]?.name} - {leaderboard[1]?.score} pts
              </p>
            )}
            {leaderboard[2] && (
              <p className="text-orange-500 text-lg">
                🥉 {leaderboard[2]?.name} - {leaderboard[2]?.score} pts
              </p>
            )}
            {leaderboard[3] && (
              <p className="text-gray-300 text-lg">
                4. {leaderboard[3]?.name} - {leaderboard[3]?.score} pts
              </p>
            )}
            {leaderboard[4] && (
              <p className="text-gray-300 text-lg">
                5. {leaderboard[4]?.name} - {leaderboard[4]?.score} pts
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

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
      {isHost && <EndGameButton socket={socket} />}
      {console.log(isHost)}
    </div>
  );
}
import React, { useState, useEffect } from "react";

export default function Lobby({
  onJoin,
  isHost,
  onTeamSizeChange,
  onStartGame,
  onGameModeChange,
  gameMode,
}) {
  const [playerName, setPlayerName] = useState("");
  const [teamSizeInput, setTeamSizeInput] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    onJoin(playerName);
  };

  const handleTeamSizeSubmit = (e) => {
    e.preventDefault();
    onTeamSizeChange(parseInt(teamSizeInput));
  };

  const handleGameModeChangeLocal = (e) => {
    const selectedMode = e.target.value;
    onGameModeChange(selectedMode);
  };

  return (
    <form onSubmit={handleSubmit} className="p-5 border bg-gray-800 text-white rounded-md w-80">
      {isHost && (
        <div>
          <form onSubmit={handleTeamSizeSubmit} className="mb-4">
            <input
              type="number"
              placeholder="Team Size"
              value={teamSizeInput}
              onChange={(e) => setTeamSizeInput(e.target.value)}
              className="mb-2 p-2 w-full bg-gray-700 rounded-md"
            />
            <button type="submit" className="w-full p-2 bg-blue-500 rounded-md">
              Set Team Size
            </button>
          </form>

          <select
            value={gameMode}
            onChange={handleGameModeChangeLocal}
            className="mb-4 p-2 w-full bg-gray-700 rounded-md"
          >
            <option value="solo">Solo</option>
            <option value="teams">Teams</option>
          </select>

          <button
            type="button"
            onClick={onStartGame}
            className="w-full p-2 bg-green-500 rounded-md mb-4"
          >
            Start Game
          </button>
        </div>
      )}

      <input
        type="text"
        placeholder="Your Name"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        className="mb-2 p-2 w-full bg-gray-700 rounded-md"
      />
      <button type="submit" className="w-full p-2 bg-blue-500 rounded-md">
        Join Game
      </button>
    </form>
  );
}
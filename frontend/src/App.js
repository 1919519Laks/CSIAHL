import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import Lobby from "./components/Lobby";
import Game from "./components/Game";
import Leaderboard from "./components/Leaderboard";
import EndGameButton from "./components/EndGameButton";
import StartCorrectionButton from "./components/StartCorrectionButton";

const socket = io(process.env.BASE_URL, {
  transports: ["websocket"],
});

export default function App() {
  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameMode, setGameMode] = useState("solo");
  const [teamSize, setTeamSize] = useState(0);

  useEffect(() => {
    socket.on("set-host", (status) => {
      setIsHost(status);
    });

    socket.on("game-started", () => {
      setGameStarted(true);
    });

    socket.on("game-over", () => {
      setGameStarted(false);
      setJoined(false);
      setIsHost(false);
      setName("");
      setTeamSize(0);
      setGameMode("solo");
    });

    return () => {
      socket.off("set-host");
      socket.off("game-started");
      socket.off("game-over");
    };
  }, [socket]);

  const handleJoin = (playerName) => {
    setName(playerName);
    socket.emit("join-game", { name: playerName });
    setJoined(true);
  };

  const handleStartGame = () => {
    socket.emit("start-game");
  };

  const handleTeamSizeChange = (size) => {
    setTeamSize(size);
    socket.emit("set-team-size", size);
  };

  const handleGameModeChange = (mode) => {
    setGameMode(mode);
    socket.emit("set-game-mode", mode);
  };

  return (
    <div className="flex justify-center gap-10 p-5">
      {!joined ? (
        <Lobby
          onJoin={handleJoin}
          isHost={isHost}
          onTeamSizeChange={handleTeamSizeChange}
          onStartGame={handleStartGame}
          onGameModeChange={handleGameModeChange}
          gameMode={gameMode}
        />
      ) : gameStarted ? (
        <div>
          <Game socket={socket} isHost={isHost} />
          {isHost && <EndGameButton socket={socket} />}
          {isHost && <StartCorrectionButton socket={socket} />}
        </div>
      ) : (
        <p>Waiting for the host to start the game...</p>
      )}
      <Leaderboard socket={socket} />
    </div>
  );
}
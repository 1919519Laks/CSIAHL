import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import Lobby from "./components/Lobby";
import Game from "./components/Game";
import Leaderboard from "./components/Leaderboard";
import EndGameButton from "./components/EndGameButton";
import StartCorrectionButton from "./components/StartCorrectionButton"; // Import the new button

const socket = io("https://csiahl.onrender.com", {
  transports: ["websocket"],
});

export default function App() {
  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    socket.on("set-host", (status) => {
      setIsHost(status);
    });

    return () => {
      socket.off("set-host");
    };
  }, []);

  const handleJoin = (playerName) => {
    setName(playerName);
    socket.emit("join-game", playerName);
    setJoined(true);
  };

  return (
    <div className="flex justify-center gap-10 p-5">
      {!joined ? (
        <Lobby onJoin={handleJoin} />
      ) : (
        <div>
          <Game socket={socket} isHost={isHost} /> {/* Pass isHost prop */}
          {isHost && <EndGameButton socket={socket} />}
          {isHost && <StartCorrectionButton socket={socket} />} {/* Add the new button */}
        </div>
      )}
      <Leaderboard socket={socket} />
    </div>
  );
}
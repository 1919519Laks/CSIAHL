import { useState } from "react";
import { io } from "socket.io-client";
import Lobby from "./components/Lobby";
import Game from "./components/Game";
import Leaderboard from "./components/Leaderboard";
import EndGameButton from "./components/EndGameButton"; // ✅ Import the button


const socket = io("https://csiahl.onrender.com", {
  transports: ["websocket"], 
});

console.log("Socket connected:", socket.connected); // Add this line
export default function App() {
  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);
  const [isHost, setIsHost] = useState(false); // Track if the player is the host

  const handleJoin = (playerName, host = false) => {
    setName(playerName);
    setIsHost(host); // If the player selects host, set to true
    socket.emit("join-game", playerName);
    setJoined(true);
  };

  return (
    <div className="flex justify-center gap-10 p-5">
      {!joined ? (
        <Lobby onJoin={handleJoin} />
      ) : (
        <div>
          <Game socket={socket} />
          {isHost && <EndGameButton socket={socket} />} {/* ✅ Show End Game button only for host */}
        </div>
      )}
      <Leaderboard socket={socket} />
    </div>
  );
}

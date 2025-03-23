import { useState } from "react";

export default function Lobby({ onJoin }) {
  const [name, setName] = useState("");

  return (
    <div className="p-5 text-center">
      <h1 className="text-2xl">Enter Your Name</h1>
      <input
        type="text"
        className="border p-2"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={() => onJoin(name)} className="bg-blue-500 text-white p-2 ml-2">
        Join Game
      </button>
    </div>
  );
}
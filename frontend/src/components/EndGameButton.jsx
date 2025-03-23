import React from 'react';

export default function EndGameButton({ socket }) {
  const endGame = () => {
    socket.emit('end-game');
  };

  return (
    <button
      onClick={endGame}
      className="bg-red-600 text-white px-4 py-2 rounded-md mt-4"
    >
      End Game
    </button>
  );
}
import React from 'react';

export default function StartCorrectionButton({ socket }) {
  const startCorrection = () => {
    socket.emit('start-correction');
  };

  return (
    <button
      onClick={startCorrection}
      className="bg-blue-600 text-white px-4 py-2 rounded-md mt-4"
    >
      Start Correction
    </button>
  );
}
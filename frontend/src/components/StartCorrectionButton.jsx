import React, { useState } from 'react';

export default function StartCorrectionButton({ socket }) {
  const [correctionStarted, setCorrectionStarted] = useState(false);

  const startCorrection = () => {
    socket.emit('start-correction');
    setCorrectionStarted(true);
  };

  return (
    <button
      onClick={startCorrection}
      className={`px-4 py-2 rounded-md mt-4 ${
        correctionStarted ? 'bg-gray-500 text-gray-300 cursor-not-allowed' : 'bg-blue-600 text-white'
      }`}
      disabled={correctionStarted}
    >
      {correctionStarted ? 'Correction in Progress' : 'Start Correction'}
    </button>
  );
}
import { useState, useEffect } from "react";

export default function StartCorrectionButton({ socket }) {
  const [correctionInProgress, setCorrectionInProgress] = useState(false);

  useEffect(() => {
    socket.on("disable-submission", () => {
      setCorrectionInProgress(true);
    });

    socket.on("correction-ended", () => {
      setCorrectionInProgress(false);
    });

    return () => {
      socket.off("disable-submission");
      socket.off("correction-ended");
    };
  }, [socket]);

  const startCorrection = () => {
    socket.emit("start-correction");
  };

  return (
    <button onClick={startCorrection} disabled={correctionInProgress}>
      {correctionInProgress ? "Correction in Progress" : "Start Correction"}
    </button>
  );
}
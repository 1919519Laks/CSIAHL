import React, { useState, useEffect } from "react";

export default function Game({ socket }) {
  const [answer, setAnswer] = useState("");
  const [bet, setBet] = useState(0);
  const [countdown, setCountdown] = useState(null);
  const [disableSubmit, setDisableSubmit] = useState(false);

  useEffect(() => {
    socket.on("start-correction-countdown", (seconds) => {
      setCountdown(seconds);
      setDisableSubmit(true);
    });

    return () => {
      socket.off("start-correction-countdown");
    };
  }, [socket]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      if (answer){
        handleSubmit();
      }
      setCountdown(null);
      setDisableSubmit(false);
    }
  }, [countdown]);

  const handleSubmit = () => {
    socket.emit("submit-answer", { answer, bet });
    setAnswer("");
    setBet(0);
  };

  return (
    <div>
      {countdown !== null && (
        <p>Hurry! {countdown} seconds left to submit!</p>
      )}

      <input
        type="text"
        placeholder="Your Answer"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
      />
      <input
        type="number"
        placeholder="Bet"
        value={bet}
        onChange={(e) => setBet(parseInt(e.target.value))}
      />
      <button onClick={handleSubmit} disabled={disableSubmit}>
        Submit Answer
      </button>
    </div>
  );
}
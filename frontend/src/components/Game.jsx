import { useState, useEffect } from "react";

export default function Game({ socket, isHost }) {
  const [answerToReview, setAnswerToReview] = useState(null);
  const [answer, setAnswer] = useState("");
  const [bet, setBet] = useState(25);
  const [disabled, setDisabled] = useState(false);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    socket.on("review-answer", (assignedAnswer) => {
      setAnswerToReview(assignedAnswer);
      setShowReview(true);
    });

    socket.on("disable-submission", () => {
      setDisabled(true);
    });

    socket.on("enable-submission", () => {
      setDisabled(false);
      setShowReview(false);
    });

    return () => {
      socket.off("review-answer");
      socket.off("disable-submission");
      socket.off("enable-submission");
    };
  }, [socket]);

  const submitAnswer = () => {
    socket.emit("submit-answer", { answer, bet });
    setAnswer("");
  };

  const reviewAnswer = (correct) => {
    if (answerToReview) {
      socket.emit("peer-review", { playerId: answerToReview.id, correct });
      setAnswerToReview(null);
    }
  };

  return (
    <div className="p-5">
      {isHost && <p className="text-xl font-bold mb-4">You are the Host!</p>}
      {!isHost && (
        <>
          <input
            type="text"
            className="border p-2"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={disabled}
          />
          <input
            type="number"
            min="25"
            max="500"
            value={bet}
            onChange={(e) => setBet(Number(e.target.value))}
            className="border p-2 ml-2"
            disabled={disabled}
          />
          <button onClick={submitAnswer} className="bg-green-500 text-white p-2 ml-2" disabled={disabled}>
            Submit Answer
          </button>
        </>
      )}

      {showReview && answerToReview && (
        <div className="mt-5 p-4 border bg-gray-200">
          <h2 className="text-xl font-bold">Peer Review</h2>
          <p>
            <strong>{answerToReview.name}:</strong> {answerToReview.answer}
          </p>
          <button onClick={() => reviewAnswer(true)} className="bg-blue-500 text-white p-2 mr-2">
            Correct ✅
          </button>
          <button onClick={() => reviewAnswer(false)} className="bg-red-500 text-white p-2">
            Wrong ❌
          </button>
        </div>
      )}
    </div>
  );
}
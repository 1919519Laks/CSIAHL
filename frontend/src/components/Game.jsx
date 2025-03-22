import { useState, useEffect } from "react";

export default function Game({ socket }) {
  const [answerToReview, setAnswerToReview] = useState(null);
  const [answer, setAnswer] = useState("");
  const [bet, setBet] = useState(25);

  useEffect(() => {
    socket.on("review-answer", (assignedAnswer) => {
      setAnswerToReview(assignedAnswer);
    });

    return () => {
      socket.off("review-answer");
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
      {/* Answer Submission */}
      <input
        type="text"
        className="border p-2"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
      />
      <input
        type="number"
        min="25"
        max="500"
        value={bet}
        onChange={(e) => setBet(Number(e.target.value))}
        className="border p-2 ml-2"
      />
      <button onClick={submitAnswer} className="bg-green-500 text-white p-2 ml-2">
        Submit Answer
      </button>

      {/* Peer Review Section */}
      {answerToReview && (
        <div className="mt-5 p-4 border bg-gray-200">
          <h2 className="text-xl font-bold">Peer Review</h2>
          <p><strong>{answerToReview.name}:</strong> {answerToReview.answer}</p>
          <button
            onClick={() => reviewAnswer(true)}
            className="bg-blue-500 text-white p-2 mr-2"
          >
            Correct ✅
          </button>
          <button
            onClick={() => reviewAnswer(false)}
            className="bg-red-500 text-white p-2"
          >
            Wrong ❌
          </button>
        </div>
      )}
    </div>
  );
}

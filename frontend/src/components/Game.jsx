import { useState, useEffect } from "react";

export default function Game({ socket }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [bet, setBet] = useState(25);
  const [answersForReview, setAnswersForReview] = useState([]); // Store answers for peer review

  useEffect(() => {
    socket.on("new-question", (q) => setQuestion(q.question));

    // Get answers submitted by other players for review
    socket.on("awaiting-peer-review", (players) => {
      const reviewList = Object.entries(players)
        .filter(([id, p]) => p.answer && !p.reviewed) // Get players who answered but are not reviewed
        .map(([id, p]) => ({ id, name: p.name, answer: p.answer, bet: p.bet }));

      setAnswersForReview(reviewList);
    });

  }, [socket]);

  const submitAnswer = () => {
    socket.emit("submit-answer", { answer, bet });
    setAnswer(""); // Clear input after submitting
  };

  const reviewAnswer = (playerId, correct) => {
    socket.emit("peer-review", { playerId, correct });
    setAnswersForReview((prev) => prev.filter((p) => p.id !== playerId)); // Remove reviewed answer
  };

  return (
    <div className="p-5">
      <h1 className="text-2xl">{question}</h1>
      
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
      {answersForReview.length > 0 && (
        <div className="mt-5 p-4 border bg-gray-200">
          <h2 className="text-xl font-bold">Peer Review</h2>
          {answersForReview.map((p) => (
            <div key={p.id} className="p-2 border rounded mb-2 bg-white">
              <p><strong>{p.name}:</strong> {p.answer}</p>
              <button
                onClick={() => reviewAnswer(p.id, true)}
                className="bg-blue-500 text-white p-2 mr-2"
              >
                Correct ✅
              </button>
              <button
                onClick={() => reviewAnswer(p.id, false)}
                className="bg-red-500 text-white p-2"
              >
                Wrong ❌
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

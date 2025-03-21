import { useState, useEffect } from "react";

function Game({ socket }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [bet, setBet] = useState(25);

  useEffect(() => {
    socket.on("new-question", (q) => setQuestion(q.question));
  }, [socket]);

  const submitAnswer = () => {
    socket.emit("submit-answer", { answer, bet });
    setAnswer("");
  };

  return (
    <div className="p-5">
      <h1 className="text-2xl">{question}</h1>
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
        Submit
      </button>
    </div>
  );
}

export default Game;

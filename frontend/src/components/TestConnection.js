import React, { useEffect, useState } from "react";
import { fetchQuestions } from "../services/api";

const TestConnection = () => {
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const data = await fetchQuestions();
        setQuestions(data);
      } catch (err) {
        setError("Failed to fetch questions.");
      }
    };

    loadQuestions();
  }, []);

  return (
    <div>
      <h1>Test Connection</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul>
        {questions.map((q) => (
          <li key={q.id}>
            <strong>{q.question_text}</strong> - {q.difficulty_level}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TestConnection;

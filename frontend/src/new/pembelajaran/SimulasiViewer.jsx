import React, { useEffect, useState } from "react";
import Confirm from "../shared/components/Confirm";

import axiosInstance from "../../services/axios";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function SimulasiViewer({ simulationId }) {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const res = await axiosInstance.get(
          `/questions?simulation_id=${simulationId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setQuestions(res.data);
      } catch (err) {
        console.error("Load questions error:", err);
        // HAPUS: alert('Gagal load soal simulasi');
        // Bisa tambah state error jika perlu
      }
    };

    const loadResult = async () => {
      try {
        const res = await axiosInstance.get(
          `/simulations/${simulationId}/result`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.data) {
          setResult(res.data);
        }
      } catch {}
    };

    loadQuestions();
    loadResult();
  }, [simulationId]);

  const handleSelect = (id, value) => {
    setAnswers({ ...answers, [id]: value });
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        simulation_id: simulationId,
        answers: Object.entries(answers).map(([qid, selected_option]) => ({
          question_id: parseInt(qid),
          selected_option,
        })),
      };

      const res = await axiosInstance.post("/simulations/submit", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResult(res.data);
    } catch (err) {
      console.error("Submit error:", err);
      // HAPUS: alert('Gagal submit');
      // Bisa tambah state error jika perlu
    }
  };

  if (questions.length === 0) return <p>Loading...</p>;

  if (result) {
    return (
      <div>
        <h4>Hasil Simulasi:</h4>
        <p>Listening: {result.listening_score}</p>
        <p>Structure: {result.structure_score}</p>
        <p>Reading: {result.reading_score}</p>
        <p>
          Total Score: <b>{result.total_score}</b>
        </p>
        <hr />
        <h4>Pembahasan:</h4>
        <ul>
          {result.details.map((r, i) => (
            <li key={i}>
              <b>Soal {i + 1}:</b> {r.is_correct ? "✅ Benar" : "❌ Salah"}
              <br />
              Jawaban Benar: {r.correct_option}
              <br />
              <i>{r.explanation}</i>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const q = questions[current];

  return (
    <div>
      <h4>
        Soal {current + 1} / {questions.length}
      </h4>
      <p>{q.question_text}</p>

      {["a", "b", "c", "d"].map((opt) => (
        <div key={opt}>
          <label>
            <input
              type="radio"
              name={`q_${q.id}`}
              value={opt}
              checked={answers[q.id] === opt}
              onChange={() => handleSelect(q.id, opt)}
            />
            {opt}. {q[`option_${opt}`]}
          </label>
        </div>
      ))}

      <div style={{ marginTop: "10px" }}>
        <button
          onClick={() => setCurrent(current - 1)}
          disabled={current === 0}
        >
          Prev
        </button>
        <button
          onClick={() => setCurrent(current + 1)}
          disabled={current === questions.length - 1}
        >
          Next
        </button>
        {current === questions.length - 1 && (
          <Confirm
            title="Selesaikan simulasi?"
            description="Yakin ingin menyelesaikan simulasi? Jawaban yang sudah disubmit tidak bisa diubah lagi."
            confirmText="KONFIRMASI"
            confirmButtonType="primary"
            onConfirm={async () => {
              await handleSubmit();
            }}
          >
            <button>Selesai</button>
          </Confirm>
        )}
      </div>
    </div>
  );
}

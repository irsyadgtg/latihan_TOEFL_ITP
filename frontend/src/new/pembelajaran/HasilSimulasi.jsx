import React, { useEffect, useState } from "react";
import { useNavigate, useParams} from "react-router-dom";
import { useDashboardLayoutContext } from "../../layouts/DashboardLayout";
import axiosInstance from "../../services/axios";
import axios, { AxiosError } from "axios";


export default function HasilSimulasi() {
  
  
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { setTitle, setSubtitle } = useDashboardLayoutContext();

  const { simulationId } = useParams();
  const token = localStorage.getItem("token");

  const getCurrentRole = () => {
  const storedRole = localStorage.getItem("role");
  const pathname = window.location.pathname;
  
  // IMMEDIATE redirect jika role mismatch  
  if (storedRole === "peserta" && pathname.includes("/instructor/")) {
    window.location.replace("/student/simulasi");
    return "peserta";
  }
  
  if (storedRole === "instruktur" && pathname.includes("/student/")) {
    window.location.replace("/instructor/simulasi");
    return "instruktur";
  }
  
  // PRIORITASKAN localStorage role, bukan URL
  return storedRole;
};

  const currentRole = getCurrentRole();
  console.log("Role from localStorage:", localStorage.getItem("role"));
  console.log("Role from URL detection:", currentRole);

  
  const getBasePath = () => {
    if (currentRole === "instruktur") {
      return "/instructor";
    }
    return "/student";
  };

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      if (!simulationId) {
        setError("ID simulasi tidak ditemukan di URL.");
        setLoading(false);
        return;
      }

      const res = await axiosInstance.get(`/simulations/${simulationId}/results`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setResults(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error loading results:", err);

      if (axios.isAxiosError(error) && error.response?.status === 401) {
              localStorage.removeItem("AuthToken");
              localStorage.removeItem("role");
              navigate("/login");
              return;
            }
      

      if (err.response?.status === 403) {
        setError("Anda tidak memiliki akses ke hasil simulasi ini.");
      } else if (err.response?.status === 404) {
        setError("Hasil simulasi tidak ditemukan.");
      } else {
        setError(
          "Gagal memuat hasil simulasi: " +
            (err.response?.data?.message || err.message)
        );
      }
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds) return "0:00";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const getScoreColor = (score) => {
    if (score >= 550) return "#28a745";
    if (score >= 450) return "#ffc107";
    return "#dc3545";
  };

  const getCEFRColor = (cefr) => {
    switch (cefr) {
      case "C1":
        return "#6f42c1";
      case "B2":
        return "#B6252A";
      case "B1":
        return "#17a2b8";
      case "A2-B1":
        return "#fd7e14";
      case "A2":
        return "#dc3545";
      default:
        return "#6c757d";
    }
  };

  const getScoreInterpretation = (score) => {
    if (score >= 627) return "Excellent (C1)";
    if (score >= 543) return "Good (B2)";
    if (score >= 460) return "Fair (B1)";
    if (score >= 337) return "Developing (A2-B1)";
    if (score >= 310) return "Basic (A2)";
    return "Below Basic";
  };

  const renderAttachment = (attachment) => {
    if (!attachment) return null;

    const attachmentUrl = attachment.startsWith("http")
      ? attachment
      : attachment.startsWith("/storage/")
      ? `http://localhost:8000${attachment}`
      : `http://localhost:8000/storage/${attachment}`;

    if (attachment.match(/\.(jpg|jpeg|png|gif)$/i)) {
      return (
        <img
          src={attachmentUrl}
          style={{
            maxWidth: "300px",
            maxHeight: "200px",
            objectFit: "contain",
            border: "1px solid #ddd",
            borderRadius: "4px",
          }}
          alt="Attachment"
        />
      );
    }

    if (attachment.match(/\.(mp3|wav|ogg)$/i)) {
      return (
        <audio
          src={attachmentUrl}
          controls
          style={{ width: "100%", maxWidth: "300px" }}
        />
      );
    }

    if (attachment.match(/\.(mp4|webm)$/i)) {
      return (
        <video
          src={attachmentUrl}
          controls
          style={{
            maxWidth: "300px",
            maxHeight: "200px",
            border: "1px solid #ddd",
            borderRadius: "4px",
          }}
        />
      );
    }

    return null;
  };

  // 🔥 FIXED: Organize answers menggunakan group_parents dari backend
  const organizeAnswers = (answers, groupParents) => {
    const organized = {
      individuals: [],
      groups: [],
    };

    // Individual answers (tidak ada group_id)
    const individualAnswers = answers.filter((a) => !a.question.group_id);
    organized.individuals = individualAnswers;

    // Group answers (ada group_id)
    const groupAnswers = answers.filter((a) => a.question.group_id);

    // Kelompokkan berdasarkan group_id
    const groupedByGroupId = {};
    groupAnswers.forEach((answer) => {
      const groupId = answer.question.group_id;
      if (!groupedByGroupId[groupId]) {
        groupedByGroupId[groupId] = [];
      }
      groupedByGroupId[groupId].push(answer);
    });

    // Buat grup menggunakan group_parents dari backend
    Object.entries(groupedByGroupId).forEach(([groupId, children]) => {
      const parentQuestion = groupParents[groupId];

      if (parentQuestion) {
        // Sort children by order_number
        const sortedChildren = children.sort(
          (a, b) =>
            (a.question.order_number || 0) - (b.question.order_number || 0)
        );

        organized.groups.push({
          parent: {
            question: parentQuestion,
          },
          children: sortedChildren,
        });
      } else {
        console.warn(`Parent question not found for group ${groupId}`);
        // Fallback: treat as individuals
        organized.individuals.push(...children);
      }
    });

    return organized;
  };

  // 🔥 NEW: Render individual question
  const renderIndividualQuestion = (answer) => (
    <div
      key={answer.id}
      style={{
        border: `2px solid ${answer.is_correct ? "#28a745" : "#dc3545"}`,
        borderRadius: "6px",
        marginBottom: "1rem",
        padding: "1.5rem",
        backgroundColor: "white",
      }}
    >
      <h4
        style={{
          color: "#007bff",
          margin: "0 0 1rem 0",
        }}
      >
        Soal #{answer.question.order_number} (Individual)
      </h4>

      <div style={{ marginBottom: "1rem" }}>
        <strong>{answer.question.question_text}</strong>
      </div>

      {answer.question.attachment && (
        <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
          <strong>Lampiran:</strong>
          <div style={{ marginTop: "0.5rem" }}>
            {renderAttachment(answer.question.attachment)}
          </div>
        </div>
      )}

      <div style={{ marginTop: "1rem" }}>
        {["a", "b", "c", "d"].map((opt) => {
          const isSelected = answer.selected_option === opt;
          const isCorrect = answer.question.correct_option === opt;

          let backgroundColor = "#f8f9fa";
          let borderColor = "#dee2e6";
          let textColor = "#495057";

          if (isSelected && isCorrect) {
            backgroundColor = "#d4edda";
            borderColor = "#c3e6cb";
            textColor = "#155724";
          } else if (isSelected && !isCorrect) {
            backgroundColor = "#f8d7da";
            borderColor = "#f5c6cb";
            textColor = "#721c24";
          } else if (!isSelected && isCorrect) {
            backgroundColor = "#d1ecf1";
            borderColor = "#bee5eb";
            textColor = "#0c5460";
          }

          return (
            <div key={opt} style={{ marginBottom: "0.5rem" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.5rem",
                  backgroundColor,
                  border: `1px solid ${borderColor}`,
                  borderRadius: "4px",
                  color: textColor,
                  fontWeight: isSelected || isCorrect ? "bold" : "normal",
                }}
              >
                <span
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    border: `2px solid ${isSelected ? textColor : "#6c757d"}`,
                    backgroundColor: isSelected ? textColor : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {isSelected && (
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: "white",
                      }}
                    ></div>
                  )}
                </span>
                <span>
                  <strong>{opt.toUpperCase()}.</strong>{" "}
                  {answer.question[`option_${opt}`]}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {answer.question.explanation && (
        <div
          style={{
            fontSize: "0.9rem",
            color: "#6c757d",
            fontStyle: "italic",
            marginTop: "1rem",
            paddingTop: "1rem",
            borderTop: "1px solid #dee2e6",
          }}
        >
          <strong>Penjelasan:</strong> {answer.question.explanation}
        </div>
      )}
    </div>
  );

  // 🔥 NEW: Render group question
  const renderGroupQuestion = (group) => {
    const { parent, children } = group;
    const startOrder =
      children.length > 0 ? children[0].question.order_number : 0;
    const endOrder =
      children.length > 0
        ? children[children.length - 1].question.order_number
        : startOrder;

    return (
      <div
        key={parent.question.id}
        style={{
          border: "2px solid #28a745",
          borderRadius: "6px",
          marginBottom: "1rem",
          padding: "1.5rem",
          backgroundColor: "#f8fff9",
        }}
      >
        {/* Group Header */}
        <div
          style={{
            backgroundColor: "#e8f5e8",
            padding: "1rem",
            borderRadius: "4px",
            marginBottom: "1rem",
          }}
        >
          <h4
            style={{
              color: "#28a745",
              margin: "0 0 1rem 0",
            }}
          >
            Grup Soal #{startOrder}
            {children.length > 1 ? `-${endOrder}` : ""}
          </h4>

          {parent.question.question_text && (
            <div style={{ marginBottom: "1rem" }}>
              <strong>Deskripsi Grup:</strong> {parent.question.question_text}
            </div>
          )}

          {parent.question.attachment && (
            <div style={{ marginTop: "1rem" }}>
              <strong>Lampiran Grup:</strong>
              <div style={{ marginTop: "0.5rem" }}>
                {renderAttachment(parent.question.attachment)}
              </div>
            </div>
          )}

          <div style={{ fontSize: "0.9rem", color: "#6c757d" }}>
            <strong>Jumlah Subsoal:</strong> {children.length}
          </div>
        </div>

        {/* Group Children */}
        <div style={{ paddingLeft: "1rem" }}>
          <h5
            style={{
              color: "#28a745",
              marginBottom: "1rem",
              fontWeight: "600",
            }}
          >
            Subsoal dalam Grup:
          </h5>

          {children.map((answer) => (
            <div
              key={answer.id}
              style={{
                border: `2px solid ${
                  answer.is_correct ? "#28a745" : "#dc3545"
                }`,
                borderRadius: "4px",
                padding: "1rem",
                marginBottom: "1rem",
                backgroundColor: "white",
              }}
            >
              <h6
                style={{
                  margin: "0 0 1rem 0",
                  color: "#28a745",
                  fontWeight: "600",
                }}
              >
                Soal #{answer.question.order_number}.{" "}
                {answer.question.question_text}
              </h6>

              <div style={{ marginTop: "1rem" }}>
                {["a", "b", "c", "d"].map((opt) => {
                  const isSelected = answer.selected_option === opt;
                  const isCorrect = answer.question.correct_option === opt;

                  let backgroundColor = "#f8f9fa";
                  let borderColor = "#dee2e6";
                  let textColor = "#495057";

                  if (isSelected && isCorrect) {
                    backgroundColor = "#d4edda";
                    borderColor = "#c3e6cb";
                    textColor = "#155724";
                  } else if (isSelected && !isCorrect) {
                    backgroundColor = "#f8d7da";
                    borderColor = "#f5c6cb";
                    textColor = "#721c24";
                  } else if (!isSelected && isCorrect) {
                    backgroundColor = "#d1ecf1";
                    borderColor = "#bee5eb";
                    textColor = "#0c5460";
                  }

                  return (
                    <div key={opt} style={{ marginBottom: "0.5rem" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          padding: "0.5rem",
                          backgroundColor,
                          border: `1px solid ${borderColor}`,
                          borderRadius: "4px",
                          color: textColor,
                          fontWeight:
                            isSelected || isCorrect ? "bold" : "normal",
                        }}
                      >
                        <span
                          style={{
                            width: "20px",
                            height: "20px",
                            borderRadius: "50%",
                            border: `2px solid ${
                              isSelected ? textColor : "#6c757d"
                            }`,
                            backgroundColor: isSelected
                              ? textColor
                              : "transparent",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {isSelected && (
                            <div
                              style={{
                                width: "8px",
                                height: "8px",
                                borderRadius: "50%",
                                backgroundColor: "white",
                              }}
                            ></div>
                          )}
                        </span>
                        <span>
                          <strong>{opt.toUpperCase()}.</strong>{" "}
                          {answer.question[`option_${opt}`]}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {answer.question.explanation && (
                <div
                  style={{
                    fontSize: "0.9rem",
                    color: "#6c757d",
                    fontStyle: "italic",
                    marginTop: "1rem",
                    paddingTop: "1rem",
                    borderTop: "1px solid #dee2e6",
                  }}
                >
                  <strong>Penjelasan:</strong> {answer.question.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h3>Memuat hasil simulasi...</h3>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h3 style={{ color: "#dc3545" }}>Error</h3>
        <p>{error}</p>
        <button
          onClick={() => navigate(`${getBasePath()}/simulasi/hasil`)}
          style={{
            backgroundColor: "#B6252A",
            color: "white",
            border: "none",
            padding: "0.5rem 1rem",
            borderRadius: "4px",
            cursor: "pointer",
            marginRight: "1rem",
            fontWeight: "500",
          }}
        >
          Pilih dari Daftar Simulasi
        </button>
        <button
          onClick={() => navigate(`${getBasePath()}/simulasi`)}
          style={{
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            padding: "0.5rem 1rem",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "500",
          }}
        >
          Kembali ke Menu Simulasi
        </button>
      </div>
    );
  }

  if (!results) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h3>Hasil tidak ditemukan</h3>
        <button
          onClick={() => navigate(`${getBasePath()}/simulasi/hasil`)}
          style={{
            backgroundColor: "#B6252A",
            color: "white",
            border: "none",
            padding: "0.75rem 1.5rem",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "500",
          }}
        >
          Pilih dari Daftar Simulasi
        </button>
      </div>
    );
  }

  const {
    simulation,
    answers,
    group_parents,
    scores,
    raw_scores,
    time_spent,
    score_interpretation,
  } = results;
  const answersByModule = {
    listening: answers.filter((a) => a.question.modul === "listening"),
    structure: answers.filter((a) => a.question.modul === "structure"),
    reading: answers.filter((a) => a.question.modul === "reading"),
  };

  return (
    <div
      style={{
        height: "100%",
        overflow: "auto",
        backgroundColor: "#f8f9fa",
      }}
    >
      <div
        style={{
          padding: "1.5rem",
          maxWidth: "1000px",
          margin: "0 auto",
          paddingBottom: "3rem",
        }}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: "#B6252A",
            color: "white",
            padding: "1.5rem",
            borderRadius: "8px",
            marginBottom: "2rem",
            textAlign: "center",
          }}
        >
          <h2 style={{ margin: "0 0 0.5rem 0", fontWeight: "600" }}>
            Hasil Simulasi TOEFL ITP
          </h2>
          <p style={{ margin: 0, opacity: 0.9 }}>
            Diselesaikan pada:{" "}
            {new Date(simulation.finished_at).toLocaleString("id-ID")}
          </p>
        </div>

        {/* Overall Score Card */}
        <div
          style={{
            backgroundColor: "white",
            border: "3px solid #B6252A",
            borderRadius: "12px",
            padding: "2rem",
            marginBottom: "2rem",
            textAlign: "center",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          }}
        >
          <h3
            style={{
              margin: "0 0 1rem 0",
              color: "#495057",
              fontWeight: "600",
            }}
          >
            Total TOEFL ITP Score
          </h3>
          <div
            style={{
              fontSize: "3rem",
              fontWeight: "bold",
              color: getScoreColor(scores.total),
              marginBottom: "0.5rem",
            }}
          >
            {scores.total}
          </div>
          <div
            style={{
              fontSize: "1.2rem",
              color: "#6c757d",
              marginBottom: "1rem",
              fontWeight: "500",
            }}
          >
            {getScoreInterpretation(scores.total)}
          </div>
          <div
            style={{
              display: "inline-block",
              backgroundColor: getCEFRColor(scores.cefr_level),
              color: "white",
              padding: "0.5rem 1rem",
              borderRadius: "20px",
              fontSize: "1rem",
              fontWeight: "bold",
            }}
          >
            CEFR Level: {scores.cefr_level}
          </div>
          <div
            style={{
              fontSize: "0.9rem",
              color: "#6c757d",
              marginTop: "1rem",
            }}
          >
            Score Range: {score_interpretation.total_range} | Total Time:{" "}
            {formatTime(time_spent.total)}
          </div>
        </div>

        {/* Section Scores */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          {/* Listening Score */}
          <div
            style={{
              backgroundColor: "white",
              border: "1px solid #dee2e6",
              borderRadius: "8px",
              padding: "1.5rem",
              textAlign: "center",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            }}
          >
            <h4
              style={{
                margin: "0 0 0.5rem 0",
                color: "#495057",
                fontWeight: "600",
              }}
            >
              Listening Comprehension
            </h4>
            <div
              style={{
                fontSize: "2rem",
                fontWeight: "bold",
                color: getScoreColor(scores.listening),
                marginBottom: "0.5rem",
              }}
            >
              {scores.listening}
            </div>
            <div
              style={{
                fontSize: "14px",
                color: "#6c757d",
                marginBottom: "0.5rem",
              }}
            >
              Raw Score: {raw_scores.listening.correct}/
              {raw_scores.listening.total} ({raw_scores.listening.percentage}%)
            </div>
            <div style={{ fontSize: "12px", color: "#6c757d" }}>
              Time: {formatTime(time_spent.listening)} | Range:{" "}
              {score_interpretation.listening_range}
            </div>
          </div>

          {/* Structure Score */}
          <div
            style={{
              backgroundColor: "white",
              border: "1px solid #dee2e6",
              borderRadius: "8px",
              padding: "1.5rem",
              textAlign: "center",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            }}
          >
            <h4
              style={{
                margin: "0 0 0.5rem 0",
                color: "#495057",
                fontWeight: "600",
              }}
            >
              Structure & Written Expression
            </h4>
            <div
              style={{
                fontSize: "2rem",
                fontWeight: "bold",
                color: getScoreColor(scores.structure),
                marginBottom: "0.5rem",
              }}
            >
              {scores.structure}
            </div>
            <div
              style={{
                fontSize: "14px",
                color: "#6c757d",
                marginBottom: "0.5rem",
              }}
            >
              Raw Score: {raw_scores.structure.correct}/
              {raw_scores.structure.total} ({raw_scores.structure.percentage}%)
            </div>
            <div style={{ fontSize: "12px", color: "#6c757d" }}>
              Time: {formatTime(time_spent.structure)} | Range:{" "}
              {score_interpretation.structure_range}
            </div>
          </div>

          {/* Reading Score */}
          <div
            style={{
              backgroundColor: "white",
              border: "1px solid #dee2e6",
              borderRadius: "8px",
              padding: "1.5rem",
              textAlign: "center",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            }}
          >
            <h4
              style={{
                margin: "0 0 0.5rem 0",
                color: "#495057",
                fontWeight: "600",
              }}
            >
              Reading Comprehension
            </h4>
            <div
              style={{
                fontSize: "2rem",
                fontWeight: "bold",
                color: getScoreColor(scores.reading),
                marginBottom: "0.5rem",
              }}
            >
              {scores.reading}
            </div>
            <div
              style={{
                fontSize: "14px",
                color: "#6c757d",
                marginBottom: "0.5rem",
              }}
            >
              Raw Score: {raw_scores.reading.correct}/{raw_scores.reading.total}{" "}
              ({raw_scores.reading.percentage}%)
            </div>
            <div style={{ fontSize: "12px", color: "#6c757d" }}>
              Time: {formatTime(time_spent.reading)} | Range:{" "}
              {score_interpretation.reading_range}
            </div>
          </div>
        </div>

        {/* CEFR Reference */}
        <div
          style={{
            backgroundColor: "#f8f9fa",
            border: "1px solid #dee2e6",
            borderRadius: "8px",
            padding: "1.5rem",
            marginBottom: "2rem",
          }}
        >
          <h3
            style={{
              margin: "0 0 1rem 0",
              color: "#495057",
              fontWeight: "600",
            }}
          >
            CEFR Level Reference
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
              gap: "0.5rem",
            }}
          >
            {Object.entries(score_interpretation.cefr_mapping).map(
              ([level, range]) => (
                <div
                  key={level}
                  style={{
                    padding: "0.5rem",
                    borderRadius: "4px",
                    textAlign: "center",
                    backgroundColor:
                      level === scores.cefr_level
                        ? getCEFRColor(level)
                        : "#e9ecef",
                    color: level === scores.cefr_level ? "white" : "#495057",
                    fontWeight: level === scores.cefr_level ? "bold" : "normal",
                  }}
                >
                  <div style={{ fontSize: "14px", fontWeight: "600" }}>
                    {level}
                  </div>
                  <div style={{ fontSize: "12px", opacity: 0.8 }}>{range}</div>
                </div>
              )
            )}
          </div>
        </div>

        {/* 🔥 FIXED: Detailed Results by Section with Group Support */}
        {Object.entries(answersByModule).map(([module, moduleAnswers]) => {
          const organized = organizeAnswers(moduleAnswers, group_parents);

          return (
            <div
              key={module}
              style={{
                backgroundColor: "white",
                border: "1px solid #dee2e6",
                borderRadius: "8px",
                padding: "1.5rem",
                marginBottom: "2rem",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                height: "500px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <h3
                style={{
                  margin: "0 0 1rem 0",
                  color: "#B6252A",
                  fontWeight: "600",
                  flexShrink: 0,
                  fontSize: "1.2rem",
                }}
              >
                {module === "structure"
                  ? "Structure & Written Expression"
                  : module.charAt(0).toUpperCase() + module.slice(1)}{" "}
                Comprehension
              </h3>

              <div
                style={{
                  marginBottom: "1rem",
                  padding: "0.75rem",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "4px",
                  border: "1px solid #dee2e6",
                  flexShrink: 0,
                }}
              >
                <strong>
                  Score: {scores[module]} | Raw Score:{" "}
                  {raw_scores[module].correct}/{raw_scores[module].total} (
                  {raw_scores[module].percentage}%) | Time:{" "}
                  {formatTime(time_spent[module])}
                </strong>
              </div>

              {/* SCROLLABLE CONTAINER FOR THIS MODULE */}
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  border: "1px solid #e9ecef",
                  borderRadius: "4px",
                  padding: "1rem",
                }}
              >
                {/* 🔥 FIXED: Render semua soal dalam urutan yang benar */}
                {(() => {
                  // Kombinasi individuals dan groups dengan sortOrder
                  const combined = [];

                  // Tambahkan individuals
                  organized.individuals.forEach((answer) => {
                    combined.push({
                      type: "individual",
                      sortOrder: answer.question.order_number || 0,
                      data: answer,
                    });
                  });

                  // Tambahkan groups
                  organized.groups.forEach((group) => {
                    const firstChildOrder =
                      group.children.length > 0
                        ? group.children[0].question.order_number
                        : 9999;

                    combined.push({
                      type: "group",
                      sortOrder: firstChildOrder,
                      data: group,
                    });
                  });

                  // Sort berdasarkan order_number
                  return combined
                    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                    .map((item, index) => {
                      if (item.type === "individual") {
                        return renderIndividualQuestion(item.data);
                      } else {
                        return renderGroupQuestion(item.data);
                      }
                    });
                })()}
              </div>
            </div>
          );
        })}

        {/* Disclaimer */}
        <div
          style={{
            backgroundColor: "#fff3cd",
            color: "#856404",
            padding: "1rem",
            borderRadius: "6px",
            border: "1px solid #ffeaa7",
            marginBottom: "2rem",
            fontSize: "14px",
          }}
        >
          <strong>Disclaimer:</strong> Ini adalah simulasi TOEFL ITP untuk
          latihan. Skor ini tidak dapat digunakan untuk keperluan resmi. Untuk
          tes resmi, silakan daftar di pusat tes TOEFL ITP yang diakui ETS.
        </div>

        {/* Action Buttons */}
        <div
          style={{
            textAlign: "center",
            marginTop: "2rem",
            backgroundColor: "white",
            padding: "1.5rem",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            border: "1px solid #dee2e6",
          }}
        >
          <button
            onClick={() => navigate(`${getBasePath()}/simulasi/hasil`)}
            style={{
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              padding: "1rem 2rem",
              fontSize: "16px",
              borderRadius: "8px",
              cursor: "pointer",
              marginRight: "1rem",
              fontWeight: "500",
            }}
          >
            Daftar Hasil Simulasi
          </button>

          <button
            onClick={() => navigate(`${getBasePath()}/simulasi`)}
            style={{
              backgroundColor: "#B6252A",
              color: "white",
              border: "none",
              padding: "1rem 2rem",
              fontSize: "16px",
              borderRadius: "8px",
              cursor: "pointer",
              marginRight: "1rem",
              fontWeight: "500",
            }}
          >
            Kembali ke Menu Simulasi
          </button>

          <button
            onClick={() => window.print()}
            style={{
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              padding: "1rem 2rem",
              fontSize: "16px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "500",
            }}
          >
            Print Hasil
          </button>
        </div>
      </div>
    </div>
  );
}

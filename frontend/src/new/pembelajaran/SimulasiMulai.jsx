import React, { useEffect, useState, useRef } from "react";
import Timer from "./Timer";
import axiosInstance from "../../services/axios";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Confirm from "../shared/components/Confirm";

export default function SimulasiMulai() {
  //modal konfirm next
  const [showUnansweredModal, setShowUnansweredModal] = useState(false);
  const [unansweredCount, setUnansweredCount] = useState(0);

  const [questionGroups, setQuestionGroups] = useState([]);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [simulationId, setSimulationId] = useState(null);
  const [currentSection, setCurrentSection] = useState("");
  const [timeLimit, setTimeLimit] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [audioPlayed, setAudioPlayed] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const audioRef = useRef(null);

  const token = localStorage.getItem("token");

  const navigate = useNavigate();

  // Role detection untuk dynamic paths
  const getCurrentRole = () => localStorage.getItem("role");
  const getBasePath = () =>
    getCurrentRole() === "instruktur" ? "/instructor" : "/student";

  const SECTION_NAMES = {
    listening: "Listening Comprehension",
    structure: "Structure and Written Expression",
    reading: "Reading Comprehension",
  };
  const scrollableRef = useRef(null);

  // FIX RELOAD: Auto-resume incomplete simulation saat component mount
  useEffect(() => {
    initializeSimulation();
  }, [token]);

  const contentRef = useRef(null);

  const initializeSimulation = async () => {
    try {
      console.log("Checking simulation eligibility...");

      // Check eligibility dan incomplete simulation
      const eligibilityRes = await axiosInstance.get(
        "/simulations/eligibility?simulation_set_id=1",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!eligibilityRes.data.eligible) {
        alert(eligibilityRes.data.reason || eligibilityRes.data.message);
        window.location.href = `${getBasePath()}/simulasi`;
        return;
      }

      // RESUME LOGIC: Check if ada simulasi belum selesai
      if (eligibilityRes.data.has_incomplete) {
        const incompleteSimulation = eligibilityRes.data.incomplete_simulation;
        console.log("Resuming incomplete simulation:", incompleteSimulation.id);

        // Resume simulasi yang sudah ada
        setSimulationId(incompleteSimulation.id);
        await loadQuestions(incompleteSimulation.id);
        return;
      }

      // NEW SIMULATION: Confirm start jika simulasi baru

      // Start simulation baru
      console.log("Starting new simulation...");
      const startRes = await axiosInstance.post(
        "/simulations/start",
        { simulation_set_id: 1 },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const simId = startRes.data.simulation_id;
      setSimulationId(simId);

      // Load section questions
      await loadQuestions(simId);
    } catch (err) {
      console.error("SIMULATION ERROR:", err);

      if (err.response?.status === 403) {
        alert(
          "Akses simulasi tidak diizinkan: " +
            (err.response?.data?.error || "Paket tidak mendukung simulasi")
        );
        window.location.href = `${getBasePath()}/simulasi`;
        return;
      }

      alert(
        "Gagal memulai simulasi: " +
          (err.response?.data?.error ||
            err.response?.data?.message ||
            err.message)
      );
      window.location.href = "${getBasePath()}/simulasi";
    }
  };

  // REPLACE loadQuestions method di SimulasiMulai.jsx dengan ini:

  const loadQuestions = async (simId) => {
    try {
      setLoading(true);
      console.log("Loading questions for simulation:", simId);

      const res = await axiosInstance.get(`/simulations/${simId}/questions`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const questions = res.data.questions || [];
      const groups = organizeQuestionsIntoGroups(questions);

      setQuestionGroups(groups);
      setCurrentSection(res.data.current_section);
      setTimeLimit(res.data.time_limit);
      setCurrentGroupIndex(0); // useEffect akan handle scroll otomatis
      setAudioPlayed({});

      console.log(
        "Questions loaded for section:",
        res.data.current_section,
        "Groups:",
        groups.length
      );

      try {
        console.log("Loading existing answers...");
        const answersRes = await axiosInstance.get(
          `/simulations/${simId}/existing-answers`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (answersRes.data.existing_answers) {
          console.log("Existing answers loaded:", {
            section: answersRes.data.section,
            total_answered: answersRes.data.total_answered,
          });

          setAnswers(answersRes.data.existing_answers);

          const firstUnansweredIndex = groups.findIndex((group) => {
            return group.questions.some(
              (q) => !answersRes.data.existing_answers[q.id]
            );
          });

          if (firstUnansweredIndex !== -1) {
            setCurrentGroupIndex(firstUnansweredIndex); // useEffect akan handle scroll otomatis
            console.log("Resuming from group index:", firstUnansweredIndex);
          }
        } else {
          console.log("No existing answers found - starting fresh");
          setAnswers({});
        }
      } catch (answerError) {
        console.warn("Failed to load existing answers:", answerError);
        setAnswers({});
      }

      setLoading(false);
      console.log("✅ loadQuestions completed successfully");

      // HAPUS manual scroll - sudah di-handle useEffect

      if (res.data.current_section === "listening" && groups.length > 0) {
        setTimeout(() => {
          autoPlayAudio(groups[0], res.data.current_section);
        }, 2000);
      }
    } catch (err) {
      console.error("Error loading questions:", err);

      if (err.response?.status === 403) {
        alert(
          "Akses simulasi tidak diizinkan: " +
            (err.response?.data?.error || "Paket tidak mendukung simulasi")
        );
        window.location.href = `${getBasePath()}/simulasi`;
        return;
      }

      alert("Gagal memuat soal");
      window.location.href = `${getBasePath()}/simulasi`;

      setLoading(false);
    }
  };

  const organizeQuestionsIntoGroups = (questions) => {
    const groups = [];
    const processedQuestions = new Set();

    const sortedQuestions = [...questions].sort((a, b) => {
      const aOrder = a.order_number || 999999;
      const bOrder = b.order_number || 999999;
      return aOrder - bOrder;
    });

    const groupParents = sortedQuestions.filter(
      (q) =>
        q.group_id === q.id &&
        (q.correct_option === null || q.correct_option === "")
    );

    groupParents.forEach((parent) => {
      const children = sortedQuestions
        .filter(
          (q) =>
            q.group_id === parent.id &&
            q.id !== parent.id &&
            q.correct_option !== null &&
            q.correct_option !== ""
        )
        .sort((a, b) => (a.order_number || 0) - (b.order_number || 0));

      if (children.length > 0) {
        const group = {
          type: "group",
          id: parent.id,
          description: parent.question_text || "",
          attachment: parent.attachment,
          questions: children,
          startNumber: children[0]?.order_number || 0,
        };

        groups.push(group);
        processedQuestions.add(parent.id);
        children.forEach((child) => processedQuestions.add(child.id));
      } else {
        processedQuestions.add(parent.id);
      }
    });

    const individualQuestions = sortedQuestions.filter(
      (q) =>
        !processedQuestions.has(q.id) &&
        !q.group_id &&
        q.correct_option !== null &&
        q.correct_option !== ""
    );

    individualQuestions.forEach((question) => {
      const individualGroup = {
        type: "individual",
        id: question.id,
        questions: [question],
        startNumber: question.order_number || 0,
        attachment: question.attachment,
      };

      groups.push(individualGroup);
    });

    return groups.sort((a, b) => a.startNumber - b.startNumber);
  };

  const autoPlayAudio = (group, section) => {
    if (section !== "listening") return;

    const groupKey = `group_${group.id}`;
    if (audioPlayed[groupKey]) return;

    const audioSource = group.attachment || group.questions[0]?.attachment;
    if (!audioSource) return;

    if (audioRef.current) {
      const fullAudioPath = `http://localhost:8000${audioSource}`;
      audioRef.current.load();
      audioRef.current.src = fullAudioPath;

      const playPromise = audioRef.current.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setAudioPlayed((prev) => ({ ...prev, [groupKey]: true }));
          })
          .catch((err) => {
            console.error("Audio auto-play failed:", err);
            setAudioPlayed((prev) => ({ ...prev, [groupKey]: false }));
          });
      }
    }
  };

  const handleAudioEnded = () => {
    console.log("Audio playback finished");
  };

  const handleManualAudioPlay = (group) => {
    const groupKey = `group_${group.id}`;
    const audioSource = group.attachment || group.questions[0]?.attachment;

    if (audioRef.current && audioSource) {
      audioRef.current.src = `http://localhost:8000${audioSource}`;
      audioRef.current
        .play()
        .then(() => {
          setAudioPlayed((prev) => ({ ...prev, [groupKey]: true }));
        })
        .catch((err) => {
          console.error("Manual audio play failed:", err);
        });
    }
  };

  const handleSelect = (qId, value) => {
    setAnswers({ ...answers, [qId]: value });
  };

  const handleTimeUpdate = (spent) => {
    setTimeSpent(spent);
  };

  // TIMER EXPIRE: Handle auto-submit ketika waktu habis
  const handleTimeUp = async (isAutoSubmit = true) => {
    if (isSubmitting) {
      console.log("Already submitting, ignoring time up");
      return;
    }

    console.log("TIME UP - Auto submitting section:", currentSection);

    if (isAutoSubmit) {
      alert(
        `Waktu ${SECTION_NAMES[currentSection]} habis! Section akan disubmit otomatis.`
      );
    }

    // Call submitSection untuk auto-submit
    await submitSection(true); // Auto submit = true
  };

  // Update handleNext method - perbaiki timing scroll:

  const handleNext = async () => {
    const currentGroup = questionGroups[currentGroupIndex];

    const unansweredInGroup = currentGroup.questions.filter(
      (q) => !answers[q.id]
    );
    if (unansweredInGroup.length > 0) {
      setUnansweredCount(unansweredInGroup.length);
      setShowUnansweredModal(true);
      return;
    }

    try {
      setIsSubmitting(true);

      const groupAnswers = currentGroup.questions.map((q) => ({
        question_id: q.id,
        selected_option: answers[q.id],
      }));

      console.log("Submitting question answers:", {
        group_id: currentGroup.id,
        answers_count: groupAnswers.length,
        question_ids: groupAnswers.map((a) => a.question_id),
      });

      const response = await axiosInstance.post(
        "/simulations/submit-question",
        {
          simulation_id: simulationId,
          answers: groupAnswers,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.data || response.status !== 200) {
        throw new Error("Server response tidak valid");
      }

      console.log("✅ Question submitted successfully:", response.data);

      if (response.data.is_last_in_section) {
        console.log("Last question in section - triggering section completion");
        await submitSection(false);
      } else {
        if (currentGroupIndex < questionGroups.length - 1) {
          const nextIndex = currentGroupIndex + 1;

          // 🔥 SCROLL SEBELUM STATE UPDATE
          console.log("🔄 Scrolling to top BEFORE navigation...");

          // Method 1: Window scroll
          window.scrollTo(0, 0);
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;

          // Method 2: Ref scroll (jika ada)
          if (scrollableRef.current) {
            scrollableRef.current.scrollTop = 0;
            scrollableRef.current.scrollTo({ top: 0, behavior: "auto" });
          }

          console.log("📜 Forced scroll completed");

          // Baru update state
          setCurrentGroupIndex(nextIndex);

          console.log("✅ Navigated to next group:", nextIndex);

          if (currentSection === "listening") {
            setTimeout(
              () => autoPlayAudio(questionGroups[nextIndex], currentSection),
              800
            );
          }
        }
      }
    } catch (err) {
      console.error("❌ Submit failed:", err);

      if (err.response?.status === 403) {
        alert(
          "Akses simulasi tidak diizinkan: " +
            (err.response?.data?.error || "Paket tidak mendukung simulasi")
        );
        window.location.href = `${getBasePath()}/simulasi`;
        return;
      }

      if (err.response?.status === 500) {
        alert(
          "Terjadi kesalahan server. Silakan coba lagi atau hubungi administrator."
        );
      } else if (err.code === "ERR_NETWORK") {
        alert(
          "Koneksi internet bermasalah. Pastikan koneksi stabil dan coba lagi."
        );
      } else {
        const errorMsg =
          err.response?.data?.error ||
          err.response?.data?.message ||
          err.message;
        alert(
          "Gagal menyimpan jawaban: " + errorMsg + "\n\nSilakan coba lagi."
        );
      }

      console.log("❌ Navigation blocked due to save failure");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitSection = () => {
    // PRIORITAS 1: CEK SOAL BELUM DIJAWAB DULU
    const allQuestions = questionGroups.flatMap((group) => group.questions);
    const unansweredCount = allQuestions.filter((q) => !answers[q.id]).length;

    if (unansweredCount > 0) {
      // Jika ada soal belum dijawab, tampilkan modal unanswered
      setUnansweredCount(unansweredCount);
      setShowUnansweredModal(true);
      return; // STOP - tidak lanjut submit
    }

    // PRIORITAS 2: Jika semua sudah dijawab, baru submit
    submitSection(false); // Manual submit
  };

  const submitSection = async (isAutoSubmit = false) => {
    if (isSubmitting) {
      console.log("Already submitting, aborting duplicate submit");
      return;
    }

    try {
      setIsSubmitting(true);
      setLoading(true);

      console.log("🔄 Starting submitSection:", {
        section: currentSection,
        isAutoSubmit,
        timeSpent,
        simulationId,
        isSubmitting: true,
        timestamp: new Date().toISOString(),
      });

      // CLEAN PAYLOAD: No answers - sudah disimpan via submitQuestion
      const payload = {
        simulation_id: simulationId,
        section: currentSection,
        time_spent: timeSpent,
      };

      console.log("📤 Sending payload:", payload);

      let res;
      if (isAutoSubmit) {
        console.log("🔄 Calling auto-submit-section...");
        res = await axiosInstance.post(
          "/simulations/auto-submit-section",
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        console.log("🔄 Calling submit-section...");
        res = await axiosInstance.post("/simulations/submit-section", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      console.log("✅ Backend response received:", {
        status: res.status,
        data: res.data,
        timestamp: new Date().toISOString(),
      });

      if (res.data.completed) {
        const message = isAutoSubmit
          ? "Simulasi selesai karena waktu habis! Anda akan diarahkan ke hasil."
          : "Simulasi selesai! Anda akan diarahkan ke hasil.";
        console.log(" Simulation completed, redirecting...");
        console.log(" Simulation completed, redirecting...");
        window.location.href = `${getBasePath()}/simulasi/hasil/${simulationId}`;
      } else {
        const nextSectionName =
          SECTION_NAMES[res.data.next_section] || res.data.next_section;
        const message = isAutoSubmit
          ? `Section ${SECTION_NAMES[currentSection]} disubmit otomatis karena waktu habis. Lanjut ke ${nextSectionName}.`
          : `Section ${SECTION_NAMES[currentSection]} selesai. Lanjut ke ${nextSectionName}.`;

        console.log("🔄 Moving to next section:", {
          currentSection,
          nextSection: res.data.next_section,
          nextSectionName,
        });

        console.log("🔄 Section completed, loading next section...");

        console.log("🔄 Loading questions for next section...");

        // Load questions untuk section selanjutnya
        await loadQuestions(simulationId);

        console.log("✅ Questions loaded for next section");

        // 🔥 CRITICAL FIX: Reset loading states setelah loadQuestions selesai
        setLoading(false);
        setIsSubmitting(false);

        console.log("🔄 Loading and submitting states reset");
      }
    } catch (err) {
      console.error("❌ submitSection ERROR:", {
        error: err,
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        timestamp: new Date().toISOString(),
      });

      if (err.response?.status === 403) {
        alert(
          "Akses simulasi tidak diizinkan: " +
            (err.response?.data?.error || "Paket tidak mendukung simulasi")
        );
        window.location.href = `${getBasePath()}/simulasi`;
        return;
      }

      const errorMsg =
        err.response?.data?.error || err.response?.data?.message || err.message;
      alert("Gagal finalisasi section: " + errorMsg);

      // CRITICAL: Reset states pada error
      setLoading(false);
      setIsSubmitting(false);
    } finally {
      console.log("🔄 submitSection finally block executed");
    }
  };

  if (loading) {
    return (
      <div
        style={{
          padding: "2rem",
          textAlign: "center",
          fontFamily: "Poppins, sans-serif",
        }}
      >
        <h3>Memuat simulasi...</h3>
        <p>Mohon tunggu sebentar.</p>
      </div>
    );
  }

  if (questionGroups.length === 0) {
    return (
      <div
        style={{
          padding: "2rem",
          textAlign: "center",
          fontFamily: "Poppins, sans-serif",
        }}
      >
        <h3>Tidak ada soal tersedia</h3>
        <button
          onClick={() => (window.location.href = "/simulasi")}
          style={{
            backgroundColor: "#B6252A",
            color: "white",
            border: "none",
            padding: "0.75rem 1.5rem",
            borderRadius: "4px",
            cursor: "pointer",
            fontFamily: "Poppins, sans-serif",
          }}
        >
          Kembali
        </button>
      </div>
    );
  }

  const currentGroup = questionGroups[currentGroupIndex];
  const totalQuestions = questionGroups.reduce(
    (sum, group) => sum + group.questions.length,
    0
  );
  const answeredCount = Object.keys(answers).length;

  return (
    <div
      ref={contentRef}
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      <audio
        ref={audioRef}
        onEnded={handleAudioEnded}
        style={{ display: "none" }}
        preload="auto"
      />

      {/* TIMER: Updated dengan backend timer baru untuk resume */}
      <Timer
        timeLimit={timeLimit}
        onTimeUp={handleTimeUp}
        onTimeUpdate={handleTimeUpdate}
        isActive={!isSubmitting}
        section={currentSection}
        simulationId={simulationId}
      />

      {/* Fixed Header */}
      <div
        style={{
          flexShrink: 0,
          backgroundColor: "#B6252A",
          color: "white",
          padding: "1rem",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            margin: "0 0 0.5rem 0",
            fontSize: "18px",
            fontWeight: "bold",
          }}
        >
          Simulasi Latihan TOEFL ITP Level 1
        </h2>
        <h3
          style={{
            margin: "0 0 0.5rem 0",
            fontSize: "14px",
            fontWeight: "normal",
          }}
        >
          Section: {SECTION_NAMES[currentSection]}
        </h3>
        <p style={{ margin: 0, fontSize: "12px", opacity: 0.9 }}>
          Questions Answered: {answeredCount} of {totalQuestions}
        </p>
        {isSubmitting && (
          <p
            style={{
              margin: "0.5rem 0 0 0",
              fontSize: "12px",
              opacity: 0.9,
              fontStyle: "italic",
            }}
          >
            Submitting section...
          </p>
        )}
      </div>

      {/* Scrollable Content */}
      <div
        ref={scrollableRef} // ← TAMBAH REF BARU
        style={{
          flex: 1,
          overflow: "auto",
          padding: "1rem",
          backgroundColor: "#f8f9fa",
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            border: "1px solid #ddd",
            borderRadius: "6px",
            padding: "1.5rem",
            marginBottom: "1rem",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          {currentGroup.type === "group" && (
            <div
              style={{
                backgroundColor: "#f8f9fa",
                padding: "1.5rem",
                borderRadius: "6px",
                marginBottom: "2rem",
                border: "1px solid #dee2e6",
              }}
            >
              <h3
                style={{
                  color: "#495057",
                  marginBottom: "1rem",
                  fontSize: "16px",
                  fontWeight: "bold",
                }}
              >
                Questions {currentGroup.questions[0]?.order_number} -{" "}
                {
                  currentGroup.questions[currentGroup.questions.length - 1]
                    ?.order_number
                }
              </h3>

              {currentGroup.description && (
                <div style={{ marginBottom: "1rem" }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "14px",
                      lineHeight: "1.6",
                      color: "#555",
                    }}
                  >
                    {currentGroup.description}
                  </p>
                </div>
              )}

              {currentGroup.attachment && (
                <div style={{ marginBottom: "1rem" }}>
                  <h4
                    style={{
                      color: "#495057",
                      marginBottom: "0.5rem",
                      fontSize: "14px",
                      fontWeight: "bold",
                    }}
                  >
                    Audio:
                  </h4>

                  {(() => {
                    const groupKey = `group_${currentGroup.id}`;
                    const hasPlayed = audioPlayed[groupKey];

                    if (currentSection === "listening") {
                      return (
                        <div
                          style={{
                            padding: "1rem",
                            backgroundColor: hasPlayed ? "#d4edda" : "#fff3cd",
                            border: `1px solid ${
                              hasPlayed ? "#c3e6cb" : "#ffeaa7"
                            }`,
                            borderRadius: "4px",
                            textAlign: "center",
                          }}
                        >
                          {hasPlayed ? (
                            <div>
                              <strong
                                style={{ color: "#155724", fontSize: "14px" }}
                              >
                                Audio has been played
                              </strong>
                              <p
                                style={{
                                  margin: "0.5rem 0 0 0",
                                  color: "#155724",
                                  fontSize: "12px",
                                }}
                              >
                                Audio cannot be replayed. Answer all questions
                                below.
                              </p>
                            </div>
                          ) : (
                            <div>
                              <strong
                                style={{ color: "#856404", fontSize: "14px" }}
                              >
                                {currentGroupIndex === 0
                                  ? "Ready to play audio"
                                  : "Audio is playing..."}
                              </strong>
                              <p
                                style={{
                                  margin: "0.5rem 0 0 0",
                                  color: "#856404",
                                  fontSize: "12px",
                                }}
                              >
                                {currentGroupIndex === 0
                                  ? "Click the button below to start audio for this question."
                                  : "Listen carefully. Audio will play only once."}
                              </p>
                              <button
                                onClick={() =>
                                  handleManualAudioPlay(currentGroup)
                                }
                                disabled={isSubmitting}
                                style={{
                                  marginTop: "0.5rem",
                                  backgroundColor: isSubmitting
                                    ? "#6c757d"
                                    : "#B6252A",
                                  color: "white",
                                  border: "none",
                                  padding: "0.3rem 0.8rem",
                                  borderRadius: "4px",
                                  cursor: isSubmitting
                                    ? "not-allowed"
                                    : "pointer",
                                  fontSize: "12px",
                                  fontFamily: "Poppins, sans-serif",
                                }}
                              >
                                {currentGroupIndex === 0
                                  ? "Play Audio"
                                  : "Click if audio doesn't start"}
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    } else {
                      return (
                        <audio
                          src={`http://localhost:8000${currentGroup.attachment}`}
                          controls
                          style={{ width: "100%" }}
                        />
                      );
                    }
                  })()}
                </div>
              )}
            </div>
          )}

          {currentGroup.type === "individual" && currentGroup.attachment && (
            <div
              style={{
                backgroundColor: "#f8f9fa",
                padding: "1.5rem",
                borderRadius: "6px",
                marginBottom: "2rem",
                border: "1px solid #dee2e6",
              }}
            >
              <h3
                style={{
                  color: "#495057",
                  marginBottom: "1rem",
                  fontSize: "16px",
                  fontWeight: "bold",
                }}
              >
                Question {currentGroup.questions[0]?.order_number}
              </h3>

              <div style={{ marginBottom: "1rem" }}>
                <h4
                  style={{
                    color: "#495057",
                    marginBottom: "0.5rem",
                    fontSize: "14px",
                    fontWeight: "bold",
                  }}
                >
                  Audio:
                </h4>

                {(() => {
                  const groupKey = `group_${currentGroup.id}`;
                  const hasPlayed = audioPlayed[groupKey];

                  if (currentSection === "listening") {
                    return (
                      <div
                        style={{
                          padding: "1rem",
                          backgroundColor: hasPlayed ? "#d4edda" : "#fff3cd",
                          border: `1px solid ${
                            hasPlayed ? "#c3e6cb" : "#ffeaa7"
                          }`,
                          borderRadius: "4px",
                          textAlign: "center",
                        }}
                      >
                        {hasPlayed ? (
                          <div>
                            <strong
                              style={{ color: "#155724", fontSize: "14px" }}
                            >
                              Audio has been played
                            </strong>
                            <p
                              style={{
                                margin: "0.5rem 0 0 0",
                                color: "#155724",
                                fontSize: "12px",
                              }}
                            >
                              Audio cannot be replayed. Answer the question
                              below.
                            </p>
                          </div>
                        ) : (
                          <div>
                            <strong
                              style={{ color: "#856404", fontSize: "14px" }}
                            >
                              Audio is playing...
                            </strong>
                            <p
                              style={{
                                margin: "0.5rem 0 0 0",
                                color: "#856404",
                                fontSize: "12px",
                              }}
                            >
                              Listen carefully. Audio will play only once.
                            </p>
                            <button
                              onClick={() =>
                                handleManualAudioPlay(currentGroup)
                              }
                              disabled={isSubmitting}
                              style={{
                                marginTop: "0.5rem",
                                backgroundColor: isSubmitting
                                  ? "#6c757d"
                                  : "#B6252A",
                                color: "white",
                                border: "none",
                                padding: "0.3rem 0.8rem",
                                borderRadius: "4px",
                                cursor: isSubmitting
                                  ? "not-allowed"
                                  : "pointer",
                                fontSize: "12px",
                                fontFamily: "Poppins, sans-serif",
                              }}
                            >
                              Click if audio doesn't start
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  } else {
                    return (
                      <audio
                        src={`http://localhost:8000${currentGroup.attachment}`}
                        controls
                        style={{ width: "100%" }}
                      />
                    );
                  }
                })()}
              </div>
            </div>
          )}

          <div>
            {currentGroup.questions.map((question, qIndex) => (
              <div
                key={question.id}
                style={{
                  marginBottom: "2rem",
                  padding: "1.5rem",
                  border: "1px solid #e9ecef",
                  borderRadius: "6px",
                  backgroundColor: answers[question.id] ? "#f8f9ff" : "white",
                }}
              >
                <h4
                  style={{
                    color: "#495057",
                    marginBottom: "1rem",
                    fontSize: "15px",
                    fontWeight: "bold",
                  }}
                >
                  {question.order_number}. {question.question_text}
                </h4>

                {question.attachment &&
                  question.attachment !== currentGroup.attachment && (
                    <div style={{ marginBottom: "1rem" }}>
                      {question.attachment.match(/\.(jpg|jpeg|png|gif)$/i) && (
                        <img
                          src={`http://localhost:8000${question.attachment}`}
                          style={{ maxWidth: "400px", maxHeight: "300px" }}
                          alt="Question attachment"
                        />
                      )}
                      {question.attachment.match(/\.(mp3|wav|ogg)$/i) && (
                        <audio
                          src={`http://localhost:8000${question.attachment}`}
                          controls
                          style={{ width: "100%" }}
                        />
                      )}
                    </div>
                  )}

                <div>
                  {["a", "b", "c", "d"].map((opt) => (
                    <div key={opt} style={{ marginBottom: "0.5rem" }}>
                      <label
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          cursor: isSubmitting ? "not-allowed" : "pointer",
                          padding: "0.5rem",
                          borderRadius: "4px",
                          backgroundColor:
                            answers[question.id] === opt
                              ? "#e8f4fd"
                              : "transparent",
                          border:
                            answers[question.id] === opt
                              ? "1px solid #B6252A"
                              : "1px solid transparent",
                          opacity: isSubmitting ? 0.6 : 1,
                        }}
                      >
                        <input
                          type="radio"
                          name={`q_${question.id}`}
                          value={opt}
                          checked={answers[question.id] === opt}
                          onChange={() =>
                            !isSubmitting && handleSelect(question.id, opt)
                          }
                          disabled={isSubmitting}
                          style={{ marginRight: "0.5rem", marginTop: "0.2rem" }}
                        />
                        <span style={{ fontSize: "14px", lineHeight: "1.4" }}>
                          <strong>({opt.toUpperCase()})</strong>{" "}
                          {question[`option_${opt}`]}
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed Navigation */}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1rem",
          backgroundColor: "#f8f9fa",
          borderTop: "1px solid #dee2e6",
          boxShadow: "0 -2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <div></div>

        <div style={{ textAlign: "center" }}>
          <span
            style={{ fontSize: "14px", fontWeight: "bold", color: "#495057" }}
          >
            {answeredCount} / {totalQuestions} answered
          </span>
        </div>

        {currentGroupIndex >= questionGroups.length - 1 ? (
          (() => {
            // Cek apakah semua soal sudah dijawab
            const allQuestions = questionGroups.flatMap(
              (group) => group.questions
            );
            const unansweredCount = allQuestions.filter(
              (q) => !answers[q.id]
            ).length;

            if (unansweredCount > 0) {
              // Jika ada soal belum dijawab, tampilkan tombol biasa (tidak wrapped Confirm)
              return (
                <button
                  onClick={() => {
                    setUnansweredCount(unansweredCount);
                    setShowUnansweredModal(true);
                  }}
                  disabled={isSubmitting}
                  style={{
                    padding: "0.75rem 1.5rem",
                    backgroundColor: isSubmitting ? "#6c757d" : "#dc3545", // Red untuk warning
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    fontWeight: "bold",
                    fontSize: "14px",
                    fontFamily: "Poppins, sans-serif",
                    opacity: isSubmitting ? 0.7 : 1,
                    transition: "all 0.3s ease",
                  }}
                >
                  {isSubmitting ? "MENYIMPAN..." : "COMPLETE SECTION"}
                </button>
              );
            } else {
              // Jika semua sudah dijawab, tampilkan dengan Confirm
              return (
                <Confirm
                  title={`Lanjut ke ${(() => {
                    if (currentSection === "listening") return "Structure?";
                    if (currentSection === "structure") return "Reading?";
                    return "hasil?";
                  })()}`}
                  description={`Yakin ingin menyelesaikan section ${SECTION_NAMES[currentSection]}? Section yang sudah disubmit tidak bisa diubah lagi.`}
                  confirmText="KONFIRMASI"
                  confirmButtonType="primary"
                  onConfirm={async () => {
                    await handleSubmitSection();
                  }}
                >
                  <button
                    disabled={isSubmitting}
                    style={{
                      padding: "0.75rem 1.5rem",
                      backgroundColor: isSubmitting ? "#6c757d" : "#28a745",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: isSubmitting ? "not-allowed" : "pointer",
                      fontWeight: "bold",
                      fontSize: "14px",
                      fontFamily: "Poppins, sans-serif",
                      opacity: isSubmitting ? 0.7 : 1,
                      transition: "all 0.3s ease",
                    }}
                  >
                    {isSubmitting ? "MENYIMPAN..." : "COMPLETE SECTION"}
                  </button>
                </Confirm>
              );
            }
          })()
        ) : (
          // Tombol NEXT biasa
          <button
            onClick={handleNext}
            disabled={isSubmitting}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: isSubmitting ? "#6c757d" : "#B6252A",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              fontSize: "14px",
              fontWeight: "bold",
              fontFamily: "Poppins, sans-serif",
              opacity: isSubmitting ? 0.7 : 1,
              transition: "all 0.3s ease",
            }}
          >
            {isSubmitting ? "MENYIMPAN..." : "NEXT"}
          </button>
        )}
      </div>
      {showUnansweredModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4 p-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Masih ada soal yang belum terjawab
              </h3>
              <div className="text-gray-600">
                {unansweredCount} soal masih perlu dijawab sebelum melanjutkan.
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => setShowUnansweredModal(false)}
                className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-blue-600 
                     transition-colors font-medium"
              >
                Kembali
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

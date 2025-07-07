import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDashboardLayoutContext } from "../../layouts/DashboardLayout";
import axiosInstance from "../../services/axios";
import axios from "axios";

export default function ListSimulasi() {
  const [simulations, setSimulations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { setTitle, setSubtitle } = useDashboardLayoutContext();

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
    loadSimulations();
  }, []);

  const loadSimulations = async () => {
    try {
      const res = await axiosInstance.get(
        "/simulations/completed?simulation_set_id=1",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSimulations(res.data.simulations);
      setLoading(false);
    } catch (err) {
      console.error("Error loading simulations:", err);

      if (axios.isAxiosError(error) && error.response?.status === 401) {
        localStorage.removeItem("AuthToken");
        localStorage.removeItem("role");
        navigate("/login");
        return;
      }

      setError(
        "Gagal memuat daftar simulasi: " +
          (err.response?.data?.message || err.message)
      );
      setLoading(false);
    }
  };

  const viewResult = (simulationId) => {
    navigate(`${getBasePath()}/simulasi/hasil/${simulationId}`);
  };

  const getScoreColor = (score) => {
    if (score >= 550) return "#28a745";
    if (score >= 450) return "#ffc107";
    return "#dc3545";
  };

  const getCEFRLevel = (score) => {
    if (score >= 627) return "C1";
    if (score >= 543) return "B2";
    if (score >= 460) return "B1";
    if (score >= 337) return "A2-B1";
    if (score >= 310) return "A2";
    return "Below A2";
  };

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h3>Memuat daftar simulasi...</h3>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h3 style={{ color: "#dc3545" }}>Error</h3>
        <p>{error}</p>
        <button
          onClick={() => navigate(`${getBasePath()}/simulasi`)}
          style={{
            backgroundColor: "#B6252A",
            color: "white",
            border: "none",
            padding: "0.5rem 1rem",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Kembali ke Simulasi
        </button>
      </div>
    );
  }

  if (simulations.length === 0) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h3>Belum Ada Hasil Simulasi</h3>
        <p>Anda belum pernah menyelesaikan simulasi TOEFL ITP.</p>
        <button
          onClick={() => navigate(`${getBasePath()}/simulasi`)}
          style={{
            backgroundColor: "#B6252A",
            color: "white",
            border: "none",
            padding: "1rem 2rem",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "600",
          }}
        >
          Mulai Simulasi
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "1.5rem", maxWidth: "1000px", margin: "0 auto" }}>
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
        <h2 style={{ margin: 0, fontWeight: "600" }}>
          Riwayat Hasil Simulasi TOEFL ITP
        </h2>
        <p style={{ margin: "0.5rem 0 0 0", opacity: 0.9 }}>
          Pilih sesi simulasi untuk melihat hasil detail
        </p>
      </div>

      <div style={{ display: "grid", gap: "1rem" }}>
        {simulations.map((simulation, index) => (
          <div
            key={simulation.id}
            style={{
              backgroundColor: "white",
              border: "1px solid #dee2e6",
              borderRadius: "8px",
              padding: "1.5rem",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              cursor: "pointer",
              transition: "box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
            }}
            onClick={() => viewResult(simulation.id)}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "1rem",
              }}
            >
              <div style={{ flex: 1, minWidth: "200px" }}>
                <h4
                  style={{
                    margin: "0 0 0.5rem 0",
                    color: "#495057",
                    fontWeight: "600",
                  }}
                >
                  Sesi #{index + 1} - TOEFL ITP Simulasi
                </h4>
                <div style={{ fontSize: "14px", color: "#6c757d" }}>
                  Tanggal:{" "}
                  {new Date(simulation.finished_at).toLocaleDateString(
                    "id-ID",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </div>
              </div>

              <div style={{ textAlign: "center", minWidth: "120px" }}>
                <div
                  style={{
                    fontSize: "2rem",
                    fontWeight: "bold",
                    color: getScoreColor(simulation.total_score),
                    marginBottom: "0.25rem",
                  }}
                >
                  {simulation.total_score}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#6c757d",
                    backgroundColor: "#f8f9fa",
                    padding: "0.25rem 0.5rem",
                    borderRadius: "12px",
                    display: "inline-block",
                  }}
                >
                  {getCEFRLevel(simulation.total_score)}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  flexWrap: "wrap",
                  minWidth: "300px",
                }}
              >
                <div style={{ textAlign: "center", minWidth: "70px" }}>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#6c757d",
                      marginBottom: "0.25rem",
                    }}
                  >
                    Listening
                  </div>
                  <div
                    style={{
                      fontWeight: "bold",
                      color: getScoreColor(simulation.score_listening),
                    }}
                  >
                    {simulation.score_listening}
                  </div>
                </div>

                <div style={{ textAlign: "center", minWidth: "70px" }}>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#6c757d",
                      marginBottom: "0.25rem",
                    }}
                  >
                    Structure
                  </div>
                  <div
                    style={{
                      fontWeight: "bold",
                      color: getScoreColor(simulation.score_structure),
                    }}
                  >
                    {simulation.score_structure}
                  </div>
                </div>

                <div style={{ textAlign: "center", minWidth: "70px" }}>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#6c757d",
                      marginBottom: "0.25rem",
                    }}
                  >
                    Reading
                  </div>
                  <div
                    style={{
                      fontWeight: "bold",
                      color: getScoreColor(simulation.score_reading),
                    }}
                  >
                    {simulation.score_reading}
                  </div>
                </div>
              </div>

              <div style={{ color: "#B6252A", fontSize: "1.5rem" }}>→</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <button
          onClick={() => navigate(`${getBasePath()}/simulasi`)}
          style={{
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            padding: "1rem 2rem",
            fontSize: "16px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "500",
          }}
        >
          Kembali ke Menu Simulasi
        </button>
      </div>
    </div>
  );
}

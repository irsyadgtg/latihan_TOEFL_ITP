import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDashboardLayoutContext } from "../../layouts/DashboardLayout";
import axiosInstance from "../../services/axios";
import axios from "axios";
import Confirm from "../shared/components/Confirm";

export default function Simulasi() {
  const { setTitle, setSubtitle } = useDashboardLayoutContext();

  const [eligibility, setEligibility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessError, setAccessError] = useState(null);

  const navigate = useNavigate();

  // SIMPLIFIED: Role detection from localStorage and URL
  const getCurrentRole = () => {
    const storedRole = localStorage.getItem("role");
    const pathname = window.location.pathname;

    // localStorage role is PRIMARY source of truth
    if (storedRole) {
      return storedRole;
    }

    // Fallback to URL-based detection only if localStorage empty
    if (pathname.includes("/student/")) return "peserta";
    if (pathname.includes("/instructor/")) return "instruktur";
    if (pathname.includes("/admin/")) return "admin";

    return null;
  };

  const currentRole = getCurrentRole();

  // Route validation - redirect if URL doesn't match role
  useEffect(() => {
    const pathname = window.location.pathname;

    if (!currentRole) {
      navigate("/login");
      return;
    }

    if (currentRole === "peserta" && pathname.startsWith("/instructor/")) {
      navigate("/student/simulasi", { replace: true });
      return;
    }

    if (currentRole === "instruktur" && pathname.startsWith("/student/")) {
      navigate("/instructor/simulasi", { replace: true });
      return;
    }

    if (
      currentRole === "admin" &&
      (pathname.startsWith("/student/") || pathname.startsWith("/instructor/"))
    ) {
      navigate("/admin/dashboard", { replace: true });
      return;
    }
  }, [currentRole, navigate]);

  // DEBUG: Log for monitoring
  console.log("Current role detected:", currentRole);
  console.log("Current pathname:", window.location.pathname);

  // SIMPLIFIED: Navigation base path
  const getBasePath = () => {
    if (currentRole === "instruktur") return "/instructor";
    if (currentRole === "admin") return "/admin";
    return "/student";
  };

  // Set title
  useEffect(() => {
    setTitle("Simulasi TOEFL");
    setSubtitle("Latihan simulasi ujian TOEFL ITP");
  }, [setTitle, setSubtitle]);

  // Check eligibility only for students
  useEffect(() => {
    if (currentRole === "peserta") {
      checkEligibility();
    } else {
      setLoading(false);
    }
  }, [currentRole]);

  const checkEligibility = async () => {
    try {
      const res = await axiosInstance.get(
        "/simulations/eligibility?simulation_set_id=1"
      );
      setEligibility(res.data);
      setAccessError(null);
    } catch (err) {
      console.error("Error checking eligibility:", err);

      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          localStorage.removeItem("AuthToken");
          localStorage.removeItem("role");
          navigate("/login");
          return;
        }

        if (err.response?.status === 403) {
          setAccessError({
            type: "forbidden",
            message: "Akses simulasi tidak diizinkan untuk role Anda",
          });
          setEligibility({ eligible: false });
        } else {
          setEligibility({
            eligible: false,
            reason: "Gagal mengecek kelayakan simulasi",
          });
        }
      } else {
        setEligibility({
          eligible: false,
          reason: "Gagal terhubung ke server",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Navigation handlers
  const handleStartSimulation = () => {
    if (currentRole !== "peserta") {
      return; // Tidak perlu alert, sudah dikontrol oleh UI
    }

    if (accessError?.type === "forbidden") {
      return; // Tidak perlu alert, sudah dikontrol oleh UI
    }

    if (!eligibility?.eligible) {
      return; // Tidak perlu alert, sudah dikontrol oleh UI
    }

    // Langsung navigate ke simulasi
    navigate(`${getBasePath()}/simulasi/mulai`);
  };

  const handleViewResults = () => {
    navigate(`${getBasePath()}/simulasi/hasil`);
  };

  const handleKelolaSimulasi = () => {
    navigate("/instructor/simulasi/kelola");
  };

  const handleAdminDashboard = () => {
    navigate("/admin/dashboard");
  };

  const canStartSimulation = () => {
    return currentRole === "peserta" && !accessError && eligibility?.eligible;
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
        <h2>Simulasi TOEFL ITP</h2>
        <p>Memuat...</p>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "2rem",
        maxWidth: "800px",
        margin: "0 auto",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      <h2
        style={{ color: "#B6252A", marginBottom: "1rem", fontWeight: "bold" }}
      >
        Simulasi TOEFL ITP
      </h2>

      {/* Common Information */}
      <div
        style={{
          backgroundColor: "#f8f9fa",
          padding: "1.5rem",
          borderRadius: "8px",
          marginBottom: "2rem",
          border: "1px solid #dee2e6",
        }}
      >
        <h3
          style={{ color: "#495057", marginBottom: "1rem", fontWeight: "bold" }}
        >
          Tentang Simulasi TOEFL ITP
        </h3>
        <p style={{ marginBottom: "1rem", lineHeight: "1.6", color: "#555" }}>
          Simulasi ini menguji kemampuan bahasa Inggris dalam tiga bagian sesuai
          standar TOEFL ITP:
        </p>
        <ul
          style={{ marginBottom: "1rem", paddingLeft: "1.5rem", color: "#555" }}
        >
          <li>
            <strong>Listening Comprehension:</strong> 35 menit (50 soal)
          </li>
          <li>
            <strong>Structure and Written Expression:</strong> 25 menit (40
            soal)
          </li>
          <li>
            <strong>Reading Comprehension:</strong> 55 menit (50 soal)
          </li>
        </ul>
        <div
          style={{
            backgroundColor: "#fff3cd",
            color: "#856404",
            padding: "1rem",
            borderRadius: "4px",
            border: "1px solid #ffeaa7",
          }}
        >
          <strong>Aturan Penting:</strong>
          <ul
            style={{
              marginTop: "0.5rem",
              marginBottom: 0,
              paddingLeft: "1.5rem",
            }}
          >
            <li>
              Simulasi hanya dapat dikerjakan <strong>1 kali</strong>
            </li>
            <li>Tidak dapat kembali ke soal atau section sebelumnya</li>
            <li>Simulasi dapat dipause dan dilanjutkan (auto-save)</li>
            <li>Audio listening hanya diputar 1 kali</li>
            <li>Urutan pengerjaan: Listening → Structure → Reading</li>
          </ul>
        </div>
      </div>

      {/* STUDENT VIEW - Backend protected via API */}
      {currentRole === "peserta" && (
        <div>
          <div
            style={{
              backgroundColor: "#e7f3ff",
              color: "#0c5460",
              padding: "1rem",
              borderRadius: "4px",
              border: "1px solid #bee5eb",
              marginBottom: "2rem",
            }}
          >
            <h4 style={{ margin: "0 0 0.5rem 0", fontWeight: "bold" }}>
              Syarat Mengikuti Simulasi
            </h4>
            <p style={{ margin: "0 0 0.5rem 0", fontSize: "14px" }}>
              Untuk mengikuti simulasi TOEFL ITP, Anda memerlukan:
            </p>
            <ul style={{ margin: 0, paddingLeft: "1.5rem", fontSize: "14px" }}>
              <li>Paket kursus aktif yang memiliki fasilitas simulasi</li>
              <li>Rencana belajar yang sudah disetujui instruktur</li>
            </ul>
          </div>

          {accessError?.type === "forbidden" && (
            <div
              style={{
                backgroundColor: "#f8d7da",
                color: "#721c24",
                padding: "1rem",
                borderRadius: "4px",
                border: "1px solid #f5c6cb",
                marginBottom: "1rem",
              }}
            >
              <h4 style={{ margin: "0 0 0.5rem 0", fontWeight: "bold" }}>
                Akses Simulasi Tidak Tersedia
              </h4>
              <p style={{ margin: 0 }}>{accessError.message}</p>
            </div>
          )}

          {!accessError && eligibility?.eligible && (
            <div
              style={{
                backgroundColor: eligibility.has_incomplete
                  ? "#d1ecf1"
                  : "#d4edda",
                color: eligibility.has_incomplete ? "#0c5460" : "#155724",
                padding: "1rem",
                borderRadius: "4px",
                border:
                  "1px solid " +
                  (eligibility.has_incomplete ? "#bee5eb" : "#c3e6cb"),
                marginBottom: "1rem",
              }}
            >
              <h4 style={{ margin: "0 0 0.5rem 0", fontWeight: "bold" }}>
                {eligibility.has_incomplete
                  ? "Simulasi Belum Selesai"
                  : "Siap Memulai Simulasi"}
              </h4>
              <p style={{ margin: 0 }}>
                {eligibility.has_incomplete
                  ? "Anda memiliki simulasi yang belum selesai. Klik 'Lanjutkan Simulasi' untuk melanjutkan dari section terakhir."
                  : "Anda dapat memulai simulasi TOEFL ITP. Pastikan Anda dalam kondisi siap dan memiliki waktu yang cukup."}
              </p>
            </div>
          )}

          {!accessError && !eligibility?.eligible && eligibility?.reason && (
            <div
              style={{
                backgroundColor: "#f8d7da",
                color: "#721c24",
                padding: "1rem",
                borderRadius: "4px",
                border: "1px solid #f5c6cb",
                marginBottom: "1rem",
              }}
            >
              <h4 style={{ margin: "0 0 0.5rem 0", fontWeight: "bold" }}>
                Tidak Dapat Mengerjakan Simulasi
              </h4>
              <p style={{ margin: 0 }}>{eligibility.reason}</p>
            </div>
          )}

          <div style={{ marginBottom: "1rem" }}>
            {canStartSimulation() ? (
              <Confirm
                title="MULAI SIMULASI?"
                description="Simulasi TOEFL ITP hanya dapat dikerjakan 1 kali. Pastikan Anda siap dan memiliki waktu yang cukup."
                confirmText="MULAI"
                confirmButtonType="danger"
                onConfirm={async () => {
                  // Fungsi yang akan dijalankan ketika user klik MULAI
                  navigate(`${getBasePath()}/simulasi/mulai`);
                }}
              >
                <button
                  style={{
                    backgroundColor: "#B6252A",
                    color: "white",
                    border: "none",
                    padding: "1rem 2rem",
                    fontSize: "16px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    marginRight: "1rem",
                    fontWeight: "bold",
                    fontFamily: "Poppins, sans-serif",
                  }}
                >
                  {eligibility?.has_incomplete
                    ? "Lanjutkan Simulasi"
                    : "Mulai Simulasi"}
                </button>
              </Confirm>
            ) : (
              <button
                disabled={true}
                style={{
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  padding: "1rem 2rem",
                  fontSize: "16px",
                  borderRadius: "8px",
                  cursor: "not-allowed",
                  marginRight: "1rem",
                  fontWeight: "bold",
                  opacity: 0.6,
                  fontFamily: "Poppins, sans-serif",
                }}
              >
                {(() => {
                  if (accessError?.type === "forbidden")
                    return "Simulasi Tidak Tersedia";
                  if (!eligibility?.eligible) return "Tidak Dapat Memulai";
                  return eligibility?.has_incomplete
                    ? "Lanjutkan Simulasi"
                    : "Mulai Simulasi";
                })()}
              </button>
            )}

            <button
              onClick={handleViewResults}
              style={{
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                padding: "1rem 2rem",
                fontSize: "16px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
                fontFamily: "Poppins, sans-serif",
              }}
            >
              Riwayat Hasil Simulasi
            </button>
          </div>
        </div>
      )}

      {/* INSTRUCTOR VIEW - Backend protected via API */}
      {currentRole === "instruktur" && (
        <div>
          <div
            style={{
              backgroundColor: "#e2e3e5",
              color: "#383d41",
              padding: "1rem",
              borderRadius: "4px",
              border: "1px solid #d6d8db",
              marginBottom: "1rem",
            }}
          >
            <h4 style={{ margin: "0 0 0.5rem 0", fontWeight: "bold" }}>
              Panel Instruktur
            </h4>
            <p style={{ margin: 0 }}>
              Kelola soal-soal simulasi TOEFL ITP untuk peserta.
            </p>
          </div>

          <button
            onClick={handleKelolaSimulasi}
            style={{
              backgroundColor: "#B6252A",
              color: "white",
              border: "none",
              padding: "1rem 2rem",
              fontSize: "16px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              marginRight: "1rem",
              fontFamily: "Poppins, sans-serif",
            }}
          >
            Kelola Soal Simulasi
          </button>

          
        </div>
      )}

      {/* ADMIN VIEW - Backend protected via API */}
      {currentRole === "admin" && (
        <div>
          <div
            style={{
              backgroundColor: "#ffeaa7",
              color: "#856404",
              padding: "1rem",
              borderRadius: "4px",
              border: "1px solid #f39c12",
              marginBottom: "1rem",
            }}
          >
            <h4 style={{ margin: "0 0 0.5rem 0", fontWeight: "bold" }}>
              Panel Administrator
            </h4>
            <p style={{ margin: 0 }}>
              Simulasi TOEFL ITP dikelola oleh instruktur. Admin dapat memantau
              melalui dashboard.
            </p>
          </div>

          <button
            onClick={handleAdminDashboard}
            style={{
              backgroundColor: "#B6252A",
              color: "white",
              border: "none",
              padding: "1rem 2rem",
              fontSize: "16px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              fontFamily: "Poppins, sans-serif",
            }}
          >
            Dashboard Admin
          </button>
        </div>
      )}
    </div>
  );
}

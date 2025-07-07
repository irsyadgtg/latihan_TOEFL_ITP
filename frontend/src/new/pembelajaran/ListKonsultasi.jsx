import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDashboardLayoutContext } from "../../layouts/DashboardLayout";
import axiosInstance from "../../services/axios";
import axios, { AxiosError } from "axios";

export default function ListKonsultasi() {
  const { setTitle, setSubtitle } = useDashboardLayoutContext();

  const [instructors, setInstructors] = useState([]);
  const [studentConsultations, setStudentConsultations] = useState([]);
  const [loading, setLoading] = useState(true);

  // NEW: Access control state
  const [hasConsultationAccess, setHasConsultationAccess] = useState(true);
  const [accessInfo, setAccessInfo] = useState(null);

  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const getCurrentRole = () => {
  const storedRole = localStorage.getItem("role");
  const pathname = window.location.pathname;
  
  // IMMEDIATE redirect jika role mismatch  
  if (storedRole === "peserta" && pathname.includes("/instructor/")) {
    window.location.replace("/student/konsultasi");
    return "peserta";
  }
  
  if (storedRole === "instruktur" && pathname.includes("/student/")) {
    window.location.replace("/instructor/konsultasi");
    return "instruktur";
  }
  
  // PRIORITASKAN localStorage role, bukan URL
  return storedRole;
};

  const currentRole = getCurrentRole();

  

  

  

  // DEBUG: Log both roles
  console.log("Current role from localStorage:", storedRole);
  console.log("Current role from URL:", currentRole);
  console.log("Current pathname:", window.location.pathname);

  const getBasePath = () => {
    if (currentRole === "instruktur") {
      return "/instructor";
    }
    return "/student"; // Default untuk peserta
  };

  

  useEffect(() => {
    checkConsultationAccess();
    loadData();

    
  }, []);

  const checkConsultationAccess = async () => {
    if (currentRole !== "peserta") {
      setHasConsultationAccess(true);
      setAccessInfo(null);
      return;
    }

    try {
      const response = await axiosInstance.get("/consultations/check-access");
      setHasConsultationAccess(response.data.has_access);
      setAccessInfo(response.data);

      console.log("ListKonsultasi Access Check:", response.data);
    } catch (error) {
      console.error("Error checking consultation access:", error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        localStorage.removeItem("AuthToken");
        localStorage.removeItem("role");
        navigate("/login");
        return;
      }

      setHasConsultationAccess(false);
      setAccessInfo({
        has_access: false,
        reason: "Error sistem",
        message: "Tidak dapat memeriksa akses konsultasi. Silakan coba lagi.",
        action_needed: "contact_support",
      });
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      console.log("ListKonsultasi: Loading data for role:", role);

      if (currentRole === "peserta") {
        const response = await axiosInstance.get("/consultations/instructors");
        console.log("ListKonsultasi: Instructors loaded:", response.data);

        // Handle response structure - backend sekarang return instructors + access info
        if (response.data.instructors) {
          setInstructors(response.data.instructors);
          if (response.data.has_access !== undefined) {
            setHasConsultationAccess(response.data.has_access);
            setAccessInfo(response.data.access_info);
          }
        } else {
          // Fallback untuk response lama
          setInstructors(response.data);
        }
      } else if (currentRole === "instruktur") {
        const response = await axiosInstance.get("/consultations/students");
        console.log(
          "ListKonsultasi: Student consultations loaded:",
          response.data
        );
        setStudentConsultations(response.data);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      console.error("Error response:", error.response?.data);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        localStorage.removeItem("AuthToken");
        localStorage.removeItem("role");
        navigate("/login");
        return;
      }
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        localStorage.removeItem("AuthToken");
        localStorage.removeItem("role");
        navigate("/login");
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInstructorSelect = (instructor) => {
    // Cek akses konsultasi untuk peserta
    if (!hasConsultationAccess) {
      return; // Tidak bisa klik sama sekali
    }

    if (!instructor.is_available) {
      alert(
        "Instruktur sedang tidak tersedia saat ini. Silakan pilih instruktur lain atau coba lagi nanti."
      );
      return;
    }

    console.log(
      "ListKonsultasi: Student selecting instructor ID:",
      instructor.id
    );
    navigate(`${getBasePath()}/konsultasi/${instructor.id}`);
  };

  const handleStudentSelect = (consultation) => {
    console.log(
      "ListKonsultasi: Instructor selecting student ID:",
      consultation.student_id
    );
    navigate(`${getBasePath()}/konsultasi/student/${consultation.student_id}`);
  };

  const handleUpgradePackage = () => {
    navigate(`${getBasePath()}/paket-kursus`);
  };

  const handleCreateLearningPlan = () => {
    navigate(`${getBasePath()}/rencana-belajar`);
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: { backgroundColor: "#ffc107", color: "#212529" },
      active: { backgroundColor: "#28a745", color: "white" },
      closed: { backgroundColor: "#6c757d", color: "white" },
    };

    return (
      <span
        style={{
          padding: "0.25rem 0.5rem",
          borderRadius: "12px",
          fontSize: "0.75rem",
          fontWeight: "600",
          textTransform: "uppercase",
          ...styles[status],
        }}
      >
        {status === "pending"
          ? "MENUNGGU"
          : status === "active"
          ? "AKTIF"
          : "SELESAI"}
      </span>
    );
  };

  const getAvailabilityBadge = (isAvailable) => {
    return {
      backgroundColor: isAvailable ? "#d4edda" : "#f8d7da",
      color: isAvailable ? "#155724" : "#721c24",
      text: isAvailable ? "TERSEDIA" : "TIDAK TERSEDIA",
    };
  };

  const formatAvailabilityTime = (availabilityInfo) => {
    if (
      !availabilityInfo.date ||
      !availabilityInfo.start_time ||
      !availabilityInfo.end_time
    ) {
      return "Belum ada jadwal";
    }

    const startTime = availabilityInfo.start_time.substring(0, 5);
    const endTime = availabilityInfo.end_time.substring(0, 5);

    return `${startTime} - ${endTime}`;
  };

  const getActionButton = () => {
    if (!accessInfo || hasConsultationAccess) return null;

    switch (accessInfo.action_needed) {
      case "upgrade_package":
        return (
          <button
            onClick={handleUpgradePackage}
            style={{
              backgroundColor: "#B6252A",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "1rem 2rem",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: "pointer",
              marginTop: "1rem",
              transition: "background-color 0.2s ease",
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#8B1E1E")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#B6252A")}
          >
            Lihat Paket Konsultasi →
          </button>
        );
      case "create_learning_plan":
        return (
          <button
            onClick={handleCreateLearningPlan}
            style={{
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "1rem 2rem",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: "pointer",
              marginTop: "1rem",
              transition: "background-color 0.2s ease",
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#1e7e34")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#28a745")}
          >
            Buat Rencana Belajar →
          </button>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div
        style={{
          padding: "2rem",
          textAlign: "center",
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        <div>Memuat...</div>
        <div style={{ fontSize: "0.8rem", marginTop: "1rem", color: "#666" }}>
          Role: {role}
        </div>
      </div>
    );
  }

  if (currentRole !== "peserta" && currentRole !== "instruktur") {
    return (
      <div
        style={{
          padding: "2rem",
          textAlign: "center",
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        <h3>Error: Role tidak dikenali</h3>
        <p>Role Anda: {role}</p>
        <p>Silakan logout dan login ulang.</p>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "2rem",
        maxWidth: "800px",
        margin: "0 auto",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <div style={{ marginBottom: "2rem" }}>
        <h2
          style={{
            margin: "0 0 1rem 0",
            color: "#495057",
            fontSize: "1.8rem",
            fontWeight: "600",
          }}
        >
          Konsultasi
        </h2>
        <p style={{ color: "#666", fontSize: "1rem", margin: 0 }}>
          {currentRole === "peserta"
            ? "Pilih instruktur untuk memulai konsultasi."
            : "Daftar konsultasi dari peserta"}
        </p>
        {currentRole === "peserta" && (
          <div
            style={{
              marginTop: "1rem",
              padding: "0.75rem",
              backgroundColor: "#e7f3ff",
              borderRadius: "8px",
              border: "1px solid #b3d9ff",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "0.9rem",
                color: "#0066cc",
              }}
            >
              <strong>Info:</strong> Hanya instruktur yang sedang tersedia yang
              dapat dipilih.
            </p>
          </div>
        )}
      </div>

      {/* ACCESS RESTRICTION WARNING for students */}
      {currentRole === "peserta" && !hasConsultationAccess && accessInfo && (
        <div
          style={{
            marginBottom: "2rem",
            padding: "2rem",
            backgroundColor: "#fff3cd",
            borderRadius: "12px",
            border: "2px solid #ffeaa7",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔒</div>
          <h3
            style={{
              margin: "0 0 1rem 0",
              color: "#856404",
              fontSize: "1.5rem",
            }}
          >
            Akses Konsultasi Terbatas
          </h3>
          <p
            style={{
              margin: "0 0 1rem 0",
              color: "#856404",
              fontSize: "1rem",
              lineHeight: 1.5,
            }}
          >
            {accessInfo.message}
          </p>

          {accessInfo.current_package && (
            <div
              style={{
                backgroundColor: "#fff8e1",
                padding: "1rem",
                borderRadius: "8px",
                marginTop: "1rem",
                fontSize: "0.9rem",
                color: "#795548",
              }}
            >
              <strong>Paket Saat Ini:</strong> {accessInfo.current_package}
              {accessInfo.package_facilities && (
                <>
                  <br />
                  <strong>Fasilitas:</strong> {accessInfo.package_facilities}
                </>
              )}
            </div>
          )}

          {getActionButton()}
        </div>
      )}

      {currentRole === "peserta" && (
        <div style={{ display: "grid", gap: "1rem" }}>
          {instructors.length === 0 ? (
            <div
              style={{
                padding: "2rem",
                textAlign: "center",
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
                border: "1px solid #dee2e6",
              }}
            >
              <p style={{ color: "#666", margin: 0 }}>
                Tidak ada instruktur yang tersedia
              </p>
            </div>
          ) : (
            instructors.map((instructor) => {
              const availabilityStyle = getAvailabilityBadge(
                instructor.is_available
              );
              const canClick = hasConsultationAccess && instructor.is_available;

              return (
                <div
                  key={instructor.id}
                  onClick={() => {
                    console.log("Clicking instructor:", instructor);
                    if (canClick) {
                      handleInstructorSelect(instructor);
                    }
                  }}
                  style={{
                    padding: "1.5rem",
                    backgroundColor: "white",
                    border: "1px solid #dee2e6",
                    borderRadius: "8px",
                    cursor: canClick ? "pointer" : "not-allowed",
                    transition: "all 0.2s ease",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                    opacity: canClick ? 1 : 0.6,
                  }}
                  onMouseEnter={(e) => {
                    if (canClick) {
                      e.target.style.backgroundColor = "#f8f9fa";
                      e.target.style.borderColor = "#B6252A";
                      e.target.style.transform = "translateY(-2px)";
                      e.target.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (canClick) {
                      e.target.style.backgroundColor = "white";
                      e.target.style.borderColor = "#dee2e6";
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";
                    }
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                    }}
                  >
                    <div
                      style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "50%",
                        backgroundColor: canClick ? "#B6252A" : "#6c757d",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.25rem",
                        fontWeight: "600",
                        color: "white",
                      }}
                    >
                      {instructor.name.charAt(0).toUpperCase()}
                    </div>

                    <div style={{ flex: 1 }}>
                      <h3
                        style={{
                          margin: 0,
                          fontSize: "1.25rem",
                          fontWeight: "600",
                          color: "#333",
                        }}
                      >
                        {instructor.name}
                      </h3>
                      <p
                        style={{
                          margin: "0.25rem 0",
                          color: "#666",
                          fontSize: "0.9rem",
                        }}
                      >
                        Instruktur • Jam Kerja:{" "}
                        {formatAvailabilityTime(instructor.availability_info)}
                      </p>
                      <div
                        style={{
                          marginTop: "0.5rem",
                          display: "flex",
                          gap: "0.5rem",
                          alignItems: "center",
                          flexWrap: "wrap",
                        }}
                      >
                        <div
                          style={{
                            padding: "0.25rem 0.5rem",
                            backgroundColor: availabilityStyle.backgroundColor,
                            color: availabilityStyle.color,
                            borderRadius: "12px",
                            fontSize: "0.75rem",
                            fontWeight: "600",
                          }}
                        >
                          {availabilityStyle.text}
                        </div>

                        {/* Show access restriction indicator */}
                        {!hasConsultationAccess && (
                          <div
                            style={{
                              padding: "0.25rem 0.5rem",
                              backgroundColor: "#f8d7da",
                              color: "#721c24",
                              borderRadius: "12px",
                              fontSize: "0.75rem",
                              fontWeight: "600",
                            }}
                          >
                            {accessInfo?.action_needed === "upgrade_package"
                              ? "PERLU UPGRADE PAKET"
                              : "PERLU RENCANA BELAJAR"}
                          </div>
                        )}

                        {!instructor.is_available && hasConsultationAccess && (
                          <span
                            style={{
                              fontSize: "0.8rem",
                              color: "#666",
                              fontStyle: "italic",
                            }}
                          >
                            (Klik untuk melihat jadwal)
                          </span>
                        )}
                      </div>
                    </div>

                    <div
                      style={{
                        color: canClick ? "#B6252A" : "#6c757d",
                        fontSize: "1.5rem",
                        opacity: canClick ? 1 : 0.5,
                      }}
                    >
                      →
                    </div>
                  </div>

                  {!instructor.is_available &&
                    instructor.availability_info.date && (
                      <div
                        style={{
                          marginTop: "1rem",
                          padding: "0.75rem",
                          backgroundColor: "#fff3cd",
                          borderRadius: "6px",
                          fontSize: "0.8rem",
                          color: "#856404",
                        }}
                      >
                        <strong>Jadwal hari ini:</strong>{" "}
                        {formatAvailabilityTime(instructor.availability_info)}
                        <br />
                        <em>
                          Instruktur akan tersedia dalam jam kerja tersebut
                        </em>
                      </div>
                    )}
                </div>
              );
            })
          )}
        </div>
      )}

      {currentRole === "instruktur" && (
        <div style={{ display: "grid", gap: "1rem" }}>
          {studentConsultations.length === 0 ? (
            <div
              style={{
                padding: "2rem",
                textAlign: "center",
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
                border: "1px solid #dee2e6",
              }}
            >
              <p style={{ color: "#666", margin: 0 }}>
                Belum ada konsultasi dari peserta
              </p>
            </div>
          ) : (
            studentConsultations.map((consultation) => (
              <div
                key={consultation.id}
                onClick={() => handleStudentSelect(consultation)}
                style={{
                  padding: "1.5rem",
                  backgroundColor: "white",
                  border: "1px solid #dee2e6",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#f8f9fa";
                  e.target.style.borderColor = "#B6252A";
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "white";
                  e.target.style.borderColor = "#dee2e6";
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "1rem" }}
                >
                  <div
                    style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "50%",
                      backgroundColor: "#28a745",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.25rem",
                      fontWeight: "600",
                      color: "white",
                    }}
                  >
                    {consultation.student?.username?.charAt(0).toUpperCase() ||
                      consultation.student?.name?.charAt(0).toUpperCase() ||
                      "S"}
                  </div>

                  <div style={{ flex: 1 }}>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "1.25rem",
                        fontWeight: "600",
                        color: "#333",
                      }}
                    >
                      {consultation.student?.username ||
                        consultation.student?.name ||
                        "Peserta"}
                    </h3>
                    <p
                      style={{
                        margin: "0.25rem 0",
                        color: "#666",
                        fontSize: "0.9rem",
                      }}
                    >
                      {consultation.latest_message?.message ||
                        "Konsultasi dimulai"}
                    </p>
                    <div style={{ fontSize: "0.8rem", color: "#999" }}>
                      {consultation.latest_message &&
                        new Date(
                          consultation.latest_message.created_at
                        ).toLocaleString("id-ID")}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: "0.5rem",
                    }}
                  >
                    {getStatusBadge(consultation.status)}
                    <div style={{ color: "#B6252A", fontSize: "1.5rem" }}>
                      →
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

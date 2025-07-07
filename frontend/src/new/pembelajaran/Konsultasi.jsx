import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDashboardLayoutContext } from "../../layouts/DashboardLayout";
import axiosInstance from "../../services/axios";
import axios from "axios";

export default function Konsultasi() {
  const { setTitle, setSubtitle } = useDashboardLayoutContext();

  const { instructorId, studentId } = useParams();
  const role = localStorage.getItem("role");
  const targetId = instructorId || studentId;
  const isInstructor = role === "instruktur";

  // Chat state
  const [consultation, setConsultation] = useState(null);
  const [instructor, setInstructor] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [reference, setReference] = useState({
    page_id: "",
    modul: "",
    unit_number: "",
  });
  const [showReference, setShowReference] = useState(false);
  const [units, setUnits] = useState({});
  const [loading, setLoading] = useState(true);

  // Sidebar state
  const [instructors, setInstructors] = useState([]);
  const [studentConsultations, setStudentConsultations] = useState([]);
  const [sidebarLoading, setSidebarLoading] = useState(true);

  // Access control state
  const [hasConsultationAccess, setHasConsultationAccess] = useState(true);
  const [accessInfo, setAccessInfo] = useState(null);

  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const currentUserId = parseInt(localStorage.getItem("idPengguna"));

  // 🔧 FIXED: URL-based role detection
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
  const storedRole = localStorage.getItem("role");

  useEffect(() => {
    const pathname = window.location.pathname;

    if (!currentRole) {
      navigate("/login");
      return;
    }

    // PESERTA trying to access INSTRUCTOR routes
    if (currentRole === "peserta" && pathname.startsWith("/instructor/")) {
      console.log(
        "⚠️ Access denied: Peserta trying to access instructor route"
      );
      navigate("/student/konsultasi", { replace: true });
      return;
    }

    // INSTRUKTUR trying to access STUDENT routes
    if (currentRole === "instruktur" && pathname.startsWith("/student/")) {
      console.log(
        "⚠️ Access denied: Instruktur trying to access student route"
      );
      navigate("/instructor/konsultasi", { replace: true });
      return;
    }

    // ADMIN trying to access STUDENT/INSTRUCTOR routes
    if (
      currentRole === "admin" &&
      (pathname.startsWith("/student/") || pathname.startsWith("/instructor/"))
    ) {
      console.log(
        "⚠️ Access denied: Admin trying to access student/instructor route"
      );
      navigate("/admin/dashboard", { replace: true });
      return;
    }

    // ROLE MISMATCH - localStorage vs URL
    if (storedRole && currentRole !== storedRole) {
      console.log("⚠️ Role mismatch detected, redirecting to correct path");

      if (storedRole === "peserta") {
        navigate("/student/konsultasi", { replace: true });
      } else if (storedRole === "instruktur") {
        navigate("/instructor/konsultasi", { replace: true });
      } else if (storedRole === "admin") {
        navigate("/admin/dashboard", { replace: true });
      }
      return;
    }
  }, [currentRole, navigate, storedRole]);

  // DEBUG: Log for monitoring
  console.log("Konsultasi - Current role detected:", currentRole);
  console.log("Konsultasi - Current pathname:", window.location.pathname);
  console.log("Konsultasi - Stored role:", storedRole);

  // 🔧 FIXED: getBasePath function
  const getBasePath = () => {
    if (currentRole === "instruktur") {
      return "/instructor";
    }
    return "/student"; // Default untuk peserta
  };

  useEffect(() => {
    checkConsultationAccess();
    loadSidebarData();
    loadUnits();

    // 🔧 REMOVED: Auto refresh 30 detik - HAPUS INTERVAL
  }, []);

  useEffect(() => {
    if (targetId && hasConsultationAccess) {
      loadConsultation();
    } else {
      setLoading(false);
    }
  }, [targetId, hasConsultationAccess]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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

      console.log("Konsultasi Access Check:", response.data);
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

  const loadSidebarData = async () => {
    try {
      setSidebarLoading(true);

      if (currentRole === "peserta") {
        const response = await axiosInstance.get("/consultations/instructors");

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
        setStudentConsultations(response.data);
      }
    } catch (error) {
      console.error("Error loading sidebar data:", error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        localStorage.removeItem("AuthToken");
        localStorage.removeItem("role");
        navigate("/login");
        return;
      }
    } finally {
      setSidebarLoading(false);
    }
  };

  const loadConsultation = async () => {
    if (!targetId || !hasConsultationAccess) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axiosInstance.get(`/consultations/${targetId}`);

      setConsultation(response.data.consultation);
      setInstructor(response.data.instructor);
      setMessages(response.data.messages);
    } catch (error) {
      console.error("Error loading consultation:", error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        localStorage.removeItem("AuthToken");
        localStorage.removeItem("role");
        navigate("/login");
        return;
      }
      if (error.response?.status === 403) {
        // Handle access denied
        if (error.response.data.access_info) {
          setAccessInfo(error.response.data.access_info);
          setHasConsultationAccess(false);
        } else {
          alert("Instruktur sedang tidak tersedia saat ini");
          navigate(`${getBasePath()}/konsultasi`);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const loadUnits = async () => {
    try {
      const response = await axiosInstance.get("/consultation-units");
      console.log("Konsultasi: Accessible units loaded:", response.data);
      setUnits(response.data);
    } catch (error) {
      console.error("Error loading accessible units:", error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        localStorage.removeItem("AuthToken");
        localStorage.removeItem("role");
        navigate("/login");
        return;
      }
      // Fallback jika error - hanya unit overview
      setUnits({
        listening: [0],
        structure: [0],
        reading: [0],
      });
    }
  };

  const handleUserSelect = (userId, isAvailable = true) => {
    // Cek akses konsultasi untuk peserta
    if (currentRole === "peserta" && !hasConsultationAccess) {
      return; // Tidak bisa klik sama sekali
    }

    if (currentRole === "peserta" && !isAvailable) {
      alert(
        "Instruktur sedang tidak tersedia saat ini. Silakan pilih instruktur lain atau coba lagi nanti."
      );
      return;
    }

    if (isInstructor) {
      navigate(`${getBasePath()}/konsultasi/student/${userId}`);
    } else {
      navigate(`${getBasePath()}/konsultasi/${userId}`);
    }
  };

  // 🔧 FIXED: Navigation dengan getBasePath()
  const handleUpgradePackage = () => {
    navigate(`${getBasePath()}/langganan`);
  };

  const handleCreateLearningPlan = () => {
    navigate(`${getBasePath()}/rencana`);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !attachment) return;
    if (!hasConsultationAccess) return;

    try {
      const formData = new FormData();
      formData.append("message", newMessage);

      if (attachment) {
        formData.append("attachment", attachment);
      }

      if (reference.modul) {
        formData.append("reference_modul", reference.modul);
      }
      if (reference.unit_number) {
        formData.append("reference_unit_number", reference.unit_number);
      }

      let response;
      if (isInstructor) {
        response = await axiosInstance.post(
          `/consultations/${consultation.id}/instructor-message`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
      } else {
        response = await axiosInstance.post(
          `/consultations/${targetId}/messages`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
      }

      // Handle all_messages from response (fix for session markers)
      if (response.data.all_messages) {
        setMessages(response.data.all_messages);
      } else {
        setMessages((prev) => [...prev, response.data.message]);
      }

      setConsultation(response.data.consultation);

      setNewMessage("");
      setAttachment(null);
      setReference({ page_id: "", modul: "", unit_number: "" });
      setShowReference(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      loadSidebarData();
    } catch (error) {
      console.error("Error sending message:", error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        localStorage.removeItem("AuthToken");
        localStorage.removeItem("role");
        navigate("/login");
        return;
      }
      if (error.response?.status === 403) {
        // Handle access error
        if (error.response.data.access_info) {
          setAccessInfo(error.response.data.access_info);
          setHasConsultationAccess(false);
        } else {
          alert("Instruktur sedang tidak tersedia saat ini");
        }
      } else {
        alert(
          "Gagal mengirim pesan: " +
            (error.response?.data?.message || error.message)
        );
      }
    }
  };

  const handleEndSession = async () => {
    if (!window.confirm("Yakin ingin mengakhiri sesi konsultasi?")) return;

    try {
      const response = await axiosInstance.post(
        `/consultations/${consultation.id}/end-session`
      );

      // Update messages with session end marker
      if (response.data.all_messages) {
        setMessages(response.data.all_messages);
      }

      setConsultation(response.data.consultation);
      loadSidebarData();
    } catch (error) {
      console.error("Error ending session:", error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        localStorage.removeItem("AuthToken");
        localStorage.removeItem("role");
        navigate("/login");
        return;
      }
      if (error.response?.status === 400) {
        alert("Sesi sudah berakhir");
      } else if (error.response?.status === 404) {
        alert("Konsultasi tidak ditemukan");
      } else {
        alert(
          "Gagal mengakhiri sesi: " +
            (error.response?.data?.message || error.message)
        );
      }
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAttachment(file);
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "#ffc107",
      active: "#28a745",
      closed: "#6c757d",
    };
    return colors[status] || "#6c757d";
  };

  const getStatusText = (status) => {
    const texts = {
      pending: "Menunggu Balasan",
      active: "Aktif",
      closed: "Selesai",
    };
    return texts[status] || status;
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
      !availabilityInfo ||
      !availabilityInfo.date ||
      !availabilityInfo.start_time ||
      !availabilityInfo.end_time
    ) {
      return "Belum ada jadwal";
    }

    const startTime = availabilityInfo.start_time.substring(0, 5); // HH:MM
    const endTime = availabilityInfo.end_time.substring(0, 5); // HH:MM

    return `${startTime} - ${endTime}`;
  };

  const canSendMessage = isInstructor
    ? !consultation || consultation.status !== "closed"
    : hasConsultationAccess;

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderAttachment = (attachmentPath) => {
    if (!attachmentPath) return null;

    const url = `http://localhost:8000/storage/${attachmentPath}`;
    const extension = attachmentPath.split(".").pop().toLowerCase();

    if (["jpg", "jpeg", "png", "gif"].includes(extension)) {
      return (
        <img
          src={url}
          alt="Attachment"
          style={{ maxWidth: "200px", borderRadius: "8px" }}
        />
      );
    } else if (["mp3", "wav"].includes(extension)) {
      return <audio controls src={url} style={{ maxWidth: "300px" }} />;
    } else if (["mp4", "avi", "mov"].includes(extension)) {
      return <video controls src={url} style={{ maxWidth: "300px" }} />;
    } else {
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "#B6252A",
            textDecoration: "none",
            padding: "0.5rem 1rem",
            backgroundColor: "#f8f9fa",
            borderRadius: "4px",
            border: "1px solid #dee2e6",
            display: "inline-block",
          }}
        >
          {attachmentPath.split("/").pop()}
        </a>
      );
    }
  };

  // 🔧 FIXED: renderReference dengan event prevention dan debug
  // 🔧 QUICK FIX - GANTI renderReference() FUNCTION dengan ini:

  const renderReference = (msg) => {
    if (!msg.reference_modul) return null;

    let targetUrl = "";
    let displayTitle = "";
    let displayDescription = "";

    if (msg.reference_modul && msg.reference_unit_number) {
      targetUrl = `${getBasePath()}/materi/${msg.reference_modul}?unit=${
        msg.reference_unit_number
      }`;
      if (msg.reference_unit_number === 0) {
        displayTitle = `Unit Overview`;
        displayDescription = `${msg.reference_modul.toUpperCase()}`;
      } else {
        displayTitle = `Unit ${msg.reference_unit_number}`;
        displayDescription = `${msg.reference_modul.toUpperCase()}`;
      }
    } else if (msg.reference_modul) {
      targetUrl = `${getBasePath()}/materi/${msg.reference_modul}`;
      displayTitle = `Modul ${msg.reference_modul.toUpperCase()}`;
      displayDescription = "Semua unit dalam modul ini";
    } else {
      return null;
    }

    // 🔧 DEBUG LOG - CEK INI DI CONSOLE
    const handleDebugClick = () => {
      console.log("🔍 REFERENCE DEBUG:");
      console.log("Current Role:", currentRole);
      console.log("Base Path:", getBasePath());
      console.log("Target URL:", targetUrl);
      console.log("Current Location:", window.location.href);
      console.log("Full Target:", `http://localhost:5173${targetUrl}`);

      // 🚀 FORCE NAVIGATION
      window.location.href = targetUrl;
    };

    return (
      <div
        onClick={handleDebugClick}
        style={{
          padding: "0.75rem 1rem",
          backgroundColor: "#f0f8ff",
          borderRadius: "8px",
          border: "1px solid #B6252A",
          marginTop: "0.5rem",
          fontSize: "0.9rem",
          color: "#B6252A",
          cursor: "pointer",
          transition: "all 0.2s ease",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#e8f4fd";
          e.currentTarget.style.borderColor = "#8B1E1E";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#f0f8ff";
          e.currentTarget.style.borderColor = "#B6252A";
        }}
      >
        <div>
          <div style={{ fontWeight: "600" }}>REFERENCE: {displayTitle}</div>
          <div style={{ fontSize: "0.8rem", opacity: 0.8 }}>
            {displayDescription}
          </div>
        </div>
        <span style={{ marginLeft: "auto", fontSize: "0.8rem" }}>
          DEBUG CLICK →
        </span>
      </div>
    );
  };

  // Render access denied message for chat area
  const renderAccessDeniedMessage = () => {
    if (!accessInfo || hasConsultationAccess) return null;

    const getActionButton = () => {
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
                marginTop: "1.5rem",
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
                marginTop: "1.5rem",
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

    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f8f9fa",
          flexDirection: "column",
          padding: "2rem",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: "500px" }}>
          <div
            style={{ fontSize: "4rem", marginBottom: "1.5rem", opacity: 0.6 }}
          >
            🔒
          </div>
          <h3
            style={{
              margin: "0 0 1rem 0",
              color: "#B6252A",
              fontSize: "1.5rem",
            }}
          >
            Akses Konsultasi Terbatas
          </h3>
          <p
            style={{
              margin: "0 0 1rem 0",
              lineHeight: 1.6,
              color: "#495057",
              fontSize: "1.1rem",
            }}
          >
            {accessInfo.message}
          </p>

          {accessInfo.current_package && (
            <div
              style={{
                backgroundColor: "#e9ecef",
                padding: "1rem",
                borderRadius: "8px",
                marginTop: "1rem",
                fontSize: "0.9rem",
                color: "#6c757d",
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
      </div>
    );
  };

  const renderSidebar = () => {
    if (sidebarLoading) {
      return (
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <div>Loading...</div>
        </div>
      );
    }

    if (currentRole === "peserta") {
      // STUDENT VIEW - List of Instructors with availability
      return (
        <div style={{ display: "grid", gap: "0.5rem" }}>
          {/* ACCESS WARNING for students without consultation access */}
          {!hasConsultationAccess && accessInfo && (
            <div
              style={{
                padding: "1rem",
                backgroundColor: "#fff3cd",
                border: "1px solid #ffeaa7",
                borderRadius: "8px",
                marginBottom: "1rem",
                fontSize: "0.85rem",
                color: "#856404",
              }}
            >
              <div style={{ fontWeight: "600", marginBottom: "0.5rem" }}>
                ⚠️ Akses Terbatas
              </div>
              <div>
                {accessInfo.action_needed === "upgrade_package"
                  ? "Upgrade paket untuk akses konsultasi"
                  : "Buat rencana belajar terlebih dahulu"}
              </div>
            </div>
          )}

          {instructors.length === 0 ? (
            <div
              style={{
                padding: "2rem",
                textAlign: "center",
                color: "#666",
                fontSize: "0.9rem",
              }}
            >
              Tidak ada instruktur yang tersedia
            </div>
          ) : (
            instructors.map((instructor) => {
              const isActive = instructor.id == targetId;
              const availabilityStyle = getAvailabilityBadge(
                instructor.is_available
              );
              const canClick = hasConsultationAccess && instructor.is_available;

              return (
                <div
                  key={instructor.id}
                  onClick={() =>
                    canClick &&
                    handleUserSelect(instructor.id, instructor.is_available)
                  }
                  style={{
                    padding: "1rem",
                    backgroundColor: isActive ? "#f0f8ff" : "white",
                    border: `1px solid ${isActive ? "#B6252A" : "#dee2e6"}`,
                    borderRadius: "8px",
                    cursor: canClick ? "pointer" : "not-allowed",
                    transition: "all 0.2s ease",
                    borderLeft: isActive
                      ? "4px solid #B6252A"
                      : "4px solid transparent",
                    opacity: canClick ? 1 : 0.6,
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive && canClick) {
                      e.target.style.backgroundColor = "#f8f9fa";
                      e.target.style.borderColor = "#B6252A";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive && canClick) {
                      e.target.style.backgroundColor = "white";
                      e.target.style.borderColor = "#dee2e6";
                    }
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                    }}
                  >
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        backgroundColor: isActive
                          ? "#B6252A"
                          : canClick
                          ? "#28a745"
                          : "#6c757d",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1rem",
                        fontWeight: "600",
                        color: "white",
                      }}
                    >
                      {instructor.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: isActive ? "600" : "500",
                          color: isActive ? "#B6252A" : "#333",
                          fontSize: "0.95rem",
                          marginBottom: "0.25rem",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {instructor.name}
                      </div>
                      <div
                        style={{
                          fontSize: "0.8rem",
                          color: "#666",
                          marginBottom: "0.25rem",
                        }}
                      >
                        Jam:{" "}
                        {formatAvailabilityTime(instructor.availability_info)}
                      </div>
                      <span
                        style={{
                          padding: "0.25rem 0.5rem",
                          borderRadius: "12px",
                          fontSize: "0.75rem",
                          fontWeight: "600",
                          backgroundColor: availabilityStyle.backgroundColor,
                          color: availabilityStyle.color,
                        }}
                      >
                        {availabilityStyle.text}
                      </span>

                      {/* Show access restriction indicator */}
                      {!hasConsultationAccess && (
                        <div
                          style={{
                            marginTop: "0.25rem",
                            fontSize: "0.7rem",
                            color: "#dc3545",
                            fontStyle: "italic",
                          }}
                        >
                          {accessInfo?.action_needed === "upgrade_package"
                            ? "(Perlu upgrade paket)"
                            : "(Perlu rencana belajar)"}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Additional availability info for unavailable instructors */}
                  {!instructor.is_available &&
                    instructor.availability_info &&
                    instructor.availability_info.date && (
                      <div
                        style={{
                          marginTop: "0.75rem",
                          padding: "0.5rem",
                          backgroundColor: "#fff3cd",
                          borderRadius: "6px",
                          fontSize: "0.75rem",
                          color: "#856404",
                        }}
                      >
                        <strong>Jadwal hari ini:</strong>{" "}
                        {formatAvailabilityTime(instructor.availability_info)}
                        <br />
                        <em>Akan tersedia dalam jam kerja tersebut</em>
                      </div>
                    )}
                </div>
              );
            })
          )}
        </div>
      );
    } else {
      // INSTRUCTOR VIEW - List of Student Consultations
      return (
        <div style={{ display: "grid", gap: "0.5rem" }}>
          {studentConsultations.length === 0 ? (
            <div
              style={{
                padding: "2rem",
                textAlign: "center",
                color: "#666",
                fontSize: "0.9rem",
              }}
            >
              Belum ada konsultasi dari peserta
            </div>
          ) : (
            studentConsultations.map((consultation) => {
              const isActive = consultation.student_id == targetId;
              const userName =
                consultation.student?.username ||
                consultation.student?.name ||
                "Student";

              return (
                <div
                  key={consultation.id}
                  onClick={() => handleUserSelect(consultation.student_id)}
                  style={{
                    padding: "1rem",
                    backgroundColor: isActive ? "#f0f8ff" : "white",
                    border: `1px solid ${isActive ? "#B6252A" : "#dee2e6"}`,
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    borderLeft: isActive
                      ? "4px solid #B6252A"
                      : "4px solid transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.target.style.backgroundColor = "#f8f9fa";
                      e.target.style.borderColor = "#B6252A";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.target.style.backgroundColor = "white";
                      e.target.style.borderColor = "#dee2e6";
                    }
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                    }}
                  >
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        backgroundColor: isActive ? "#B6252A" : "#28a745",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1rem",
                        fontWeight: "600",
                        color: "white",
                      }}
                    >
                      {userName?.charAt(0)?.toUpperCase() || "S"}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: isActive ? "600" : "500",
                          color: isActive ? "#B6252A" : "#333",
                          fontSize: "0.95rem",
                          marginBottom: "0.25rem",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {userName}
                      </div>
                      <div
                        style={{
                          fontSize: "0.8rem",
                          color: isActive ? "#8B1E1E" : "#666",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          marginBottom: "0.25rem",
                        }}
                      >
                        {consultation.latest_message?.message ||
                          "Konsultasi dimulai"}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <span
                          style={{
                            padding: "0.25rem 0.5rem",
                            borderRadius: "12px",
                            fontSize: "0.75rem",
                            fontWeight: "600",
                            textTransform: "uppercase",
                            backgroundColor: getStatusColor(
                              consultation.status
                            ),
                            color: "white",
                          }}
                        >
                          {getStatusText(consultation.status)}
                        </span>
                        <span style={{ fontSize: "0.7rem", color: "#999" }}>
                          {consultation.latest_message &&
                            new Date(
                              consultation.latest_message.created_at
                            ).toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      );
    }
  };

  return (
    <div
      style={{
        height: "calc(100vh - 120px)", // Subtract header height
        display: "flex",
        backgroundColor: "#f8f9fa",
        overflow: "hidden",
      }}
    >
      {/* USER LIST SIDEBAR */}
      <div
        style={{
          width: "350px",
          backgroundColor: "white",
          borderRight: "1px solid #dee2e6",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "1rem",
            backgroundColor: "#f8f9fa",
            borderBottom: "1px solid #dee2e6",
            flexShrink: 0,
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: "1.1rem",
              fontWeight: "600",
              color: "#495057",
            }}
          >
            {isInstructor ? "Student Consultations" : "Choose Instructor"}
          </h3>
          {currentRole === "peserta" && (
            <p
              style={{
                margin: "0.5rem 0 0 0",
                fontSize: "0.8rem",
                color: "#666",
                fontWeight: "500",
              }}
            >
              Refresh halaman untuk status ketersediaan terbaru
            </p>
          )}
        </div>

        {/* List - SCROLLABLE */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            padding: "1rem",
          }}
        >
          {renderSidebar()}
        </div>
      </div>

      {/* CHAT AREA */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        {!targetId ? (
          // EMPTY STATE
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f8f9fa",
              color: "#666",
              fontSize: "1.1rem",
              flexDirection: "column",
            }}
          >
            <div style={{ textAlign: "center", maxWidth: "400px" }}>
              <div
                style={{ fontSize: "4rem", marginBottom: "1rem", opacity: 0.5 }}
              >
                💬
              </div>
              <h3 style={{ margin: "0 0 1rem 0", color: "#495057" }}>
                {isInstructor
                  ? "Pilih Student untuk Memulai Konsultasi"
                  : "Pilih Instruktur untuk Memulai Konsultasi"}
              </h3>
              <p style={{ margin: 0, lineHeight: 1.5, opacity: 0.8 }}>
                {isInstructor
                  ? "Pilih student dari daftar di sebelah kiri untuk melihat percakapan dan membalas pesan mereka."
                  : hasConsultationAccess
                  ? "Pilih instruktur dari daftar di sebelah kiri untuk memulai sesi konsultasi. Pastikan instruktur dalam status tersedia."
                  : "Anda perlu mengupgrade paket atau membuat rencana belajar untuk mengakses fitur konsultasi."}
              </p>
            </div>
          </div>
        ) : !hasConsultationAccess && currentRole === "peserta" ? (
          // ACCESS DENIED STATE for students
          renderAccessDeniedMessage()
        ) : (
          <>
            {/* Chat Header */}
            {instructor && (
              <div
                style={{
                  padding: "1rem",
                  backgroundColor: "white",
                  borderBottom: "1px solid #dee2e6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "1rem" }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      backgroundColor: "#B6252A",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.1rem",
                      fontWeight: "600",
                      color: "white",
                    }}
                  >
                    {instructor.name.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "1.25rem",
                        fontWeight: "600",
                      }}
                    >
                      {instructor.name}{" "}
                      {isInstructor ? "(Student)" : "(Instruktur)"}
                    </h3>
                    <div
                      style={{
                        fontSize: "0.9rem",
                        color: "#666",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <span
                        style={{
                          padding: "0.25rem 0.5rem",
                          borderRadius: "12px",
                          fontSize: "0.75rem",
                          fontWeight: "600",
                          backgroundColor: consultation
                            ? getStatusColor(consultation.status)
                            : "#28a745",
                          color: "white",
                        }}
                      >
                        {consultation
                          ? getStatusText(consultation.status)
                          : "Siap Konsultasi"}
                      </span>
                    </div>
                  </div>
                </div>

                {consultation && consultation.status !== "closed" && (
                  <button
                    onClick={handleEndSession}
                    style={{
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      padding: "0.5rem 1rem",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                    }}
                  >
                    End Session
                  </button>
                )}
              </div>
            )}

            {/* Messages - SCROLLABLE AREA */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                overflowX: "hidden",
                padding: "1rem",
                backgroundColor: "#f8f9fa",
              }}
            >
              {loading ? (
                <div
                  style={{
                    textAlign: "center",
                    color: "#666",
                    marginTop: "2rem",
                  }}
                >
                  Loading messages...
                </div>
              ) : messages.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    color: "#666",
                    fontSize: "0.9rem",
                    marginTop: "2rem",
                  }}
                >
                  {!consultation
                    ? isInstructor
                      ? "Student belum memulai konsultasi."
                      : "Mulai konsultasi dengan mengirim pesan pertama!"
                    : consultation.status === "closed"
                    ? isInstructor
                      ? "Sesi konsultasi telah berakhir. Menunggu student memulai sesi baru."
                      : "Sesi konsultasi sebelumnya telah berakhir. Kirim pesan untuk memulai sesi baru!"
                    : "Belum ada percakapan. Mulai kirim pesan pertama!"}
                </div>
              ) : (
                messages.map((msg, index) => {
                  if (msg.message_type === "session_marker") {
                    return (
                      <div
                        key={index}
                        style={{
                          textAlign: "center",
                          margin: "1rem 0",
                          padding: "0.5rem",
                          color: "#666",
                          fontSize: "0.8rem",
                          backgroundColor: "#e9ecef",
                          borderRadius: "20px",
                          border: "1px solid #dee2e6",
                        }}
                      >
                        {msg.message}
                      </div>
                    );
                  }

                  const isOwn = msg.sender_id === currentUserId;

                  return (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        justifyContent: isOwn ? "flex-end" : "flex-start",
                        marginBottom: "1rem",
                      }}
                    >
                      <div
                        style={{
                          maxWidth: "70%",
                          padding: "1rem",
                          borderRadius: "16px",
                          backgroundColor: isOwn ? "#B6252A" : "white",
                          color: isOwn ? "white" : "#333",
                          border: isOwn ? "none" : "1px solid #dee2e6",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        }}
                      >
                        <div style={{ marginBottom: "0.5rem" }}>
                          <strong style={{ fontSize: "0.9rem" }}>
                            {msg.sender
                              ? msg.sender.username || msg.sender.name
                              : "System"}
                          </strong>
                          <span
                            style={{
                              fontSize: "0.8rem",
                              opacity: 0.7,
                              marginLeft: "0.5rem",
                            }}
                          >
                            {formatTime(msg.created_at)}
                          </span>
                        </div>

                        {msg.message && (
                          <div style={{ marginBottom: "0.5rem" }}>
                            {msg.message}
                          </div>
                        )}

                        {msg.attachment && renderAttachment(msg.attachment)}
                        {renderReference(msg)}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area - FIXED BOTTOM */}
            <div
              style={{
                padding: "1rem",
                backgroundColor: "white",
                borderTop: "1px solid #dee2e6",
                flexShrink: 0,
              }}
            >
              {/* Access restriction notice for input area */}
              {!hasConsultationAccess && currentRole === "peserta" && (
                <div
                  style={{
                    marginBottom: "1rem",
                    padding: "1rem",
                    backgroundColor: "#f8d7da",
                    borderRadius: "8px",
                    border: "1px solid #f5c6cb",
                    color: "#721c24",
                    fontSize: "0.9rem",
                    textAlign: "center",
                  }}
                >
                  <strong>Akses Konsultasi Diperlukan</strong>
                  <br />
                  {accessInfo?.message}
                </div>
              )}

              {/* Attachment & Reference Indicators */}
              {(attachment || reference.modul) && canSendMessage && (
                <div
                  style={{
                    marginBottom: "1rem",
                    padding: "0.5rem",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "4px",
                    border: "1px solid #dee2e6",
                    fontSize: "0.8rem",
                  }}
                >
                  {attachment && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        marginBottom: "0.25rem",
                      }}
                    >
                      <span>ATTACHMENT: {attachment.name}</span>
                      <button
                        onClick={removeAttachment}
                        style={{
                          backgroundColor: "transparent",
                          border: "none",
                          color: "#dc3545",
                          cursor: "pointer",
                          fontSize: "0.8rem",
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  {reference.modul && (
                    <div>
                      REFERENCE:{" "}
                      {reference.unit_number
                        ? reference.unit_number === "0"
                          ? `Unit Overview - ${reference.modul.toUpperCase()}`
                          : `Unit ${
                              reference.unit_number
                            } - ${reference.modul.toUpperCase()}`
                        : `Modul ${reference.modul.toUpperCase()}`}
                    </div>
                  )}
                </div>
              )}

              {/* Reference Form */}
              {showReference && canSendMessage && (
                <div
                  style={{
                    marginBottom: "1rem",
                    padding: "1rem",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "4px",
                    border: "1px solid #dee2e6",
                  }}
                >
                  <h4 style={{ margin: "0 0 1rem 0", fontSize: "1rem" }}>
                    REFERENCE: Tambah Reference
                  </h4>

                  {/* Info untuk peserta */}
                  {currentRole === "peserta" && (
                    <div
                      style={{
                        marginBottom: "1rem",
                        padding: "0.75rem",
                        backgroundColor: "#e7f3ff",
                        borderRadius: "6px",
                        fontSize: "0.85rem",
                        color: "#0066cc",
                      }}
                    >
                      <strong>Info:</strong> Hanya unit yang sudah terbuka dari
                      rencana belajar Anda yang dapat dipilih sebagai referensi.
                    </div>
                  )}

                  <div style={{ display: "grid", gap: "1rem" }}>
                    {/* Modul Selection */}
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "0.5rem",
                          fontSize: "0.9rem",
                        }}
                      >
                        Modul
                      </label>
                      <select
                        value={reference.modul}
                        onChange={(e) =>
                          setReference((prev) => ({
                            modul: e.target.value,
                            unit_number: "",
                            page_id: "",
                          }))
                        }
                        style={{
                          width: "100%",
                          padding: "0.5rem",
                          border: "1px solid #dee2e6",
                          borderRadius: "4px",
                        }}
                      >
                        <option value="">Pilih modul...</option>
                        {Object.keys(units).map((modulName) => (
                          <option key={modulName} value={modulName}>
                            {modulName.charAt(0).toUpperCase() +
                              modulName.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Unit Selection */}
                    {reference.modul && units[reference.modul] && (
                      <div>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "0.5rem",
                            fontSize: "0.9rem",
                          }}
                        >
                          Unit (Opsional)
                        </label>
                        <select
                          value={reference.unit_number}
                          onChange={(e) =>
                            setReference((prev) => ({
                              ...prev,
                              unit_number: e.target.value,
                            }))
                          }
                          style={{
                            width: "100%",
                            padding: "0.5rem",
                            border: "1px solid #dee2e6",
                            borderRadius: "4px",
                          }}
                        >
                          <option value="">
                            Pilih unit (kosongkan untuk semua unit)...
                          </option>
                          {units[reference.modul].map((unitNum) => (
                            <option key={unitNum} value={unitNum}>
                              {unitNum === 0
                                ? "Unit Overview"
                                : `Unit ${unitNum}`}
                            </option>
                          ))}
                        </select>

                        {/* Show accessible units info for students */}
                        {currentRole === "peserta" &&
                          units[reference.modul] && (
                            <div
                              style={{
                                marginTop: "0.5rem",
                                fontSize: "0.8rem",
                                color: "#666",
                              }}
                            >
                              Unit yang dapat diakses:{" "}
                              {units[reference.modul].join(", ")}
                            </div>
                          )}
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      marginTop: "1rem",
                      display: "flex",
                      gap: "0.5rem",
                    }}
                  >
                    <button
                      onClick={() => {
                        setReference({
                          page_id: "",
                          modul: "",
                          unit_number: "",
                        });
                        setShowReference(false);
                      }}
                      style={{
                        padding: "0.5rem 1rem",
                        backgroundColor: "#6c757d",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "0.9rem",
                      }}
                    >
                      Batal
                    </button>
                    <button
                      onClick={() => setShowReference(false)}
                      disabled={!reference.modul}
                      style={{
                        padding: "0.5rem 1rem",
                        backgroundColor: reference.modul
                          ? "#28a745"
                          : "#6c757d",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: reference.modul ? "pointer" : "not-allowed",
                        fontSize: "0.9rem",
                      }}
                    >
                      Tambah Reference
                    </button>
                  </div>
                </div>
              )}

              {/* Message Input */}
              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  alignItems: "flex-end",
                }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  style={{ display: "none" }}
                  accept="image/*,audio/*,video/*,.pdf,.doc,.docx"
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!canSendMessage}
                  style={{
                    padding: "0.75rem",
                    backgroundColor: canSendMessage ? "#28a745" : "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "50%",
                    cursor: canSendMessage ? "pointer" : "not-allowed",
                    fontSize: "0.8rem",
                  }}
                >
                  FILE
                </button>

                <button
                  onClick={() => setShowReference(!showReference)}
                  disabled={!canSendMessage}
                  style={{
                    padding: "0.75rem",
                    backgroundColor: canSendMessage ? "#B6252A" : "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "50%",
                    cursor: canSendMessage ? "pointer" : "not-allowed",
                    fontSize: "0.8rem",
                  }}
                >
                  REF
                </button>

                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder={
                    !hasConsultationAccess
                      ? "Perlu akses konsultasi untuk mengirim pesan..."
                      : !consultation
                      ? isInstructor
                        ? "Ketik balasan untuk student..."
                        : "Ketik pesan untuk memulai konsultasi..."
                      : consultation.status === "closed"
                      ? isInstructor
                        ? "Menunggu student memulai sesi baru..."
                        : "Ketik pesan untuk memulai sesi baru..."
                      : "Ketik pesan..."
                  }
                  disabled={!canSendMessage}
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    border: "1px solid #dee2e6",
                    borderRadius: "20px",
                    outline: "none",
                    backgroundColor: canSendMessage ? "white" : "#f8f9fa",
                    color: canSendMessage ? "#333" : "#6c757d",
                  }}
                />

                <button
                  onClick={handleSendMessage}
                  disabled={
                    !canSendMessage || (!newMessage.trim() && !attachment)
                  }
                  style={{
                    padding: "0.75rem 1.5rem",
                    backgroundColor:
                      canSendMessage && (newMessage.trim() || attachment)
                        ? "#B6252A"
                        : "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "20px",
                    cursor:
                      canSendMessage && (newMessage.trim() || attachment)
                        ? "pointer"
                        : "not-allowed",
                    fontWeight: "600",
                  }}
                >
                  Kirim
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

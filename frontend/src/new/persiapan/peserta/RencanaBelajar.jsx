import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Target,
  Clock,
  Calendar,
  CheckCircle,
  AlertCircle,
  Plus,
  Eye,
  Edit2,
  Star,
  Award,
  X,
} from "lucide-react";
import api from "../../shared/services/api";

export default function RencanaBelajar() {
  const [formData, setFormData] = useState({
    target_skor: "",
    target_waktu: "",
    frekuensi_mingguan: "",
    durasi_harian: "",
    skill: [],
  });
  const [skillList, setSkillList] = useState([]);
  const [rencanaBelajarList, setRencanaBelajarList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingSkills, setLoadingSkills] = useState(true);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);

  // STATES UNTUK SKOR AWAL - SIMPLIFIED
  const [hasApprovedSkor, setHasApprovedSkor] = useState(false);
  const [skorInfo, setSkorInfo] = useState(null);
  const [canCreatePlan, setCanCreatePlan] = useState(false);
  const [blockReason, setBlockReason] = useState(""); // Alasan kenapa diblok

  // STATES UNTUK DETAIL POPUP - BARU
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const token = localStorage.getItem("token");

  // Fetch skills function (tetap sama)
  const fetchSkills = async () => {
    setLoadingSkills(true);
    try {
      const response = await api.get("/peserta/skill", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Skills response:", response.data);
      setSkillList(response.data.data || response.data || []);
    } catch (error) {
      console.error("Error fetching skills:", error.response || error);
      setSkillList([]);
    } finally {
      setLoadingSkills(false);
    }
  };

  // FIXED: Fetch rencana belajar dengan logic yang tepat
  const fetchRencanaBelajar = async () => {
    setLoadingList(true);
    try {
      const response = await api.get("/peserta/rencana-belajar", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Rencana belajar response:", response.data);

      const responseData = response.data;
      const riwayatData = responseData.riwayat || [];
      const skorAwalData = responseData.skor_awal || null;
      const bolehMengajukan = responseData.boleh_mengajukan || false;

      // Set basic data
      setRencanaBelajarList(riwayatData);
      setSkorInfo(skorAwalData);

      // IMPROVED LOGIC ANALYSIS:
      const hasSkorAwal = skorAwalData && skorAwalData.status === "Disetujui";

      // Cek kondisi rencana dengan lebih detail
      const pendingPlan = riwayatData.find((item) => item.status === "pending");
      const approvedPlan = riwayatData.find(
        (item) => item.status === "sudah ada feedback"
      );
      const completedPlans = riwayatData.filter(
        (item) => item.status === "selesai"
      );

      console.log("Detailed analysis:");
      console.log("- Has skor awal:", hasSkorAwal);
      console.log("- Pending plan:", pendingPlan ? "YES" : "NO");
      console.log("- Approved plan:", approvedPlan ? "YES" : "NO");
      console.log("- Completed plans:", completedPlans.length);
      console.log("- Backend boleh_mengajukan:", bolehMengajukan);

      // Set states
      setHasApprovedSkor(hasSkorAwal);

      let canCreate = bolehMengajukan;
      let reason = "";

      if (!hasSkorAwal) {
        reason = "no_skor";
        canCreate = false;
      } else if (pendingPlan) {
        reason = "pending_plan";
        canCreate = false;
      } else if (approvedPlan && !bolehMengajukan) {
        reason = "approved_plan_active";
        canCreate = false;
      } else if (hasSkorAwal && !pendingPlan && !approvedPlan) {
        reason = "ready";
        canCreate = true;
      } else if (bolehMengajukan) {
        reason = "ready";
        canCreate = true;
      } else {
        reason = "backend_block";
        canCreate = false;
      }

      setCanCreatePlan(canCreate);
      setBlockReason(reason);

      console.log("Final decision:");
      console.log("- Can create plan:", canCreate);
      console.log("- Block reason:", reason);
    } catch (error) {
      console.error("Error fetching rencana belajar:", error);
      setHasApprovedSkor(false);
      setSkorInfo(null);
      setCanCreatePlan(false);
      setBlockReason("error");
    } finally {
      setLoadingList(false);
    }
  };

  // FUNCTION UNTUK FETCH DETAIL RENCANA - BARU
  const fetchDetailRencana = async (idRencana) => {
    setLoadingDetail(true);
    try {
      const response = await api.get(`/peserta/rencana-belajar/${idRencana}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("=== DETAIL RENCANA DEBUG ===");
      console.log("Full response:", response.data);
      console.log("Detail data:", response.data.data);
      console.log(
        "detailPengajuanRencanaBelajar:",
        response.data.data?.detailPengajuanRencanaBelajar
      );
      console.log(
        "feedbackRencanaBelajar:",
        response.data.data?.feedbackRencanaBelajar
      );
      console.log("=== END DEBUG ===");

      setSelectedDetail(response.data.data);
    } catch (error) {
      console.error("Error fetching detail rencana:", error);
      alert(
        "Gagal memuat detail rencana belajar: " +
          (error.response?.data?.message || "Unknown error")
      );
    } finally {
      setLoadingDetail(false);
    }
  };

  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Handle skill selection
  const handleSkillChange = (skillId) => {
    setFormData((prev) => ({
      ...prev,
      skill: prev.skill.includes(skillId)
        ? prev.skill.filter((id) => id !== skillId)
        : [...prev.skill, skillId],
    }));

    // Clear skill error
    if (errors.skill) {
      setErrors((prev) => ({
        ...prev,
        skill: "",
      }));
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSuccess("");

    try {
      const response = await api.post("/peserta/rencana-belajar", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess(
        "Rencana belajar berhasil diajukan. Menunggu feedback dari instruktur."
      );

      // Reset form
      setFormData({
        target_skor: "",
        target_waktu: "",
        frekuensi_mingguan: "",
        durasi_harian: "",
        skill: [],
      });

      setShowForm(false);
      fetchRencanaBelajar(); // Refresh list
    } catch (error) {
      console.error("Error submitting rencana belajar:", error);

      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({
          general:
            error.response?.data?.message ||
            "Terjadi kesalahan saat mengajukan rencana belajar",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Status badge - SESUAI BACKEND STATUS
  const getStatusBadge = (rencana) => {
    if (rencana.status === "pending") {
      return { color: "#ffc107", bg: "#fff3cd", label: "Menunggu Feedback" };
    } else if (rencana.status === "sudah ada feedback") {
      return { color: "#28a745", bg: "#d4edda", label: "Disetujui" };
    } else if (rencana.status === "selesai") {
      return { color: "#17a2b8", bg: "#d1ecf1", label: "Selesai" };
    }
    return { color: "#6c757d", bg: "#e2e3e5", label: "Unknown" };
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  useEffect(() => {
    fetchSkills();
    fetchRencanaBelajar();
  }, []);

  return (
    <div
      style={{
        padding: "2rem",
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <div
        style={{
          marginBottom: "2rem",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            margin: "0 0 0.5rem 0",
            color: "#495057",
            fontSize: "2rem",
          }}
        >
          Rencana Belajar
        </h1>
        <p
          style={{
            margin: "0",
            color: "#6c757d",
            fontSize: "1.1rem",
          }}
        >
          Buat rencana belajar yang disesuaikan dengan target dan kemampuan Anda
        </p>
      </div>

      {/* SINGLE STATUS MESSAGE - NO DUPLICATES */}
      {!loadingList && (
        <>
          {/* Case 1: Tidak ada skor awal */}
          {blockReason === "no_skor" && (
            <div
              style={{
                backgroundColor: "#fff3cd",
                color: "#856404",
                padding: "1.5rem",
                borderRadius: "8px",
                border: "1px solid #ffeaa7",
                marginBottom: "2rem",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              <AlertCircle size={24} />
              <div>
                <strong>Skor Awal Diperlukan</strong>
                <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.9rem" }}>
                  Anda perlu mengajukan dan mendapatkan persetujuan skor awal
                  terlebih dahulu sebelum dapat membuat rencana belajar.
                  <a
                    href="/skor-awal"
                    style={{
                      color: "#856404",
                      fontWeight: "600",
                      marginLeft: "0.5rem",
                    }}
                  >
                    Klik di sini untuk mengajukan skor awal.
                  </a>
                </p>
              </div>
            </div>
          )}

          {/* Case 2: Ada pending plan */}
          {blockReason === "pending_plan" && skorInfo && (
            <div
              style={{
                backgroundColor: "#fff3cd",
                color: "#856404",
                padding: "1.5rem",
                borderRadius: "8px",
                border: "1px solid #ffeaa7",
                marginBottom: "2rem",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              <Clock size={24} />
              <div style={{ flex: 1 }}>
                <strong>Menunggu Feedback Instruktur</strong>
                <p style={{ margin: "0.5rem 0 0.5rem 0", fontSize: "0.9rem" }}>
                  Anda memiliki rencana belajar yang menunggu feedback dari
                  instruktur. Tunggu feedback sebelum membuat rencana baru.
                </p>
                <div style={{ fontSize: "0.85rem", opacity: 0.8 }}>
                  Skor Awal: {skorInfo.namaTes} - {skorInfo.skor} (Disetujui)
                </div>
              </div>
              <div
                style={{
                  backgroundColor: "#ffc107",
                  color: "#212529",
                  padding: "0.5rem 1rem",
                  borderRadius: "20px",
                  fontSize: "0.8rem",
                  fontWeight: "600",
                }}
              >
                PENDING
              </div>
            </div>
          )}

          {/* Case 3: Approved plan masih aktif */}
          {blockReason === "approved_plan_active" && skorInfo && (
            <div
              style={{
                backgroundColor: "#e8f5e8",
                color: "#155724",
                padding: "1.5rem",
                borderRadius: "8px",
                border: "1px solid #c3e6cb",
                marginBottom: "2rem",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              <CheckCircle size={24} />
              <div style={{ flex: 1 }}>
                <strong>Rencana Belajar Aktif & Disetujui</strong>
                <p style={{ margin: "0.5rem 0 0.5rem 0", fontSize: "0.9rem" }}>
                  Rencana belajar Anda telah disetujui instruktur dan sedang
                  dalam periode aktif. Anda dapat mengakses materi pembelajaran.
                  Tunggu periode ini selesai untuk membuat rencana baru.
                </p>
                <div style={{ fontSize: "0.85rem", opacity: 0.9 }}>
                  Skor Awal: {skorInfo.namaTes} - {skorInfo.skor} |
                  <a
                    href="/materi"
                    style={{
                      color: "#155724",
                      fontWeight: "600",
                      marginLeft: "0.5rem",
                    }}
                  >
                    Akses Materi Pembelajaran
                  </a>
                </div>
              </div>
              <div
                style={{
                  backgroundColor: "#28a745",
                  color: "white",
                  padding: "0.5rem 1rem",
                  borderRadius: "20px",
                  fontSize: "0.8rem",
                  fontWeight: "600",
                }}
              >
                APPROVED
              </div>
            </div>
          )}

          {/* Case 4: Ready to create */}
          {blockReason === "ready" && skorInfo && (
            <div
              style={{
                backgroundColor: "#d4edda",
                color: "#155724",
                padding: "1.5rem",
                borderRadius: "8px",
                border: "1px solid #c3e6cb",
                marginBottom: "2rem",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              <CheckCircle size={24} />
              <div style={{ flex: 1 }}>
                <strong>Siap Membuat Rencana Belajar</strong>
                <p style={{ margin: "0.5rem 0 0.5rem 0", fontSize: "0.9rem" }}>
                  Skor awal Anda telah disetujui dan siap untuk membuat rencana
                  belajar baru.
                </p>
                <div style={{ fontSize: "0.85rem", opacity: 0.9 }}>
                  Skor Awal: {skorInfo.namaTes} - {skorInfo.skor} | Berlaku
                  sampai:{" "}
                  {skorInfo.masaBerlakuDokumen
                    ? formatDate(skorInfo.masaBerlakuDokumen)
                    : "Tidak terbatas"}
                </div>
              </div>
              <div
                style={{
                  backgroundColor: "#28a745",
                  color: "white",
                  padding: "0.5rem 1rem",
                  borderRadius: "20px",
                  fontSize: "0.8rem",
                  fontWeight: "600",
                }}
              >
                READY
              </div>
            </div>
          )}

          {/* Case 5: Backend block reason unknown */}
          {blockReason === "backend_block" && skorInfo && (
            <div
              style={{
                backgroundColor: "#f8d7da",
                color: "#721c24",
                padding: "1.5rem",
                borderRadius: "8px",
                border: "1px solid #f5c6cb",
                marginBottom: "2rem",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              <AlertCircle size={24} />
              <div style={{ flex: 1 }}>
                <strong>Tidak Dapat Membuat Rencana Baru</strong>
                <p style={{ margin: "0.5rem 0 0.5rem 0", fontSize: "0.9rem" }}>
                  Sistem mencegah pembuatan rencana belajar baru saat ini.
                  Kemungkinan ada aturan periode atau batasan yang berlaku.
                </p>
                <div style={{ fontSize: "0.85rem", opacity: 0.8 }}>
                  Skor Awal: {skorInfo.namaTes} - {skorInfo.skor} (Disetujui)
                </div>
              </div>
              <div
                style={{
                  backgroundColor: "#dc3545",
                  color: "white",
                  padding: "0.5rem 1rem",
                  borderRadius: "20px",
                  fontSize: "0.8rem",
                  fontWeight: "600",
                }}
              >
                BLOCKED
              </div>
            </div>
          )}
        </>
      )}

      {/* Loading State */}
      {loadingList && (
        <div
          style={{
            backgroundColor: "#e2e3e5",
            color: "#6c757d",
            padding: "1.5rem",
            borderRadius: "8px",
            border: "1px solid #ced4da",
            marginBottom: "2rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <Clock size={24} />
          <div>
            <strong>Memuat Status Rencana Belajar...</strong>
            <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.9rem" }}>
              Mengecek skor awal dan riwayat rencana belajar Anda
            </p>
          </div>
        </div>
      )}

      {/* Debug Info - Enhanced */}
      {process.env.NODE_ENV === "development" && (
        <div
          style={{
            backgroundColor: "#f8f9fa",
            padding: "1rem",
            borderRadius: "6px",
            border: "1px solid #dee2e6",
            marginBottom: "1rem",
            fontSize: "0.8rem",
            color: "#6c757d",
          }}
        >
          <strong>Debug Info:</strong>
          <br />
          hasApprovedSkor: {String(hasApprovedSkor)}
          <br />
          canCreatePlan: {String(canCreatePlan)}
          <br />
          blockReason: {blockReason}
          <br />
          skorInfo:{" "}
          {skorInfo ? `${skorInfo.namaTes} - ${skorInfo.skor}` : "null"}
          <br />
          loading: {String(loadingList)}
          <br />
          riwayat count: {rencanaBelajarList.length}
        </div>
      )}

      {/* Action Buttons - FIXED LOGIC */}
      {hasApprovedSkor && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2rem",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <button
              onClick={() => setShowForm(!showForm)}
              disabled={!canCreatePlan}
              style={{
                backgroundColor: showForm
                  ? "#6c757d"
                  : canCreatePlan
                  ? "#B6252A"
                  : "#adb5bd",
                color: "white",
                border: "none",
                padding: "0.75rem 1.5rem",
                borderRadius: "6px",
                cursor: canCreatePlan ? "pointer" : "not-allowed",
                fontSize: "1rem",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                transition: "all 0.2s",
              }}
            >
              {showForm ? <CheckCircle size={18} /> : <Plus size={18} />}
              {showForm ? "Tutup Form" : "Buat Rencana Baru"}
            </button>

            {/* Help Text */}
            {!canCreatePlan && (
              <p
                style={{
                  margin: "0.5rem 0 0 0",
                  fontSize: "0.8rem",
                  color: "#6c757d",
                  fontStyle: "italic",
                }}
              >
                Selesaikan rencana yang ada terlebih dahulu
              </p>
            )}
          </div>

          <div
            style={{
              backgroundColor: canCreatePlan ? "#e3f2fd" : "#f8f9fa",
              padding: "0.75rem 1rem",
              borderRadius: "6px",
              border: `1px solid ${canCreatePlan ? "#bbdefb" : "#dee2e6"}`,
              fontSize: "0.9rem",
              color: canCreatePlan ? "#1565c0" : "#6c757d",
            }}
          >
            <strong>Info:</strong>{" "}
            {canCreatePlan
              ? "Rencana yang disetujui akan membuka akses unit pembelajaran"
              : "Rencana belajar yang sedang berjalan harus diselesaikan dulu"}
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div
          style={{
            backgroundColor: "#d4edda",
            color: "#155724",
            padding: "1rem",
            borderRadius: "6px",
            border: "1px solid #c3e6cb",
            marginBottom: "2rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <CheckCircle size={20} />
          {success}
        </div>
      )}

      {/* General Error */}
      {errors.general && (
        <div
          style={{
            backgroundColor: "#f8d7da",
            color: "#721c24",
            padding: "1rem",
            borderRadius: "6px",
            border: "1px solid #f5c6cb",
            marginBottom: "2rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <AlertCircle size={20} />
          {errors.general}
        </div>
      )}

      {/* Form */}
      {showForm && canCreatePlan && (
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "8px",
            padding: "2rem",
            marginBottom: "2rem",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            border: "1px solid #dee2e6",
          }}
        >
          <h3
            style={{
              margin: "0 0 1.5rem 0",
              color: "#495057",
              fontSize: "1.5rem",
            }}
          >
            Form Rencana Belajar
          </h3>

          <form onSubmit={handleSubmit} style={{ width: "100%" }}>
            {/* Basic Info */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "1.5rem",
                marginBottom: "2rem",
              }}
            >
              {/* Target Skor */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "600",
                    color: "#495057",
                  }}
                >
                  Target Skor *
                </label>
                <input
                  type="number"
                  name="target_skor"
                  value={formData.target_skor}
                  onChange={handleChange}
                  min="0"
                  max="990"
                  required
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: errors.target_skor
                      ? "2px solid #dc3545"
                      : "1px solid #ced4da",
                    borderRadius: "4px",
                    fontSize: "1rem",
                  }}
                  placeholder="Contoh: 550"
                />
                {errors.target_skor && (
                  <small style={{ color: "#dc3545", fontSize: "0.875rem" }}>
                    {errors.target_skor[0]}
                  </small>
                )}
              </div>

              {/* Target Waktu */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "600",
                    color: "#495057",
                  }}
                >
                  Target Waktu *
                </label>
                <select
                  name="target_waktu"
                  value={formData.target_waktu}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: errors.target_waktu
                      ? "2px solid #dc3545"
                      : "1px solid #ced4da",
                    borderRadius: "4px",
                    fontSize: "1rem",
                  }}
                >
                  <option value="">Pilih target waktu</option>
                  <option value="2 minggu">2 minggu</option>
                  <option value="3 minggu">3 minggu</option>
                  <option value="1 bulan">1 bulan</option>
                </select>
                {errors.target_waktu && (
                  <small style={{ color: "#dc3545", fontSize: "0.875rem" }}>
                    {errors.target_waktu[0]}
                  </small>
                )}
              </div>

              {/* Frekuensi Mingguan */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "600",
                    color: "#495057",
                  }}
                >
                  Frekuensi Mingguan *
                </label>
                <select
                  name="frekuensi_mingguan"
                  value={formData.frekuensi_mingguan}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: errors.frekuensi_mingguan
                      ? "2px solid #dc3545"
                      : "1px solid #ced4da",
                    borderRadius: "4px",
                    fontSize: "1rem",
                  }}
                >
                  <option value="">Pilih frekuensi per minggu</option>
                  <option value="1">1 hari per minggu</option>
                  <option value="2">2 hari per minggu</option>
                  <option value="3">3 hari per minggu</option>
                  <option value="4">4 hari per minggu</option>
                  <option value="5">5 hari per minggu</option>
                  <option value="6">6 hari per minggu</option>
                  <option value="7">7 hari per minggu</option>
                </select>
                {errors.frekuensi_mingguan && (
                  <small style={{ color: "#dc3545", fontSize: "0.875rem" }}>
                    {errors.frekuensi_mingguan[0]}
                  </small>
                )}
              </div>

              {/* Durasi Harian */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "600",
                    color: "#495057",
                  }}
                >
                  Durasi Harian *
                </label>
                <select
                  name="durasi_harian"
                  value={formData.durasi_harian}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: errors.durasi_harian
                      ? "2px solid #dc3545"
                      : "1px solid #ced4da",
                    borderRadius: "4px",
                    fontSize: "1rem",
                  }}
                >
                  <option value="">Pilih durasi per hari</option>
                  <option value="<1 jam">Kurang dari 1 jam</option>
                  <option value="<2 jam">Kurang dari 2 jam</option>
                  <option value="2-3 jam">2-3 jam</option>
                </select>
                {errors.durasi_harian && (
                  <small style={{ color: "#dc3545", fontSize: "0.875rem" }}>
                    {errors.durasi_harian[0]}
                  </small>
                )}
              </div>
            </div>

            {/* Skills Selection - TANPA FILTER & TOMBOL PILIH/HAPUS SEMUA */}
            <div style={{ marginBottom: "2rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "1rem",
                  fontWeight: "600",
                  color: "#495057",
                  fontSize: "1.1rem",
                }}
              >
                Pilih Skills yang Ingin Dipelajari *
              </label>
              {/* Skills Count Info - TANPA FILTER */}
              <div
                style={{
                  padding: "1rem",
                  backgroundColor: "#e3f2fd",
                  borderRadius: "6px",
                  border: "1px solid #bbdefb",
                  marginBottom: "1rem",
                  fontSize: "0.9rem",
                  color: "#1565c0",
                }}
              >
                <strong>Skills Available:</strong> {skillList.length} skills |
                <strong> Terpilih:</strong> {formData.skill.length} skills
              </div>

              {/* Skills Grid - TANPA FILTER CATEGORY */}
              {loadingSkills ? (
                <div
                  style={{
                    padding: "2rem",
                    textAlign: "center",
                    color: "#6c757d",
                    border: "1px solid #dee2e6",
                    borderRadius: "6px",
                    backgroundColor: "#f8f9fa",
                  }}
                >
                  Memuat skills...
                </div>
              ) : skillList.length === 0 ? (
                <div
                  style={{
                    padding: "2rem",
                    textAlign: "center",
                    color: "#6c757d",
                    border: "1px solid #dee2e6",
                    borderRadius: "6px",
                    backgroundColor: "#f8f9fa",
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 1rem 0",
                      fontSize: "1rem",
                      fontWeight: "600",
                    }}
                  >
                    Skills tidak tersedia
                  </p>
                  <p style={{ margin: "0", fontSize: "0.9rem" }}>
                    Pastikan backend endpoint berjalan atau hubungi
                    administrator
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    border: errors.skill
                      ? "2px solid #dc3545"
                      : "1px solid #ced4da",
                    borderRadius: "6px",
                    backgroundColor: "#f8f9fa",
                    padding: "1rem",
                  }}
                >
                  {/* Skills Grid - SEMUA SKILLS TANPA FILTER */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(350px, 1fr))",
                      gap: "1rem",
                      maxHeight: "500px",
                      overflowY: "auto",
                    }}
                  >
                    {skillList.map((skill) => (
                      <label
                        key={skill.idSkill}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "1rem",
                          padding: "1.25rem",
                          backgroundColor: formData.skill.includes(
                            skill.idSkill
                          )
                            ? "#fff3cd"
                            : "white",
                          borderRadius: "8px",
                          border: formData.skill.includes(skill.idSkill)
                            ? "2px solid #B6252A"
                            : "1px solid #dee2e6",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (!formData.skill.includes(skill.idSkill)) {
                            e.currentTarget.style.backgroundColor = "#f0f8ff";
                            e.currentTarget.style.borderColor = "#B6252A";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!formData.skill.includes(skill.idSkill)) {
                            e.currentTarget.style.backgroundColor = "white";
                            e.currentTarget.style.borderColor = "#dee2e6";
                          }
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={formData.skill.includes(skill.idSkill)}
                          onChange={() => handleSkillChange(skill.idSkill)}
                          style={{
                            marginTop: "0.25rem",
                            transform: "scale(1.3)",
                            accentColor: "#B6252A",
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          {/* Skill Name */}
                          <div
                            style={{
                              fontWeight: "700",
                              color: formData.skill.includes(skill.idSkill)
                                ? "#B6252A"
                                : "#495057",
                              marginBottom: "0.5rem",
                              fontSize: "0.95rem",
                              lineHeight: "1.3",
                            }}
                          >
                            {skill.skill}
                          </div>

                          {/* Skill Description */}
                          <div
                            style={{
                              fontSize: "0.85rem",
                              color: "#6c757d",
                              lineHeight: "1.4",
                              marginBottom: "0.75rem",
                            }}
                          >
                            {skill.deskripsi}
                          </div>

                          {/* Module Badge */}
                          <div
                            style={{
                              fontSize: "0.75rem",
                              fontWeight: "600",
                              color: "#B6252A",
                              backgroundColor:
                                skill.kategori === "Listening Comprehension"
                                  ? "#e8f5e8"
                                  : skill.kategori ===
                                    "Structure and Written Expression"
                                  ? "#fff3cd"
                                  : "#e3f2fd",
                              padding: "0.25rem 0.75rem",
                              borderRadius: "12px",
                              display: "inline-block",
                              border: "1px solid #dee2e6",
                            }}
                          >
                            {skill.kategori === "Listening Comprehension"
                              ? "LISTENING"
                              : skill.kategori ===
                                "Structure and Written Expression"
                              ? "STRUCTURE"
                              : "READING"}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Validation Error */}
              {errors.skill && (
                <div
                  style={{
                    marginTop: "0.75rem",
                    padding: "0.75rem",
                    backgroundColor: "#f8d7da",
                    color: "#721c24",
                    borderRadius: "6px",
                    border: "1px solid #f5c6cb",
                    fontSize: "0.9rem",
                  }}
                >
                  <strong>Error:</strong> {errors.skill[0]}
                </div>
              )}

              {/* Skills Summary */}
              <div
                style={{
                  marginTop: "1rem",
                  padding: "0.75rem",
                  backgroundColor:
                    formData.skill.length > 0 ? "#d4edda" : "#fff3cd",
                  borderRadius: "6px",
                  border: `1px solid ${
                    formData.skill.length > 0 ? "#c3e6cb" : "#ffeaa7"
                  }`,
                  fontSize: "0.9rem",
                  color: formData.skill.length > 0 ? "#155724" : "#856404",
                }}
              >
                <strong>Ringkasan:</strong> {formData.skill.length} skills
                terpilih dari {skillList.length} total skills TOEFL ITP
                {formData.skill.length > 0 && (
                  <span style={{ marginLeft: "0.5rem", fontWeight: "normal" }}>
                    - Siap untuk diajukan ke instruktur
                  </span>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div style={{ textAlign: "right" }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  backgroundColor: loading ? "#6c757d" : "#B6252A",
                  color: "white",
                  border: "none",
                  padding: "0.75rem 2rem",
                  borderRadius: "6px",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontSize: "1rem",
                  fontWeight: "600",
                }}
              >
                {loading ? "Mengajukan..." : "Submit Rencana Belajar"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List Rencana Belajar */}
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "1.5rem",
            borderBottom: "1px solid #dee2e6",
            backgroundColor: "#f8f9fa",
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: "1.25rem",
              color: "#495057",
            }}
          >
            Riwayat Rencana Belajar
          </h3>
        </div>

        {loadingList ? (
          <div
            style={{
              padding: "3rem",
              textAlign: "center",
              color: "#6c757d",
            }}
          >
            Memuat data rencana belajar...
          </div>
        ) : rencanaBelajarList.length === 0 ? (
          <div
            style={{
              padding: "3rem",
              textAlign: "center",
              color: "#6c757d",
            }}
          >
            <BookOpen
              size={48}
              color="#dee2e6"
              style={{ marginBottom: "1rem" }}
            />
            <p style={{ margin: 0, fontSize: "1.1rem" }}>
              Belum ada rencana belajar
            </p>
            <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.9rem" }}>
              {hasApprovedSkor
                ? 'Klik tombol "Buat Rencana Baru" untuk membuat rencana pertama'
                : "Ajukan skor awal terlebih dahulu untuk membuat rencana belajar"}
            </p>
          </div>
        ) : (
          <div style={{ padding: "1.5rem" }}>
            {rencanaBelajarList.map((item, index) => {
              const statusBadge = getStatusBadge(item);

              return (
                <div
                  key={item.idPengajuanRencanaBelajar}
                  style={{
                    border: "1px solid #dee2e6",
                    borderRadius: "8px",
                    padding: "1.5rem",
                    marginBottom:
                      index < rencanaBelajarList.length - 1 ? "1rem" : 0,
                    backgroundColor:
                      item.status === "sudah ada feedback"
                        ? "#f8fff8"
                        : "white",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "1rem",
                      flexWrap: "wrap",
                      gap: "1rem",
                    }}
                  >
                    <div>
                      <h4
                        style={{
                          margin: "0 0 0.5rem 0",
                          fontSize: "1.1rem",
                          color: "#495057",
                        }}
                      >
                        Target Skor: {item.targetSkor} | {item.targetWaktu}
                      </h4>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          color: "#6c757d",
                          fontSize: "0.9rem",
                        }}
                      >
                        <Calendar size={16} />
                        Diajukan: {formatDate(item.created_at)}
                      </div>
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
                          backgroundColor: statusBadge.bg,
                          color: statusBadge.color,
                          padding: "0.4rem 0.8rem",
                          borderRadius: "20px",
                          fontSize: "0.85rem",
                          fontWeight: "600",
                          border: `1px solid ${statusBadge.color}30`,
                        }}
                      >
                        {statusBadge.label}
                      </span>
                    </div>
                  </div>

                 

                  {/* Skills Preview - HANYA PREVIEW 3 SKILLS */}
                  {item.detailPengajuanRencanaBelajar &&
                    item.detailPengajuanRencanaBelajar.length > 0 && (
                      <div style={{ marginBottom: "1rem" }}>
                        <strong
                          style={{
                            color: "#495057",
                            marginBottom: "0.5rem",
                            display: "block",
                          }}
                        >
                          Skills yang Diminta:
                        </strong>
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "0.5rem",
                          }}
                        >
                          {item.detailPengajuanRencanaBelajar
                            .slice(0, 3)
                            .map((detail) => (
                              <span
                                key={detail.idDetailPengajuan}
                                style={{
                                  backgroundColor: "#e3f2fd",
                                  color: "#1565c0",
                                  padding: "0.25rem 0.5rem",
                                  borderRadius: "12px",
                                  fontSize: "0.8rem",
                                  fontWeight: "500",
                                }}
                              >
                                {detail.skill?.skill || "Unknown Skill"}
                              </span>
                            ))}
                          {item.detailPengajuanRencanaBelajar.length > 3 && (
                            <span
                              style={{
                                color: "#6c757d",
                                fontSize: "0.8rem",
                                padding: "0.25rem",
                              }}
                            >
                              +{item.detailPengajuanRencanaBelajar.length - 3}{" "}
                              lainnya
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                  {/* Status Message */}
                  {item.status === "sudah ada feedback" && (
                    <div
                      style={{
                        backgroundColor: "#e8f5e8",
                        padding: "1rem",
                        borderRadius: "6px",
                        border: "1px solid #c3e6cb",
                        marginBottom: "1rem",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          marginBottom: "0.5rem",
                        }}
                      >
                        <CheckCircle size={16} color="#28a745" />
                        <strong
                          style={{ color: "#155724", fontSize: "0.95rem" }}
                        >
                          Rencana Telah Disetujui!
                        </strong>
                      </div>

                      <p
                        style={{
                          margin: "0",
                          color: "#155724",
                          fontSize: "0.9rem",
                          lineHeight: "1.4",
                        }}
                      >
                        Instruktur telah memberikan feedback dan memilih skills
                        untuk fokus pembelajaran Anda. Unit pembelajaran sudah
                        terbuka sesuai feedback.
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: "1rem",
                      paddingTop: "1rem",
                      borderTop: "1px solid #dee2e6",
                      flexWrap: "wrap",
                      gap: "1rem",
                    }}
                  >
                    {/* Lihat Detail Button */}
                    <button
                      onClick={() =>
                        fetchDetailRencana(item.idPengajuanRencanaBelajar)
                      }
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        color: "#B6252A",
                        backgroundColor: "transparent",
                        border: "1px solid #B6252A",
                        padding: "0.5rem 1rem",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "0.85rem",
                        fontWeight: "500",
                      }}
                    >
                      <Eye size={14} />
                      Lihat Detail
                    </button>

                    
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* POPUP DETAIL RENCANA BELAJAR - SEMUA STATUS */}
      {selectedDetail && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '2rem',
            maxWidth: '900px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{
                margin: 0,
                fontSize: '1.25rem',
                color: '#495057'
              }}>
                Detail Rencana Belajar
              </h3>
              
              <button
                onClick={() => setSelectedDetail(null)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: '4px'
                }}
              >
                <X size={20} color="#6c757d" />
              </button>
            </div>

            {loadingDetail ? (
              <div style={{
                padding: '3rem',
                textAlign: 'center',
                color: '#6c757d'
              }}>
                Memuat detail rencana belajar...
              </div>
            ) : (
              <>
                {/* Informasi Umum - UNTUK SEMUA STATUS */}
                <div style={{
                  backgroundColor: '#f8f9fa',
                  padding: '1.5rem',
                  borderRadius: '6px',
                  marginBottom: '1.5rem',
                  border: '1px solid #dee2e6'
                }}>
                  <h4 style={{ margin: '0 0 1rem 0', fontWeight: '600', color: '#495057' }}>
                    {selectedDetail.namaRencana}
                  </h4>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                    fontSize: '0.9rem'
                  }}>
                    <div>
                      <strong>Target Skor:</strong> {selectedDetail.targetSkor}
                    </div>
                    <div>
                      <strong>Target Waktu:</strong> {selectedDetail.targetWaktu}
                    </div>
                    <div>
                      <strong>Frekuensi:</strong> {selectedDetail.hariPerMinggu} hari/minggu
                    </div>
                    <div>
                      <strong>Durasi:</strong> {selectedDetail.jamPerHari}
                    </div>
                    <div>
                      <strong>Status:</strong> 
                      <span style={{
                        marginLeft: '0.5rem',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        backgroundColor: selectedDetail.status === 'sudah ada feedback' ? '#d4edda' : 
                                        selectedDetail.status === 'pending' ? '#fff3cd' : '#e2e3e5',
                        color: selectedDetail.status === 'sudah ada feedback' ? '#155724' : 
                               selectedDetail.status === 'pending' ? '#856404' : '#6c757d'
                      }}>
                        {selectedDetail.status === 'sudah ada feedback' ? 'Disetujui' :
                         selectedDetail.status === 'pending' ? 'Menunggu Review' :
                         'Selesai'}
                      </span>
                    </div>
                    <div>
                      <strong>Tanggal Diajukan:</strong> {formatDate(selectedDetail.created_at)}
                    </div>
                  </div>
                </div>

                {/* Skills yang Diminta - UNTUK SEMUA STATUS */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{
                    margin: '0 0 1rem 0',
                    color: '#495057',
                    fontSize: '1.1rem'
                  }}>
                    Skills yang Anda Ajukan ({selectedDetail.detail_pengajuan_rencana_belajar?.length || 0})
                  </h4>

                  {selectedDetail.detail_pengajuan_rencana_belajar && selectedDetail.detail_pengajuan_rencana_belajar.length > 0 ? (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                      gap: '1rem',
                      backgroundColor: '#f8f9fa',
                      padding: '1rem',
                      borderRadius: '6px',
                      border: '1px solid #dee2e6'
                    }}>
                      {selectedDetail.detail_pengajuan_rencana_belajar.map(detail => (
                        <div
                          key={detail.idDetailPengajuan}
                          style={{
                            backgroundColor: 'white',
                            padding: '1rem',
                            borderRadius: '6px',
                            border: '1px solid #e3f2fd',
                            borderLeft: '4px solid #1565c0'
                          }}
                        >
                          <div style={{
                            fontWeight: '600',
                            color: '#1565c0',
                            fontSize: '0.9rem',
                            marginBottom: '0.5rem'
                          }}>
                            {detail.skill?.skill || 'Unknown Skill'}
                          </div>
                          <div style={{
                            fontSize: '0.85rem',
                            color: '#6c757d',
                            lineHeight: '1.3',
                            marginBottom: '0.75rem'
                          }}>
                            {detail.skill?.deskripsi || 'No description'}
                          </div>
                          <div style={{
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            color: '#495057',
                            backgroundColor: detail.skill?.kategori === 'Listening Comprehension' ? '#e8f5e8' :
                                           detail.skill?.kategori === 'Structure and Written Expression' ? '#fff3cd' :
                                           '#e3f2fd',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            display: 'inline-block'
                          }}>
                            {detail.skill?.kategori === 'Listening Comprehension' ? 'LISTENING' :
                             detail.skill?.kategori === 'Structure and Written Expression' ? 'STRUCTURE' :
                             'READING'}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{
                      padding: '2rem',
                      textAlign: 'center',
                      color: '#6c757d',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '6px',
                      border: '1px solid #dee2e6'
                    }}>
                      Tidak ada skills yang diajukan
                    </div>
                  )}
                </div>

                {/* Status Conditional Messages */}
                {selectedDetail.status === 'pending' && (
                  <div style={{
                    backgroundColor: '#fff3cd',
                    color: '#856404',
                    padding: '1rem',
                    borderRadius: '6px',
                    border: '1px solid #ffeaa7',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <Clock size={16} />
                    <div>
                      <strong>Status Pending</strong>
                      <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
                        Rencana belajar Anda sedang menunggu review dari instruktur. 
                        Feedback akan diberikan secepatnya.
                      </p>
                    </div>
                  </div>
                )}

                {/* Feedback Instruktur - HANYA JIKA ADA */}
                {selectedDetail.feedback_rencana_belajar && selectedDetail.feedback_rencana_belajar.detail_feedback_rencana_belajar && selectedDetail.feedback_rencana_belajar.detail_feedback_rencana_belajar.length > 0 && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{
                      margin: '0 0 1rem 0',
                      color: '#495057',
                      fontSize: '1.1rem'
                    }}>
                      Feedback Instruktur
                    </h4>

                    <div style={{
                      backgroundColor: '#e8f5e8',
                      padding: '1.5rem',
                      borderRadius: '6px',
                      border: '1px solid #c3e6cb'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '1rem'
                      }}>
                        <CheckCircle size={18} color="#28a745" />
                        <strong style={{ color: '#155724', fontSize: '1rem' }}>
                          Skills yang Direkomendasikan Instruktur ({selectedDetail.feedback_rencana_belajar.detail_feedback_rencana_belajar?.length || 0})
                        </strong>
                      </div>

                      {/* Skills Feedback - GROUPED BY MODULE */}
                      {(() => {
                        const skillsByModule = {};
                        selectedDetail.feedback_rencana_belajar.detail_feedback_rencana_belajar.forEach(detail => {
                          const kategori = detail.skill?.kategori || 'Unknown';
                          if (!skillsByModule[kategori]) skillsByModule[kategori] = [];
                          skillsByModule[kategori].push(detail);
                        });

                        return Object.entries(skillsByModule).map(([kategori, skills]) => (
                          <div key={kategori} style={{ marginBottom: '1.5rem' }}>
                            {/* Module Header */}
                            <h5 style={{
                              margin: '0 0 0.75rem 0',
                              color: '#155724',
                              fontSize: '0.95rem',
                              fontWeight: '600',
                              padding: '0.5rem 1rem',
                              backgroundColor: 'white',
                              borderRadius: '6px',
                              border: '1px solid #28a745',
                              borderLeft: '4px solid #28a745'
                            }}>
                              Modul: {kategori === 'Listening Comprehension' ? 'LISTENING COMPREHENSION' :
                                     kategori === 'Structure and Written Expression' ? 'STRUCTURE & WRITTEN EXPRESSION' :
                                     'READING COMPREHENSION'} ({skills.length} skills)
                            </h5>

                            {/* Skills Grid */}
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                              gap: '0.75rem'
                            }}>
                              {skills.map(detail => (
                                <div
                                  key={detail.idDetailFeedback}
                                  style={{
                                    backgroundColor: 'white',
                                    padding: '1rem',
                                    borderRadius: '6px',
                                    border: '1px solid #28a745',
                                    borderLeft: '4px solid #28a745'
                                  }}
                                >
                                  <div style={{
                                    fontWeight: '600',
                                    color: '#155724',
                                    fontSize: '0.9rem',
                                    marginBottom: '0.5rem'
                                  }}>
                                    {detail.skill?.skill || 'Unknown Skill'}
                                  </div>
                                  <div style={{
                                    fontSize: '0.8rem',
                                    color: '#6c757d',
                                    lineHeight: '1.3'
                                  }}>
                                    {detail.skill?.deskripsi || 'No description available'}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                )}

                {/* Close Button */}
                <div style={{ textAlign: 'right' }}>
                  <button
                    onClick={() => setSelectedDetail(null)}
                    style={{
                      backgroundColor: '#6c757d',
                      color: 'white',
                      border: 'none',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      fontWeight: '500'
                    }}
                  >
                    Tutup
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

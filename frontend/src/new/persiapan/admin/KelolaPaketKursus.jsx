import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Plus,
  Edit2,
  Settings,
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  Crown,
  Clock,
  Users,
  Calendar,
} from "lucide-react";
import api from "../../shared/services/api";

const KelolaPaketKursus = () => {
  const navigate = useNavigate();
  const [paketList, setPaketList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // create, edit
  const [selectedPaket, setSelectedPaket] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    namaPaket: "",
    harga: "",
    masaBerlaku: "",
    fasilitas: "",
  });

  // Valid fasilitas keywords for validation
  const validFasilitasKeywords = [
    "listening",
    "structure",
    "reading",
    "konsultasi",
    "simulasi",
  ];

  useEffect(() => {
    loadPaketKursus();
  }, []);

  const loadPaketKursus = async () => {
    try {
      setLoading(true);
      const timestamp = new Date().getTime();

      // Fetch data paket
      const paketResponse = await api.get(`/paket-kursus?t=${timestamp}`);

      // Fetch data dashboard admin untuk dapat total peserta per paket
      const dashboardResponse = await api.get("/admin/dashboard-admin");
      const paketStats = dashboardResponse.data.totalPesertaPerPaket;

      // Gabungkan data paket dengan statistik peserta
      const transformedData = paketResponse.data.map((paket) => {
        const stat = paketStats.find((s) => s.namaPaket === paket.namaPaket);
        return {
          ...paket,
          totalPengguna: stat ? stat.totalPeserta : 0,
        };
      });

      console.log("Fresh data with user count:", transformedData);
      setPaketList(transformedData);
    } catch (error) {
      console.error("Error loading paket kursus:", error);
      setError("Gagal memuat daftar paket kursus");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      namaPaket: "",
      harga: "",
      masaBerlaku: "",
      fasilitas: "",
    });
  };

  const validateFasilitas = (fasilitasString) => {
    if (!fasilitasString.trim()) {
      return { valid: false, message: "Fasilitas tidak boleh kosong" };
    }

    // Split by comma and trim whitespace
    const keywords = fasilitasString
      .split(",")
      .map((k) => k.trim().toLowerCase());

    // Check if any keyword is empty
    if (keywords.some((k) => k === "")) {
      return {
        valid: false,
        message: "Format tidak valid: tidak boleh ada keyword kosong",
      };
    }

    // Check if all keywords are valid
    const invalidKeywords = keywords.filter(
      (k) => !validFasilitasKeywords.includes(k)
    );
    if (invalidKeywords.length > 0) {
      return {
        valid: false,
        message: `Keyword tidak valid: "${invalidKeywords.join(
          ", "
        )}". Hanya boleh: ${validFasilitasKeywords.join(", ")}`,
      };
    }

    // Check for duplicates
    const uniqueKeywords = [...new Set(keywords)];
    if (uniqueKeywords.length !== keywords.length) {
      return { valid: false, message: "Tidak boleh ada keyword yang duplikat" };
    }

    return { valid: true, message: "Format fasilitas valid" };
  };

  const openModal = (mode, paket = null) => {
    setModalMode(mode);
    setSelectedPaket(paket);
    setError("");
    setSuccess("");

    if (mode === "edit" && paket) {
      setFormData({
        namaPaket: paket.namaPaket,
        harga: paket.harga,
        masaBerlaku: paket.masaBerlaku.toString(), // Pastikan ada nilai
        fasilitas: paket.fasilitas || "",
      });

      console.log("Edit mode - Setting formData:", {
        namaPaket: paket.namaPaket,
        harga: paket.harga,
        masaBerlaku: paket.masaBerlaku,
        fasilitas: paket.fasilitas,
      });
    } else {
      resetForm();
    }

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPaket(null);
    resetForm();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Untuk edit mode, gunakan selectedPaket.masaBerlaku jika formData.masaBerlaku kosong
    const finalMasaBerlaku =
      formData.masaBerlaku ||
      (modalMode === "edit" && selectedPaket ? selectedPaket.masaBerlaku : "");

    // Validasi berbeda untuk create vs edit
    if (modalMode === "create") {
      if (
        !formData.namaPaket ||
        !formData.harga ||
        !formData.masaBerlaku ||
        !formData.fasilitas
      ) {
        setError("Semua field wajib diisi");
        return;
      }
    } else {
      // Edit mode - masa berlaku tidak perlu validasi
      if (!formData.namaPaket || !formData.harga || !formData.fasilitas) {
        setError("Nama paket, harga, dan fasilitas wajib diisi");
        return;
      }
    }

    // Validate fasilitas format
    const fasilitasValidation = validateFasilitas(formData.fasilitas);
    if (!fasilitasValidation.valid) {
      setError(fasilitasValidation.message);
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const payload = {
        namaPaket: formData.namaPaket,
        harga: Number(formData.harga),
        fasilitas: formData.fasilitas.trim(),
      };

      // Hanya tambahkan masaBerlaku untuk create mode
      if (modalMode === "create") {
        payload.masaBerlaku = Number(formData.masaBerlaku);
      }

      console.log("Submit payload:", payload);

      if (modalMode === "create") {
        const response = await api.post("/paket-kursus", payload);
        console.log("Create response:", response.data);
        setSuccess("Paket kursus berhasil ditambahkan");
      } else if (modalMode === "edit") {
        const response = await api.patch(
          `/paket-kursus/${selectedPaket.idPaketKursus}/ubah-detail`,
          payload
        );
        console.log("Edit response:", response.data);
        setSuccess("Paket kursus berhasil diperbarui");

        // Force update the specific item in list immediately
        setPaketList((prevList) =>
          prevList.map((item) =>
            item.idPaketKursus === selectedPaket.idPaketKursus
              ? { ...item, ...payload }
              : item
          )
        );
      }

      // Always reload fresh data from server
      setTimeout(async () => {
        await loadPaketKursus();
      }, 100);

      closeModal();
    } catch (error) {
      console.error("Error submitting paket:", error);
      console.error("Error details:", error.response?.data);
      setError(
        error.response?.data?.message ||
          "Terjadi kesalahan saat menyimpan paket"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (paketId, currentStatus) => {
    try {
      // Backend expects 'aktif' boolean parameter
      const payload = {
        aktif: !currentStatus, // Toggle the current status
      };

      await api.patch(`/paket-kursus/${paketId}/aktivasi`, payload);
      setSuccess(
        `Paket berhasil ${currentStatus ? "dinonaktifkan" : "diaktifkan"}`
      );
      await loadPaketKursus();
    } catch (error) {
      console.error("Error toggling status:", error);
      setError(error.response?.data?.message || "Gagal mengubah status paket");
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getPaketIcon = (namaPaket) => {
    if (namaPaket.toLowerCase().includes("premium")) {
      return <Crown size={24} style={{ color: "#D4A574" }} />;
    }
    return <Package size={24} style={{ color: "#B6252A" }} />;
  };

  const getPaketBadge = (namaPaket) => {
    if (namaPaket.toLowerCase().includes("premium")) {
      return (
        <span
          style={{
            backgroundColor: "#D4A574",
            color: "white",
            padding: "0.25rem 0.75rem",
            borderRadius: "12px",
            fontSize: "12px",
            fontWeight: "600",
            position: "absolute",
            top: "1rem",
            right: "1rem",
          }}
        >
          PREMIUM
        </span>
      );
    }
    if (namaPaket.toLowerCase().includes("basic")) {
      return (
        <span
          style={{
            backgroundColor: "#6c757d",
            color: "white",
            padding: "0.25rem 0.75rem",
            borderRadius: "12px",
            fontSize: "12px",
            fontWeight: "600",
            position: "absolute",
            top: "1rem",
            right: "1rem",
          }}
        >
          BASIC
        </span>
      );
    }
    return null;
  };

  const getStatusBadge = (aktif) => {
    return aktif ? (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.25rem",
          padding: "0.25rem 0.5rem",
          fontSize: "12px",
          fontWeight: "500",
          borderRadius: "4px",
          color: "#155724",
          backgroundColor: "#d4edda",
          border: "1px solid #c3e6cb",
        }}
      >
        <CheckCircle size={14} />
        Aktif
      </span>
    ) : (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.25rem",
          padding: "0.25rem 0.5rem",
          fontSize: "12px",
          fontWeight: "500",
          borderRadius: "4px",
          color: "#721c24",
          backgroundColor: "#f8d7da",
          border: "1px solid #f5c6cb",
        }}
      >
        <XCircle size={14} />
        Non-aktif
      </span>
    );
  };

  if (loading) {
    return (
      <div
        style={{
          padding: "1.5rem",
          backgroundColor: "#f9fafb",
          minHeight: "100vh",
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            padding: "2rem",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "16px", color: "#6c757d" }}>
            Memuat daftar paket kursus...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "1.5rem",
        backgroundColor: "#f9fafb",
        minHeight: "100vh",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          marginBottom: "1.5rem",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <button
          onClick={() => navigate("/dashboard")}
          style={{
            backgroundColor: "white",
            border: "1px solid #e9ecef",
            padding: "0.5rem",
            borderRadius: "6px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
          }}
        >
          <ArrowLeft size={20} style={{ color: "#6c757d" }} />
        </button>
        <h1
          style={{
            fontSize: "24px",
            fontWeight: "600",
            color: "#B6252A",
            margin: 0,
          }}
        >
          Kelola Paket Kursus
        </h1>
      </div>

      {/* Alert Messages */}
      {error && (
        <div
          style={{
            backgroundColor: "#f8d7da",
            color: "#721c24",
            border: "1px solid #f5c6cb",
            borderRadius: "6px",
            padding: "1rem",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            backgroundColor: "#d4edda",
            color: "#155724",
            border: "1px solid #c3e6cb",
            borderRadius: "6px",
            padding: "1rem",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <CheckCircle size={18} />
          {success}
        </div>
      )}

      {/* Controls */}
      <div
        style={{
          backgroundColor: "white",
          padding: "1.5rem",
          borderRadius: "8px",
          border: "1px solid #e9ecef",
          marginBottom: "1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <Package size={20} style={{ color: "#B6252A" }} />
          <h3
            style={{
              fontSize: "16px",
              fontWeight: "600",
              color: "#2c3e50",
              margin: 0,
            }}
          >
            Daftar Paket Kursus ({paketList.length})
          </h3>
        </div>

        <button
          onClick={() => openModal("create")}
          style={{
            backgroundColor: "#D4A574",
            color: "white",
            border: "none",
            padding: "0.75rem 1rem",
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: "500",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontFamily: "'Poppins', sans-serif",
          }}
        >
          <Plus size={16} />
          Tambah Paket
        </button>
      </div>

      {/* Paket Cards */}
      {paketList.length === 0 ? (
        <div
          style={{
            backgroundColor: "white",
            padding: "3rem",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <Package
            size={48}
            style={{ color: "#e9ecef", marginBottom: "1rem" }}
          />
          <h3
            style={{
              fontSize: "18px",
              fontWeight: "500",
              color: "#6c757d",
              marginBottom: "0.5rem",
            }}
          >
            Belum Ada Paket Kursus
          </h3>
          <p style={{ color: "#adb5bd", marginBottom: "1.5rem" }}>
            Mulai dengan menambah paket kursus pertama.
          </p>
          <button
            onClick={() => openModal("create")}
            style={{
              backgroundColor: "#D4A574",
              color: "white",
              border: "none",
              padding: "0.75rem 1.5rem",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            <Plus size={16} />
            Tambah Paket Pertama
          </button>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {paketList.map((paket) => (
            <div
              key={paket.idPaketKursus}
              style={{
                backgroundColor: "white",
                borderRadius: "12px",
                border: "1px solid #e9ecef",
                overflow: "hidden",
                position: "relative",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              {/* Badge */}
              {getPaketBadge(paket.namaPaket)}

              {/* Header */}
              <div
                style={{
                  background: paket.namaPaket.toLowerCase().includes("premium")
                    ? "linear-gradient(135deg, #D4A574 0%, #B8956A 100%)"
                    : "linear-gradient(135deg, #B6252A 0%, #A21E23 100%)",
                  color: "white",
                  padding: "1.5rem",
                  textAlign: "center",
                }}
              >
                <div style={{ marginBottom: "0.5rem" }}>
                  {getPaketIcon(paket.namaPaket)}
                </div>
                <h3
                  style={{
                    fontSize: "20px",
                    fontWeight: "600",
                    margin: "0 0 0.5rem 0",
                  }}
                >
                  {paket.namaPaket}
                </h3>
                <div
                  style={{
                    fontSize: "28px",
                    fontWeight: "700",
                    marginBottom: "0.25rem",
                  }}
                >
                  {formatCurrency(paket.harga)}
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    opacity: 0.9,
                  }}
                >
                  Masa berlaku {paket.masaBerlaku} bulan
                  {console.log(
                    `Paket ${paket.namaPaket} - masaBerlaku:`,
                    paket.masaBerlaku
                  )}
                </div>
              </div>

              {/* Content */}
              <div style={{ padding: "1.5rem" }}>
                {/* Stats */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                    marginBottom: "1.5rem",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "#f8f9fa",
                      padding: "0.75rem",
                      borderRadius: "6px",
                      textAlign: "center",
                    }}
                  >
                    <Users
                      size={16}
                      style={{ color: "#6c757d", marginBottom: "0.25rem" }}
                    />
                    <div style={{ fontSize: "12px", color: "#6c757d" }}>
                      Total Pengguna
                    </div>
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: "600",
                        color: "#2c3e50",
                      }}
                    >
                      {paket.totalPengguna || 0}
                    </div>
                  </div>

                  <div
                    style={{
                      backgroundColor: "#f8f9fa",
                      padding: "0.75rem",
                      borderRadius: "6px",
                      textAlign: "center",
                    }}
                  >
                    <Clock
                      size={16}
                      style={{ color: "#6c757d", marginBottom: "0.25rem" }}
                    />
                    <div style={{ fontSize: "12px", color: "#6c757d" }}>
                      Masa Berlaku
                    </div>
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: "600",
                        color: "#2c3e50",
                      }}
                    >
                      {paket.masaBerlaku} bulan
                    </div>
                  </div>
                </div>

                {/* Fasilitas */}
                {paket.fasilitas && (
                  <div style={{ marginBottom: "1.5rem" }}>
                    <h4
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#2c3e50",
                        marginBottom: "0.5rem",
                      }}
                    >
                      Fasilitas:
                    </h4>
                    <div
                      style={{
                        fontSize: "14px",
                        color: "#6c757d",
                        backgroundColor: "#f8f9fa",
                        padding: "0.75rem",
                        borderRadius: "6px",
                        maxHeight: "80px",
                        overflow: "hidden",
                        position: "relative",
                      }}
                    >
                      {paket.fasilitas}
                      <div
                        style={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: "20px",
                          background: "linear-gradient(transparent, #f8f9fa)",
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Status and Actions */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "1rem",
                  }}
                >
                  {getStatusBadge(paket.aktif)}

                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      onClick={() => openModal("edit", paket)}
                      style={{
                        backgroundColor: "#8B5CF6",
                        color: "white",
                        border: "none",
                        padding: "0.5rem",
                        borderRadius: "4px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                        fontSize: "12px",
                      }}
                      title="Edit Paket"
                    >
                      <Edit2 size={14} />
                      Ubah
                    </button>

                    <button
                      onClick={() =>
                        handleToggleStatus(paket.idPaketKursus, paket.aktif)
                      }
                      style={{
                        backgroundColor: paket.aktif ? "#dc3545" : "#28a745",
                        color: "white",
                        border: "none",
                        padding: "0.5rem",
                        borderRadius: "4px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                        fontSize: "12px",
                      }}
                      title={paket.aktif ? "Nonaktifkan" : "Aktifkan"}
                    >
                      <Settings size={14} />
                      {paket.aktif ? "Nonaktif" : "Aktifkan"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            padding: "1rem",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "1.5rem",
              maxWidth: "600px",
              width: "100%",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem",
                paddingBottom: "1rem",
                borderBottom: "1px solid #e9ecef",
              }}
            >
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#B6252A",
                  margin: 0,
                }}
              >
                {modalMode === "create"
                  ? "Tambah Paket Kursus"
                  : "Edit Paket Kursus"}
              </h3>
              <button
                onClick={closeModal}
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#6c757d",
                  padding: 0,
                }}
              >
                ×
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              {error && (
                <div
                  style={{
                    backgroundColor: "#f8d7da",
                    color: "#721c24",
                    border: "1px solid #f5c6cb",
                    borderRadius: "6px",
                    padding: "0.75rem",
                    marginBottom: "1rem",
                    fontSize: "14px",
                  }}
                >
                  {error}
                </div>
              )}

              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#2c3e50",
                  }}
                >
                  Nama Paket *
                </label>
                <input
                  type="text"
                  name="namaPaket"
                  value={formData.namaPaket}
                  onChange={handleInputChange}
                  placeholder="Contoh: Premium 6 Bulan"
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #e9ecef",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontFamily: "'Poppins', sans-serif",
                    boxSizing: "border-box", // Tambahan untuk konsistensi
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#2c3e50",
                  }}
                >
                  Harga (Rupiah) *
                </label>
                <input
                  type="number"
                  name="harga"
                  value={formData.harga}
                  onChange={handleInputChange}
                  placeholder="500000"
                  min="0"
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #e9ecef",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontFamily: "'Poppins', sans-serif",
                    boxSizing: "border-box", // Tambahan untuk konsistensi
                  }}
                  required
                />
              </div>

             {/* Tampilkan masa berlaku untuk create mode */}
              {modalMode === "create" && (
                <div style={{ marginBottom: "1rem" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#2c3e50",
                    }}
                  >
                    Masa Berlaku (Bulan) *
                  </label>
                  <input
                    type="number"
                    name="masaBerlaku"
                    value={formData.masaBerlaku}
                    onChange={handleInputChange}
                    placeholder="Contoh: 6 (untuk 6 bulan)"
                    min="1"
                    max="60"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #e9ecef",
                      borderRadius: "6px",
                      fontSize: "14px",
                      fontFamily: "'Poppins', sans-serif",
                      boxSizing: "border-box",
                    }}
                    required
                  />
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#6c757d",
                      marginTop: "0.25rem",
                    }}
                  >
                    Masukkan angka dalam bulan (misal: 3 = 3 bulan, 12 = 12 bulan)
                  </div>
                </div>
              )}

              {/* Tampilkan masa berlaku untuk edit mode (read-only) */}
              {modalMode === "edit" && selectedPaket && (
                <div style={{ marginBottom: "1rem" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#2c3e50",
                    }}
                  >
                    Masa Berlaku
                  </label>
                  <div
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      backgroundColor: "#f8f9fa",
                      border: "1px solid #e9ecef",
                      borderRadius: "6px",
                      fontSize: "14px",
                      color: "#6c757d",
                      boxSizing: "border-box",
                    }}
                  >
                    {selectedPaket.masaBerlaku} bulan (tidak dapat diubah)
                  </div>
                </div>
              )}

              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#2c3e50",
                  }}
                >
                  Fasilitas *
                </label>
                <input
                  type="text"
                  name="fasilitas"
                  value={formData.fasilitas}
                  onChange={handleInputChange}
                  placeholder="listening,structure,reading,konsultasi,simulasi"
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #e9ecef",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontFamily: "'Poppins', sans-serif",
                    boxSizing: "border-box", // Tambahan untuk konsistensi
                  }}
                  required
                />

                {/* Format Help */}
                <div
                  style={{
                    marginTop: "0.5rem",
                    padding: "0.75rem",
                    backgroundColor: "#f8f9fa",
                    border: "1px solid #e9ecef",
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}
                >
                  <div
                    style={{
                      fontWeight: "600",
                      color: "#2c3e50",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Format Wajib (pisahkan dengan koma):
                  </div>
                  <div style={{ color: "#6c757d", marginBottom: "0.5rem" }}>
                    <strong>Keyword yang valid:</strong>{" "}
                    {validFasilitasKeywords.join(", ")}
                  </div>
                  <div style={{ color: "#6c757d", marginBottom: "0.5rem" }}>
                    <strong>Contoh yang BENAR:</strong> "listening,konsultasi"
                    atau "listening,structure,reading"
                  </div>
                  <div style={{ color: "#dc3545" }}>
                    <strong>Contoh yang SALAH:</strong> "modul listening" atau
                    "akses konsultasi tersedia"
                  </div>
                </div>
              </div>
              {/* Debug Info - HAPUS SETELAH TESTING */}
              {modalMode === "edit" && (
                <div
                  style={{
                    backgroundColor: "#f0f0f0",
                    padding: "0.5rem",
                    borderRadius: "4px",
                    fontSize: "12px",
                    marginBottom: "1rem",
                    border: "1px solid #ddd",
                  }}
                >
                  <strong>Debug Info:</strong>
                  <br />{" "}
                </div>
              )}

              {/* Form Actions */}
              <div
                style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}
              >
                <button
                  type="button"
                  onClick={closeModal}
                  style={{
                    flex: 1,
                    backgroundColor: "white",
                    color: "#6c757d",
                    border: "1px solid #e9ecef",
                    padding: "0.75rem 1rem",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontWeight: "500",
                    cursor: "pointer",
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={
                    submitting || (modalMode === "edit" && !formData.namaPaket)
                  }
                  style={{
                    flex: 2,
                    backgroundColor:
                      !submitting &&
                      (modalMode === "create" || formData.namaPaket)
                        ? "#D4A574"
                        : "#e9ecef",
                    color:
                      !submitting &&
                      (modalMode === "create" || formData.namaPaket)
                        ? "white"
                        : "#6c757d",
                    border: "none",
                    padding: "0.75rem 1rem",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor:
                      !submitting &&
                      (modalMode === "create" || formData.namaPaket)
                        ? "pointer"
                        : "not-allowed",
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  {submitting
                    ? "Menyimpan..."
                    : modalMode === "create"
                    ? "Tambah Paket"
                    : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default KelolaPaketKursus;

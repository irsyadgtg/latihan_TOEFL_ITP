import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDashboardLayoutContext } from "../../layouts/DashboardLayout";
import axiosInstance from "../../services/axios";
import axios, { AxiosError } from "axios";

export default function PageViewer({
  page,
  onPrev,
  onNext,
  pageList,
  onJump,
  extraMenu,
  showQuiz,
  currentPageId,
  onPageSelect,
  onQuizSelect,
  modul,
  unit,
  hasQuestions,
}) {
  const { setTitle, setSubtitle } = useDashboardLayoutContext();
  const navigate = useNavigate();

  const role = localStorage.getItem("role");
  const token = localStorage.getItem("AuthToken");
  const userId = localStorage.getItem("user_id");

  const [isCompleted, setIsCompleted] = useState(false);
  const [canAccess, setCanAccess] = useState(true);
  const [nextRequired, setNextRequired] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progressData, setProgressData] = useState({});

  // DEBUG: Log props untuk debugging
  useEffect(() => {
    console.log("PageViewer: Props received:", {
      modul,
      unit,
      hasQuestions,
      role,
      pageListLength: pageList?.length || 0,
      currentPageId,
      onQuizSelectExists: !!onQuizSelect,
    });
  }, [modul, unit, hasQuestions, role, pageList, currentPageId, onQuizSelect]);

  const canAccessPage = (pageId, pages, completedPageIds) => {
    if (role !== "peserta") return true;

    const pageIndex = pages.findIndex((p) => p.id === pageId);
    if (pageIndex === -1) return false;

    for (let i = 0; i < pageIndex; i++) {
      if (!completedPageIds.includes(pages[i].id)) {
        return false;
      }
    }
    return true;
  };

  const getNextRequiredPage = (pages, completedPageIds) => {
    const firstIncomplete = pages.find((p) => !completedPageIds.includes(p.id));
    return firstIncomplete
      ? {
          id: firstIncomplete.id,
          title: firstIncomplete.title,
          order_number: firstIncomplete.order_number,
        }
      : null;
  };

  const checkPageStatus = async (pageId) => {
    if (!pageId || role !== "peserta") return;

    try {
      console.log("PageViewer: checkPageStatus called for page", pageId);

      const progressRes = await axiosInstance.get(
        `/progress/unit?modul=${modul}&unit_number=${unit}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const progressData = progressRes.data;
      console.log("PageViewer: Progress data received:", progressData);

      const completedPageIds = progressData.completed_pages || [];

      const pageCanAccess = canAccessPage(pageId, pageList, completedPageIds);
      const pageIsCompleted = completedPageIds.includes(pageId);
      const nextRequiredPage = pageCanAccess
        ? null
        : getNextRequiredPage(pageList, completedPageIds);

      console.log("PageViewer: Access check results:", {
        pageId,
        pageCanAccess,
        pageIsCompleted,
        completedPageIds,
        nextRequiredPage,
        pageListCount: pageList.length,
        currentPageTitle:
          pageList.find((p) => p.id === pageId)?.title || "Unknown",
      });

      setCanAccess(pageCanAccess);
      setProgressData(progressData);
      setNextRequired(nextRequiredPage);

      if (pageIsCompleted) {
        console.log("PageViewer: Page already completed");
        setIsCompleted(true);
      } else {
        console.log("PageViewer: Page not completed");
        setIsCompleted(false);
      }

      if (!pageCanAccess && nextRequiredPage) {
        console.log(
          "PageViewer: Access denied, next required page:",
          nextRequiredPage
        );
      }
    } catch (error) {
      console.error("PageViewer: Failed to check page status:", error);

      if (axios.isAxiosError(error) && error.response?.status === 401) {
        localStorage.removeItem("AuthToken");
        localStorage.removeItem("role");
        navigate("/login");
        return;
      }

      setProgressData({
        completed_pages: [],
        can_access_quiz: false,
        next_required_page: null,
      });
    }
  };

  useEffect(() => {
    if (page && role === "peserta") {
      checkPageStatus(page.id);
    }
  }, [page?.id, role]);

  const handleMarkComplete = async () => {
    if (!page || loading) return;

    setLoading(true);
    try {
      console.log("PageViewer: Marking page complete:", page.id);

      const response = await axiosInstance.post(
        `/pages/${page.id}/complete`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("PageViewer: Mark complete response:", response.data);

      setIsCompleted(true);

      setTimeout(async () => {
        await checkPageStatus(page.id);
      }, 300);
    } catch (error) {
      console.error("PageViewer: Failed to mark page complete:", error);

      if (axios.isAxiosError(error) && error.response?.status === 401) {
        localStorage.removeItem("AuthToken");
        localStorage.removeItem("role");
        navigate("/login");
        return;
      }

      alert(
        "Gagal menandai halaman selesai: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    console.log("PageViewer: handleNext called", {
      role,
      pageId: page?.id,
      isCompleted,
    });

    if (role === "peserta" && page && !isCompleted) {
      try {
        setLoading(true);
        console.log("PageViewer: Auto-completing page without confirmation");

        const response = await axiosInstance.post(
          `/pages/${page.id}/complete`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log("PageViewer: Auto-complete response:", response.data);

        const freshProgressRes = await axiosInstance.get(
          `/progress/unit?modul=${modul}&unit_number=${unit}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const freshProgressData = freshProgressRes.data;
        console.log(
          "PageViewer: Fresh progress data after complete:",
          freshProgressData
        );

        setIsCompleted(true);
        setProgressData(freshProgressData);

        if (onNext) {
          console.log("PageViewer: Calling onNext with fresh progress data");
          onNext(freshProgressData);
        }
      } catch (error) {
        console.error("PageViewer: Failed to auto-complete page:", error);

        if (axios.isAxiosError(error) && error.response?.status === 401) {
          localStorage.removeItem("AuthToken");
          localStorage.removeItem("role");
          navigate("/login");
          return;
        }

        alert(
          "Gagal menyelesaikan halaman: " +
            (error.response?.data?.message || error.message)
        );
      } finally {
        setLoading(false);
      }
      return;
    }

    // SISANYA TETAP SAMA seperti kode asli
    if (role === "peserta" && page && isCompleted) {
      try {
        console.log(
          "PageViewer: Fetching fresh progress for completed page navigation"
        );

        const freshProgressRes = await axiosInstance.get(
          `/progress/unit?modul=${modul}&unit_number=${unit}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const freshProgressData = freshProgressRes.data;
        console.log(
          "PageViewer: Fresh progress data for navigation:",
          freshProgressData
        );

        setProgressData(freshProgressData);

        if (onNext) {
          console.log(
            "PageViewer: Calling onNext with fresh progress data (completed page)"
          );
          onNext(freshProgressData);
        }
      } catch (error) {
        console.error("PageViewer: Failed to fetch fresh progress:", error);
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          localStorage.removeItem("AuthToken");
          localStorage.removeItem("role");
          navigate("/login");
          return;
        }

        if (onNext) onNext();
      }
    } else {
      console.log("PageViewer: Normal next flow (instructor)");
      if (onNext) onNext();
    }

    if (role === "peserta" && page && isCompleted) {
      try {
        console.log(
          "PageViewer: Fetching fresh progress for completed page navigation"
        );

        const freshProgressRes = await axiosInstance.get(
          `/progress/unit?modul=${modul}&unit_number=${unit}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const freshProgressData = freshProgressRes.data;
        console.log(
          "PageViewer: Fresh progress data for navigation:",
          freshProgressData
        );

        setProgressData(freshProgressData);

        if (onNext) {
          console.log(
            "PageViewer: Calling onNext with fresh progress data (completed page)"
          );
          onNext(freshProgressData);
        }
      } catch (error) {
        console.error("PageViewer: Failed to fetch fresh progress:", error);
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          localStorage.removeItem("AuthToken");
          localStorage.removeItem("role");
          navigate("/login");
          return;
        }

        if (onNext) onNext();
      }
    } else {
      console.log("PageViewer: Normal next flow (instructor)");
      if (onNext) onNext();
    }
  };

  const renderAttachment = (attachment) => {
    if (!attachment) return null;

    const attachmentUrl = attachment.startsWith("http")
      ? attachment
      : attachment.startsWith("/storage/")
      ? `http://localhost:8000${attachment}`
      : `http://localhost:8000/storage/${attachment}`;

    const isImage = attachment.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i);
    const isAudio = attachment.match(/\.(mp3|wav|ogg|m4a|aac)$/i);
    const isVideo = attachment.match(/\.(mp4|webm|avi|mov|wmv)$/i);
    const isPDF = attachment.match(/\.pdf$/i);
    const isDoc = attachment.match(/\.(doc|docx|ppt|pptx|xls|xlsx)$/i);

    if (isImage) {
      return (
        <img
          src={attachmentUrl}
          style={{
            maxWidth: "100%",
            maxHeight: "400px",
            height: "auto",
            borderRadius: "4px",
            border: "1px solid #ddd",
            objectFit: "contain",
          }}
          alt="Page attachment"
          onError={(e) => {
            console.error("Image failed to load:", attachmentUrl);
            e.target.style.display = "none";
            e.target.parentNode.innerHTML +=
              '<p style="color: #dc3545;">Gagal memuat gambar</p>';
          }}
        />
      );
    }

    if (isAudio) {
      return (
        <audio
          src={attachmentUrl}
          controls
          style={{
            width: "100%",
            maxWidth: "500px",
          }}
          onError={(e) => {
            console.error("Audio failed to load:", attachmentUrl);
            e.target.parentNode.innerHTML +=
              '<p style="color: #dc3545;">Gagal memuat audio</p>';
          }}
        >
          Browser Anda tidak mendukung audio player.
        </audio>
      );
    }

    if (isVideo) {
      return (
        <video
          src={attachmentUrl}
          controls
          style={{
            maxWidth: "100%",
            maxHeight: "400px",
            borderRadius: "4px",
          }}
          onError={(e) => {
            console.error("Video failed to load:", attachmentUrl);
            e.target.parentNode.innerHTML +=
              '<p style="color: #dc3545;">Gagal memuat video</p>';
          }}
        >
          Browser Anda tidak mendukung video player.
        </video>
      );
    }

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "1rem",
          backgroundColor: "#f8f9fa",
          border: "1px solid #dee2e6",
          borderRadius: "4px",
        }}
      >
        <div
          style={{
            fontSize: "2rem",
            color: "#6c757d",
          }}
        >
          {isPDF ? "📄" : isDoc ? "📄" : "📎"}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: "600", marginBottom: "0.25rem" }}>
            Lampiran: {attachment.split("/").pop() || "File"}
          </div>
          <a
            href={attachmentUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "#B6252A",
              textDecoration: "none",
              fontSize: "0.9rem",
            }}
            onMouseEnter={(e) => (e.target.style.textDecoration = "underline")}
            onMouseLeave={(e) => (e.target.style.textDecoration = "none")}
          >
            Download / Buka File
          </a>
        </div>
      </div>
    );
  };

  // SHOW QUIZ BUTTON LOGIC - PERBAIKAN UTAMA
  const shouldShowQuizButton = () => {
    console.log("PageViewer: shouldShowQuizButton check:", {
      unit,
      role,
      hasQuestions,
      onQuizSelectExists: !!onQuizSelect,
      unitIsNotZero: unit > 0,
    });

    // Unit 0 tidak ada quiz
    if (unit === 0) {
      console.log("PageViewer: Unit 0 - no quiz button");
      return false;
    }

    // Instructor bisa akses semua quiz
    if (role === "instruktur") {
      console.log("PageViewer: Instructor - show quiz button");
      return true;
    }

    // Peserta hanya bisa akses jika ada soal
    if (role === "peserta" && hasQuestions) {
      console.log("PageViewer: Student with questions - show quiz button");
      return true;
    }

    console.log("PageViewer: No quiz button shown");
    return false;
  };

  if (!page && !showQuiz) {
    return (
      <div
        style={{
          display: "flex",
          gap: "1rem",
          height: "100%",
          width: "100%",
        }}
      >
        {/* SIDEBAR - DENGAN QUIZ BUTTON */}
        <div
          style={{
            width: "90px",
            backgroundColor: "#f8f9fa",
            border: "1px solid #dee2e6",
            borderRadius: "4px",
            padding: "0.75rem",
            height: "fit-content",
          }}
        >
          <h4
            style={{
              margin: "0 0 0.75rem 0",
              color: "#495057",
              fontSize: "0.8rem",
            }}
          >
            Halaman
          </h4>
          <div
            style={{
              marginBottom: "0.5rem",
              height: "1px",
              backgroundColor: "#dee2e6",
            }}
          ></div>
          <div
            style={{
              color: "#6c757d",
              fontSize: "0.8rem",
              fontStyle: "italic",
              textAlign: "center",
            }}
          >
            Tidak ada halaman
          </div>

          {/* QUIZ BUTTON - TETAP TAMPIL MESKI TIDAK ADA HALAMAN */}
          {shouldShowQuizButton() && (
            <>
              <div
                style={{
                  margin: "0.5rem 0",
                  height: "1px",
                  backgroundColor: "#dee2e6",
                }}
              ></div>
              <button
                onClick={() => onQuizSelect && onQuizSelect()}
                disabled={role === "peserta" && !progressData.can_access_quiz}
                style={{
                  backgroundColor: showQuiz
                    ? "#B6252A"
                    : role === "peserta" && !progressData.can_access_quiz
                    ? "#dc3545"
                    : "#6c757d",
                  color: "white",
                  border: "none",
                  padding: "0.5rem",
                  borderRadius: "3px",
                  cursor:
                    role === "peserta" && !progressData.can_access_quiz
                      ? "not-allowed"
                      : "pointer",
                  textAlign: "center",
                  fontSize: "0.8rem",
                  fontWeight: "600",
                  width: "100%",
                }}
                title={
                  role === "peserta" && !progressData.can_access_quiz
                    ? "Selesaikan semua halaman terlebih dahulu"
                    : `Latihan Unit ${unit}`
                }
              >
                Latihan
              </button>
            </>
          )}
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f8f9fa",
            border: "1px solid #dee2e6",
            borderRadius: "4px",
            color: "#6c757d",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <h3 style={{ margin: "0 0 1rem 0" }}>Tidak ada halaman</h3>
            <p style={{ margin: "0" }}>
              Silakan pilih unit atau tambah halaman baru.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (showQuiz) {
    return null;
  }

  return (
    <div
      style={{
        display: "flex",
        gap: "1rem",
        height: "100%",
        width: "100%",
      }}
    >
      {/* SIDEBAR WITH PAGES AND QUIZ BUTTON */}
      <div
        style={{
          width: "90px",
          backgroundColor: "#f8f9fa",
          border: "1px solid #dee2e6",
          borderRadius: "4px",
          padding: "0.75rem",
          height: "fit-content",
        }}
      >
        <h4
          style={{
            margin: "0 0 0.75rem 0",
            color: "#495057",
            fontSize: "0.8rem",
          }}
        >
          Halaman
        </h4>
        <div
          style={{
            marginBottom: "0.5rem",
            height: "1px",
            backgroundColor: "#dee2e6",
          }}
        ></div>

        {/* PAGE BUTTONS */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.25rem",
          }}
        >
          {pageList && pageList.length > 0 ? (
            pageList.map((p, index) => {
              const pageCompleted =
                role === "peserta"
                  ? progressData.completed_pages?.includes(p.id)
                  : true;

              return (
                <button
                  key={p.id}
                  onClick={() => onPageSelect && onPageSelect(p)}
                  disabled={
                    role === "peserta" && !canAccess && currentPageId !== p.id
                  }
                  style={{
                    backgroundColor:
                      currentPageId === p.id
                        ? "#B6252A"
                        : pageCompleted
                        ? "#28a745"
                        : "#e9ecef",
                    color:
                      currentPageId === p.id || pageCompleted
                        ? "white"
                        : "#495057",
                    border: "none",
                    padding: "0.5rem",
                    borderRadius: "3px",
                    cursor: "pointer",
                    textAlign: "center",
                    fontSize: "0.8rem",
                    fontWeight: "600",
                    minWidth: "32px",
                  }}
                  title={p.title}
                >
                  {index + 1}
                </button>
              );
            })
          ) : (
            <div
              style={{
                color: "#6c757d",
                fontSize: "0.8rem",
                fontStyle: "italic",
                textAlign: "center",
              }}
            >
              Kosong
            </div>
          )}

          {/* QUIZ BUTTON - PERBAIKAN UTAMA */}
          {shouldShowQuizButton() && (
            <>
              <div
                style={{
                  margin: "0.5rem 0",
                  height: "1px",
                  backgroundColor: "#dee2e6",
                }}
              ></div>
              <button
                onClick={() => {
                  console.log("PageViewer: Quiz button clicked");
                  onQuizSelect && onQuizSelect();
                }}
                disabled={role === "peserta" && !progressData.can_access_quiz}
                style={{
                  backgroundColor: showQuiz
                    ? "#B6252A"
                    : role === "peserta" && !progressData.can_access_quiz
                    ? "#dc3545"
                    : "#6c757d",
                  color: "white",
                  border: "none",
                  padding: "0.5rem",
                  borderRadius: "3px",
                  cursor:
                    role === "peserta" && !progressData.can_access_quiz
                      ? "not-allowed"
                      : "pointer",
                  textAlign: "center",
                  fontSize: "0.8rem",
                  fontWeight: "600",
                  width: "100%",
                }}
                title={
                  role === "peserta" && !progressData.can_access_quiz
                    ? "Selesaikan semua halaman terlebih dahulu"
                    : `Latihan Unit ${unit}`
                }
              >
                Latihan
              </button>
            </>
          )}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div
        style={{
          flex: 1,
          backgroundColor: "white",
          border: "1px solid #dee2e6",
          borderRadius: "4px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        {/* FIXED HEADER */}
        <div
          style={{
            backgroundColor: "#f8f9fa",
            padding: "0.75rem",
            borderBottom: "1px solid #dee2e6",
            flexShrink: 0,
          }}
        >
          {role === "peserta" && !canAccess && nextRequired && (
            <div
              style={{
                backgroundColor: "#fff3cd",
                border: "1px solid #ffeaa7",
                padding: "0.75rem",
                marginBottom: "0.75rem",
                borderRadius: "4px",
                textAlign: "center",
              }}
            >
              <strong>Pembelajaran Berurutan Diperlukan</strong>
              <div style={{ marginTop: "0.5rem", fontSize: "0.9rem" }}>
                Anda harus menyelesaikan "{nextRequired.title}" terlebih dahulu
                sebelum mengakses halaman ini.
              </div>
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h3
              style={{
                margin: "0",
                color: "#495057",
                fontSize: "1.1rem",
              }}
            >
              {page.title}
              {role === "peserta" && isCompleted && (
                <span
                  style={{
                    marginLeft: "0.5rem",
                    color: "#28a745",
                    fontSize: "0.9rem",
                  }}
                >
                  ✓ Selesai
                </span>
              )}
            </h3>

            <div
              style={{
                fontSize: "0.8rem",
                color: "#6c757d",
              }}
            >
              Halaman {pageList.findIndex((p) => p.id === page.id) + 1} dari{" "}
              {pageList.length}
            </div>
          </div>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "1rem",
          }}
        >
          {page.attachment && (
            <div style={{ marginBottom: "1rem" }}>
              <div
                style={{
                  border: "1px solid #dee2e6",
                  borderRadius: "4px",
                  padding: "1rem",
                  backgroundColor: "#f8f9fa",
                }}
              >
                {renderAttachment(page.attachment)}
              </div>
            </div>
          )}

          {page.description && (
            <div style={{ marginBottom: "1rem" }}>
              <div
                style={{
                  backgroundColor: "#f8f9fa",
                  padding: "1rem",
                  borderRadius: "4px",
                  border: "1px solid #dee2e6",
                  lineHeight: "1.6",
                  whiteSpace: "pre-wrap",
                }}
              >
                {page.description}
              </div>
            </div>
          )}

          {role === "peserta" && canAccess && (
            <div
              style={{
                backgroundColor: "#f8f9fa",
                border: "1px solid #dee2e6",
                borderRadius: "4px",
                padding: "1rem",
                marginTop: "1rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "1rem",
                }}
              >
                <div style={{ fontSize: "0.9rem", color: "#6c757d" }}>
                  {isCompleted
                    ? "Anda telah menyelesaikan halaman ini"
                    : "Anda dapat menandai halaman ini selesai kapan saja"}
                </div>

                {!isCompleted && (
                  <button
                    onClick={handleMarkComplete}
                    disabled={loading}
                    style={{
                      backgroundColor: "#28a745",
                      color: "white",
                      border: "none",
                      padding: "0.5rem 1rem",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                      fontWeight: "600",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {loading ? "Menandai..." : "Tandai Selesai"}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* FIXED FOOTER */}
        <div
          style={{
            padding: "0.75rem 1rem",
            borderTop: "1px solid #dee2e6",
            backgroundColor: "#f8f9fa",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <button
              onClick={onPrev}
              disabled={!onPrev}
              style={{
                backgroundColor: onPrev ? "#B6252A" : "#6c757d",
                color: "white",
                border: "none",
                padding: "0.5rem 1rem",
                borderRadius: "4px",
                cursor: onPrev ? "pointer" : "not-allowed",
                fontSize: "0.9rem",
              }}
            >
              ← Sebelumnya
            </button>

            <button
              onClick={handleNext}
              disabled={!onNext || (role === "peserta" && !canAccess)}
              style={{
                backgroundColor:
                  onNext && (role !== "peserta" || canAccess)
                    ? "#B6252A"
                    : "#6c757d",
                color: "white",
                border: "none",
                padding: "0.5rem 1rem",
                borderRadius: "4px",
                cursor:
                  onNext && (role !== "peserta" || canAccess)
                    ? "pointer"
                    : "not-allowed",
                fontSize: "0.9rem",
              }}
            >
              Selanjutnya →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

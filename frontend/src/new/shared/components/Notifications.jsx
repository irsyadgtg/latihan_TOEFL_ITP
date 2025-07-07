import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import api from "../../../services/api";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem("AuthToken");
  const role = localStorage.getItem("role");

  const fetchNotifications = async (page = 1, filterType = "all") => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: "15",
      });

      if (filterType !== "all") {
        params.append("filter", filterType);
      }

      const response = await api.get(`/notifications?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications(response.data.data);
      setCurrentPage(response.data.current_page);
      setTotalPages(response.data.last_page);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setError("Gagal memuat notifikasi. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    setError(null);
    setSuccessMessage(null);

    try {
      await api.post(
        `/notifications/${notificationId}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update local state
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId
            ? { ...notif, read_at: new Date().toISOString() }
            : notif
        )
      );

      setSuccessMessage("Notifikasi berhasil ditandai terbaca.");
    } catch (error) {
      console.error("Error marking notification as read:", error);
      setError("Gagal menandai notifikasi terbaca.");
    }
  };

  const deleteNotification = async (notificationId) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus notifikasi ini?"))
      return;

    setError(null);
    setSuccessMessage(null);

    try {
      await api.delete(`/notifications/${notificationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Remove from local state
      setNotifications((prev) =>
        prev.filter((notif) => notif.id !== notificationId)
      );

      setSuccessMessage("Notifikasi berhasil dihapus.");
    } catch (error) {
      console.error("Error deleting notification:", error);
      setError("Gagal menghapus notifikasi.");
    }
  };

  // Handle notification click with navigation
  const handleNotificationClick = async (notification) => {
    // Mark as read if unread
    if (!notification.read_at) {
      await markAsRead(notification.id);
    }

    // Navigate hanya untuk konsultasi
    if (notification.type === "consultation") {
      const metadata = notification.metadata || {};
      const action = metadata.action;

      // URL-based role detection
      const getCurrentRole = () => {
        const pathname = window.location.pathname;
        if (pathname.includes("/student/")) return "peserta";
        if (pathname.includes("/instructor/")) return "instruktur";
        if (pathname.includes("/admin/")) return "admin";
        return localStorage.getItem("role");
      };

      const currentRole = getCurrentRole();
      const getBasePath = () => {
        return currentRole === "instruktur" ? "/instructor" : "/student";
      };

      console.log("Notification clicked:", {
        action,
        currentRole,
        metadata,
        basePath: getBasePath(),
      });

      switch (action) {
        case "new_consultation":
        case "restart_consultation":
        case "student_message":
          if (currentRole === "instruktur" && metadata.student_id) {
            navigate(
              `${getBasePath()}/konsultasi/student/${metadata.student_id}`
            );
          } else if (currentRole === "instruktur") {
            navigate(`${getBasePath()}/konsultasi`);
          }
          break;

        case "instructor_reply":
        case "instructor_responded":
          if (currentRole === "peserta" && metadata.instructor_id) {
            navigate(`${getBasePath()}/konsultasi/${metadata.instructor_id}`);
          } else if (currentRole === "peserta") {
            navigate(`${getBasePath()}/konsultasi`);
          }
          break;

        case "session_ended":
          if (currentRole === "instruktur" && metadata.student_id) {
            navigate(
              `${getBasePath()}/konsultasi/student/${metadata.student_id}`
            );
          } else if (currentRole === "peserta" && metadata.instructor_id) {
            navigate(`${getBasePath()}/konsultasi/${metadata.instructor_id}`);
          } else {
            navigate(`${getBasePath()}/konsultasi`);
          }
          break;

        case "instructor_available":
          navigate(`${getBasePath()}/konsultasi`);
          break;

        default:
          console.log("Unknown action:", action);
          navigate(`${getBasePath()}/konsultasi`);
      }
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1);
    fetchNotifications(1, newFilter);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchNotifications(page, filter);
  };

  const formatNotificationTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch (e) {
      console.error("Failed to format date:", timestamp, e);
      return timestamp;
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="mt-4">
      {/* Filter Buttons - Style seperti Admin */}
      <div className="flex gap-2 mb-6">
        {[
          { label: "Semua", value: "all" },
          { label: "Baca", value: "read" },
          { label: "Belum Terbaca", value: "unread" },
        ].map((statusOption) => (
          <button
            key={statusOption.value}
            onClick={() => handleFilterChange(statusOption.value)}
            className={`px-4 py-2 rounded-full border text-sm font-medium ${
              filter === statusOption.value
                ? "bg-blue-600 text-white"
                : "bg-white border-blue-600 text-black"
            }`}
          >
            {statusOption.label}
          </button>
        ))}
      </div>

      {/* Display Loading, Error, or Success Message */}
      {loading && (
        <div className="text-gray-600 text-center py-4">
          Memuat notifikasi...
        </div>
      )}
      
      {error && (
        <div className="text-red-500 text-center py-4">
          {error}
          <button
            onClick={() => fetchNotifications()}
            className="mt-2 ml-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
          >
            Coba Lagi
          </button>
        </div>
      )}
      
      {successMessage && (
        <div className="text-green-600 text-center py-4">{successMessage}</div>
      )}

      {/* Notification List - Style seperti Admin */}
      {!loading && !error && (
        <div className="space-y-4">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className="border border-gray-300 rounded-xl p-4 flex items-center justify-between bg-white cursor-pointer hover:bg-gray-50"
              >
                <div className="flex items-center gap-3 flex-1">
                  <Bell className="text-red-600 w-6 h-6 flex-shrink-0" />
                  <div className="flex-1 flex justify-between items-center">
                    <div className="flex-1 pr-4">
                      <p className="text-[16px] font-medium text-black">
                        {notification.title}
                      </p>
                      <p className="text-[14px] text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      {notification.metadata && notification.metadata.action && (
                        <p className="text-[12px] text-gray-400 mt-1">
                          Action: {notification.metadata.action}
                        </p>
                      )}
                    </div>
                    <div className="text-gray-600 text-right flex-shrink-0">
                      <div className="text-[14px] mb-1">
                        {notification.read_at ? "Baca" : "Belum Terbaca"}
                      </div>
                      <div className="font-semibold text-[14px]">
                        {formatNotificationTime(notification.created_at)}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons - SELALU TAMPIL DUA TOMBOL */}
                <div className="flex gap-2 ml-4 flex-shrink-0">
                  {!notification.read_at ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notification.id);
                      }}
                      className="bg-blue-500 hover:bg-blue-600 duration-200 text-white text-sm px-4 py-3 rounded-full font-semibold whitespace-nowrap"
                    >
                      Tandai Terbaca
                    </button>
                  ) : (
                    <div className="w-[140px]"></div>
                  )}
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                    className="bg-red-500 hover:bg-red-600 duration-200 text-white text-sm px-4 py-3 rounded-full font-semibold whitespace-nowrap"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-gray-500 text-center py-8">
              {filter === "all" && "Tidak ada notifikasi yang ditemukan."}
              {filter === "unread" && "Tidak ada notifikasi belum terbaca."}
              {filter === "read" && "Tidak ada notifikasi terbaca."}
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-4 py-2 border rounded-lg text-sm ${
              currentPage === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Sebelumnya
          </button>

          <span className="px-4 py-2 text-sm text-gray-600">
            Halaman {currentPage} dari {totalPages}
          </span>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 border rounded-lg text-sm ${
              currentPage === totalPages
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Selanjutnya
          </button>
        </div>
      )}
    </div>
  );
}
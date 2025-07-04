import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useDashboardLayoutContext } from '../../layouts/DashboardLayout'; // Import useDashboardLayoutContext
import axiosInstance from "../../services/axios";
import { useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios"; 

// Definisikan interface untuk struktur data notifikasi dari API
// SEKARANG 100% SESUAI DENGAN RESPON API YANG ANDA BERIKAN
interface NotificationData {
  idNotifikasi: number; // Nama properti ID yang benar dari backend
  pesan: string; // Konten pesan notifikasi
  sudahDibaca: 0 | 1; // Tipe 0 atau 1 (number)
  tglDibuat: string; // Tanggal dibuat (timestamp)
  jenisNotifikasi: string; // Tambahan properti yang ada di respons
  sumberId: string; // Tambahan properti yang ada di respons
  sumberTipe: string; // Tambahan properti yang ada di respons
}

export default function Notifikasi() {
  // Destrukturisasi refreshUnreadNotifications dari context
  const { setTitle, setSubtitle } = useDashboardLayoutContext(); 
  const navigate = useNavigate();

  const [filter, setFilter] = useState<"Semua" | "BACA" | "BELUM TERBACA">("Semua");
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setTitle("Notifikasi");
    setSubtitle("Lihat semua notifikasi dan pesan Anda.");

    fetchNotifications();
  }, [setTitle, setSubtitle, filter, navigate]);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    let url = '/admin/notifikasi';
    let statusParam = '';

    if (filter === "BACA") {
      statusParam = 'BACA';
    } else if (filter === "BELUM TERBACA") {
      statusParam = 'BELUM TERBACA';
    } else if (filter === "Semua") {
      statusParam = 'SEMUA';
    }

    if (statusParam && statusParam !== 'SEMUA') {
      url += `?status=${encodeURIComponent(statusParam)}`;
    }

    try {
      const response = await axiosInstance.get<NotificationData[]>(url);
      
      setNotifications(response.data || []); 

      // DEBUGGING: Untuk verifikasi (bisa dihapus setelah yakin)
      console.log("Raw API Response for Notifications (response.data):", response.data); 
      console.log("Processed Notifications Data (set to state):", response.data || []);

    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      if (axios.isAxiosError(err)) { 
        if (err.response) {
          if (err.response.status === 401 && (err.response.data as any)?.message === 'Unauthenticated.') {
            setError("Sesi Anda telah berakhir. Silakan login kembali.");
            localStorage.removeItem('AuthToken');
            navigate('/admin/login');
          } else if (err.response.data && typeof err.response.data === 'object' && 'message' in err.response.data) {
            setError(err.response.data.message as string);
          } else {
            setError(`Terjadi kesalahan: ${err.response.status} ${err.response.statusText || 'Error'}`);
          }
        } else if (err.request) {
          setError("Tidak dapat terhubung ke server. Pastikan koneksi internet Anda aktif atau server sedang berjalan.");
        } else {
          setError("Terjadi kesalahan saat mengatur permintaan. Silakan coba lagi.");
        }
      } else {
        setError("Terjadi kesalahan tidak terduga.");
      }
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => { 
    // DEBUGGING: Untuk memastikan ID yang dikirim
    console.log("Mencoba menandai notifikasi terbaca dengan ID:", id); 

    setError(null);
    setSuccessMessage(null);
    try {
      // Panggil endpoint POST untuk menandai terbaca
      await axiosInstance.post(`/admin/notifikasi/tandai/${id}`); 

      fetchNotifications(); // Panggil ulang untuk memuat data terbaru sesuai filter
      setSuccessMessage("Notifikasi berhasil ditandai terbaca.");
      

    } catch (err) {
      console.error("Failed to mark notification as read:", err);
      if (axios.isAxiosError(err)) { 
        if (err.response) {
          if (err.response.status === 401 && (err.response.data as any)?.message === 'Unauthenticated.') {
            setError("Sesi Anda telah berakhir. Silakan login kembali.");
            localStorage.removeItem('AuthToken');
            navigate('/admin/login');
          } else if (err.response.data && typeof err.response.data === 'object' && 'message' in err.response.data) {
            setError(err.response.data.message as string);
          } else {
            setError(`Gagal menandai notifikasi terbaca: ${err.response.status} ${err.response.statusText || 'Error'}`);
          }
        } else if (err.request) {
          setError("Tidak dapat terhubung ke server. Periksa koneksi Anda.");
        } else {
          setError("Terjadi kesalahan tak terduga.");
        }
      } else {
        setError("Gagal menandai notifikasi terbaca.");
      }
    }
  };

  const formatNotificationTime = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    } catch (e) {
      console.error("Failed to format date:", dateString, e);
      return dateString;
    }
  };

  return (
    <div className="mt-4">
      {/* Filter Buttons */}
      <div className="flex gap-2 mb-6">
        {[
          { label: "Semua", value: "Semua" },
          { label: "Baca", value: "BACA" },
          { label: "Belum Terbaca", value: "BELUM TERBACA" } 
        ].map((statusOption) => (
          <button
            key={statusOption.value}
            onClick={() => setFilter(statusOption.value as "Semua" | "BACA" | "BELUM TERBACA")}
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
      {loading && <div className="text-gray-600 text-center py-4">Memuat notifikasi...</div>}
      {error && (
        <div className="text-red-500 text-center py-4">
          {error}
          <button
            onClick={fetchNotifications}
            className="mt-2 ml-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
          >
            Coba Lagi
          </button>
        </div>
      )}
      {successMessage && (
        <div className="text-green-600 text-center py-4">
          {successMessage}
        </div>
      )}

      {/* Notification List */}
      {!loading && !error && (
        <div className="space-y-4">
          {notifications.length > 0 ? (
            notifications.map((notif) => (
              <div
                key={notif.idNotifikasi} 
                className="border border-gray-300 rounded-xl p-4 flex items-center justify-between bg-white"
              >
                <div className="flex items-center gap-3">
                  <Bell className="text-red-600 w-6 h-6" />
                  <div className="grid grid-cols-2 gap-4 items-center w-full"> 
                    <p className="text-[16px] font-medium text-black">
                      {notif.pesan} 
                    </p>
                    <div className="text-gray-600 flex justify-end items-center">
                      <span className="text-[14px] mr-4">{notif.sudahDibaca === 1 ? "Baca" : "Belum Terbaca"}</span>
                      <span className="font-semibold text-[14px]">{formatNotificationTime(notif.tglDibuat)}</span>
                    </div>
                  </div>
                </div>
                {!notif.sudahDibaca && ( 
                  <button
                    onClick={() => markAsRead(notif.idNotifikasi)} 
                    className="bg-blue-500 w-[13rem] font-semibold hover:bg-blue-600 duration-200 text-white text-sm px-4 py-3 rounded-full ml-4 flex-shrink-0"
                  >
                    Tandai Terbaca
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="text-gray-500 text-center py-8">Tidak ada notifikasi yang ditemukan.</div>
          )}
        </div>
      )}
    </div>
  );
}
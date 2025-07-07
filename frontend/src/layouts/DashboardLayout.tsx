// src/layouts/DashboardLayout.tsx

import Sidebar, { type SidebarProps } from "../components/ui/Sidebar";
import Header from "../components/ui/Header"; // Import komponen Header
import { useState, useEffect } from "react"; // Tambahkan useEffect
import { Outlet, useOutletContext, useNavigate } from "react-router-dom"; // Tambahkan useNavigate
import axiosInstance from "../services/axios"; // Pastikan path ini benar
import axios, { AxiosError } from "axios"; // Tambahkan axios dan AxiosError

// --- Interface untuk notifikasi terbaru (dari GET /admin/notifikasi/terbaru) ---
// Jika backend mengirim 0 atau 1, tipe ini sudah benar.
// Jika backend mengirim boolean (true/false), sesuaikan menjadi boolean.
interface LatestNotificationData {
  idNotifikasi: number;
  sudahDibaca: 0 | 1; // 0=belum dibaca, 1=sudah dibaca
  // ... properti lain jika ada, tidak penting untuk count
}

// Interface untuk pembelajaran notifications (dari GET /notifications)
interface PembelajaranNotificationData {
  id: number;
  is_read: boolean;
  title: string;
  message: string;
  created_at: string;
}

// --- TIPE CONTEXT DASHBOARD LAYOUT ---
// Ini yang akan diakses oleh komponen anak yang berada di dalam <Outlet>
export type DashboardLayoutContextType = {
  title: string;
  subtitle: string;
  setTitle: (value: string) => void;
  setSubtitle: (value: string) => void;
};

interface DashboardLayoutProps extends SidebarProps {
  // tidak ada props tambahan di sini dari konteks sebelumnya
}

export default function DashboardLayout({ menuItems }: DashboardLayoutProps) {
  const [title, setTitle] = useState("Dashboard");
  const [subtitle, setSubtitle] = useState(
    "Selamat datang di Website Latihan TOEFL ITP"
  );
  const [unreadCount, setUnreadCount] = useState(0); // State untuk jumlah notifikasi belum dibaca
  const navigate = useNavigate(); // Untuk penanganan error 401

  // Fungsi untuk mengambil jumlah notifikasi yang belum dibaca
  const fetchUnreadNotificationsCount = async () => {
    try {
      const role = localStorage.getItem("role");
      let count = 0;

      if (role === "admin") {
        // EXISTING: Admin gunakan endpoint admin notifikasi saja
        const response = await axiosInstance.get<{
          data: LatestNotificationData[];
        }>("/admin/notifikasi/terbaru");
        const latestNotifications = response.data.data || [];
        count = latestNotifications.filter(
          (notif) => notif.sudahDibaca === 0
        ).length;
      } else if (role === "peserta" || role === "instruktur") {
        // TAMBAHAN: Peserta & Instruktur gunakan endpoint pembelajaran notifications
        const response = await axiosInstance.get<{
          data: PembelajaranNotificationData[];
        }>("/notifications");
        const notifications = response.data.data || [];
        count = notifications.filter((notif) => !notif.is_read).length;
      }

      setUnreadCount(count);
    } catch (err) {
      console.error("Gagal mengambil jumlah notifikasi belum dibaca:", err);

      if (
        axios.isAxiosError(err) &&
        err.response &&
        err.response.status === 401
      ) {
        localStorage.removeItem("AuthToken");
        localStorage.removeItem("role");
        navigate("/login");
      }
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    fetchUnreadNotificationsCount();
  }, []);

  // --- TAMBAHAN: Update title berdasarkan role dan path untuk pembelajaran routes ---
  useEffect(() => {
    const role = localStorage.getItem("role");
    const path = window.location.pathname;

    // TAMBAHAN: Set default title berdasarkan pembelajaran context
    if (path.includes("/materi")) {
      setTitle("Materi Pembelajaran");
      setSubtitle("Pelajari materi TOEFL ITP secara bertahap");
    } else if (path.includes("/simulasi")) {
      setTitle("Simulasi TOEFL");
      setSubtitle("Latihan simulasi ujian TOEFL ITP");
    } else if (path.includes("/konsultasi")) {
      setTitle("Konsultasi");
      setSubtitle("Diskusi dengan instruktur ahli");
    } else if (path.includes("/laporan")) {
      setTitle("Laporan Pembelajaran");
      setSubtitle("Analisis progress belajar Anda");
    }

    //dashboard instruktur dan peserta
    if (path === "/student" || path === "/student/") {
      setTitle("Dashboard Peserta");
      setSubtitle("Ringkasan aktivitas dan progress pembelajaran Anda");
    } else if (path === "/instructor" || path === "/instructor/") {
      setTitle("Dashboard Instruktur");
      setSubtitle("Pantau progress dan kelola pembelajaran peserta");
    } else if (path === "/admin" || path === "/admin/") {
      setTitle("Dashboard Admin");
      setSubtitle("Ringkasan statistik sistem dan pengguna");
    
    
    } else if (path.includes("/dashboard")) {
      // EXISTING: Dashboard title berdasarkan role
      setTitle(
        `Dashboard ${
          role === "admin"
            ? "Admin"
            : role === "instruktur"
            ? "Instruktur"
            : "Peserta"
        }`
      );
      setSubtitle("Ringkasan aktivitas dan progress");
    }
  }, [window.location.pathname]);

  return (
    <div className="flex">
      <Sidebar menuItems={menuItems} />
      <div className="ml-[20rem] w-full min-h-screen">
        {/* EXISTING: Meneruskan props notifikasi ke komponen Header */}
        <Header
          title={title}
          note={subtitle}
          unreadCount={unreadCount} // MODIFIKASI: Jumlah notifikasi belum dibaca (unified admin + pembelajaran)
        />
        <main className="p-4">
          <Outlet
            context={{
              title,
              subtitle,
              setTitle,
              setSubtitle,
            }}
          />
        </main>
      </div>
    </div>
  );
}

// Hook untuk menggunakan context DashboardLayout
export function useDashboardLayoutContext() {
  return useOutletContext<DashboardLayoutContextType>();
}

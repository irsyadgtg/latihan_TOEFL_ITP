// src/layouts/DashboardLayout.tsx

import Sidebar, { type SidebarProps } from "../components/ui/Sidebar";
import Header from "../components/ui/Header"; // Import Header component
import { useState, useEffect } from "react"; // Tambahkan useEffect
import { Outlet, useOutletContext, useNavigate } from "react-router-dom"; // Tambahkan useNavigate
import axiosInstance from "../services/axios"; // Pastikan path ini benar
import axios, { AxiosError } from "axios"; // Tambahkan axios dan AxiosError

// --- Interface untuk notifikasi terbaru (dari GET /admin/notifikasi/terbaru) ---
interface LatestNotificationData {
  idNotifikasi: number;
  sudahDibaca: 0 | 1; // 0=belum dibaca, 1=sudah dibaca
  // ... properti lain jika ada, tidak penting untuk count
}

// --- TIPE CONTEXT DASHBOARD LAYOUT ---
// Ini yang akan diakses oleh komponen anak yang berada di dalam <Outlet>
export type DashboardLayoutContextType = {
  title: string;
  subtitle: string;
  setTitle: (value: string) => void;
  setSubtitle: (value: string) => void;
  refreshUnreadNotifications: () => void; // Fungsi untuk memicu refresh notifikasi
};

interface DashboardLayoutProps extends SidebarProps {
  // tidak ada props tambahan di sini dari konteks sebelumnya
}

export default function DashboardLayout({menuItems}: DashboardLayoutProps) {
  const [title, setTitle] = useState("Profil Saya");
  const [subtitle, setSubtitle] = useState("Isikan profil pengguna Anda");
  const [unreadCount, setUnreadCount] = useState(0); // State untuk jumlah notifikasi belum dibaca
  const navigate = useNavigate(); // Untuk penanganan error 401

  // Fungsi untuk mengambil jumlah notifikasi yang belum dibaca
  const fetchUnreadNotificationsCount = async () => {
    try {
      // Panggil endpoint /admin/notifikasi/terbaru untuk mendapatkan 5 notifikasi terbaru
      const response = await axiosInstance.get<{ data: LatestNotificationData[] }>('/admin/notifikasi/terbaru');
      // Asumsi respons adalah { data: [...] }
      const latestNotifications = response.data.data || []; 

      const count = latestNotifications.filter(notif => notif.sudahDibaca === 0).length;
      setUnreadCount(count);
    } catch (err) {
      console.error("Failed to fetch unread notification count:", err);
      // Handle error, misalnya redirect ke login jika 401
      if (axios.isAxiosError(err) && err.response && err.response.status === 401) {
        localStorage.removeItem('AuthToken');
        navigate('/login'); // Arahkan ke login
      }
      setUnreadCount(0); // Set ke 0 jika ada error
    }
  };

  // Effect untuk memuat hitungan notifikasi pertama kali dan secara berkala
  useEffect(() => {
    fetchUnreadNotificationsCount(); // Panggil pertama kali saat mount

    const intervalId = setInterval(fetchUnreadNotificationsCount, 30000); // Refresh setiap 30 detik

    return () => clearInterval(intervalId); // Bersihkan interval saat komponen unmount
  }, [navigate]); // navigate sebagai dependency

  // Fungsi yang akan diekspos melalui context/props untuk memicu refresh dari luar
  const refreshUnreadNotifications = () => {
    fetchUnreadNotificationsCount();
  };

  return (
    <div className="flex">
      <Sidebar menuItems={menuItems} />
      <div className="ml-[20rem] w-full min-h-screen">
        {/* --- PERBAIKAN DI SINI: Meneruskan props baru ke Header --- */}
        <Header 
          title={title} 
          note={subtitle} 
          unreadCount={unreadCount} // Meneruskan unreadCount
          refreshUnreadNotifications={refreshUnreadNotifications} // Meneruskan refresh function
        />
        <main className="p-4">
            {/* --- PERBAIKAN DI SINI: Meneruskan refreshUnreadNotifications ke Outlet context juga --- */}
            <Outlet context={{ title, subtitle, setTitle, setSubtitle, refreshUnreadNotifications }} />
        </main>
      </div>
    </div>
  );
}

// Hook untuk menggunakan context DashboardLayout
export function useDashboardLayoutContext() {
  return useOutletContext<DashboardLayoutContextType>();
}
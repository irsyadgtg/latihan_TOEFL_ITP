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

export default function DashboardLayout({ menuItems }: DashboardLayoutProps) {
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

      // Filter notifikasi yang belum dibaca (sudahDibaca === 0)
      const count = latestNotifications.filter(notif => notif.sudahDibaca === 0).length;
      setUnreadCount(count);
    } catch (err) {
      console.error("Gagal mengambil jumlah notifikasi belum dibaca:", err);
      // Tangani error, misalnya redirect ke login jika 401 (Unauthenticated)
      if (axios.isAxiosError(err) && err.response && err.response.status === 401) {
        localStorage.removeItem('AuthToken'); // Hapus token yang mungkin sudah tidak valid
        navigate('/login'); // Arahkan ke login
      }
      setUnreadCount(0); // Set ke 0 jika ada error agar tidak menampilkan angka yang salah
    }
  };

  return (
    <div className="flex">
      <Sidebar menuItems={menuItems} />
      <div className="ml-[20rem] w-full min-h-screen">
        {/* Meneruskan props notifikasi ke komponen Header */}
        <Header 
          title={title} 
          note={subtitle} 
          unreadCount={unreadCount} // Meneruskan jumlah notifikasi belum dibaca
        />
        <main className="p-4">
            {/* Meneruskan refreshUnreadNotifications ke Outlet context juga,
                agar komponen anak bisa memicu refresh notifikasi jika diperlukan */}
            <Outlet context={{ title, subtitle, setTitle, setSubtitle }} />
        </main>
      </div>
    </div>
  );
}

// Hook untuk menggunakan context DashboardLayout
export function useDashboardLayoutContext() {
  return useOutletContext<DashboardLayoutContextType>();
}
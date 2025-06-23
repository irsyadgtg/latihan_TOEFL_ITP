import { FaRegListAlt } from "react-icons/fa";
import { FiArrowDownCircle, FiBell, FiEdit, FiFileText, FiMonitor, FiPackage, FiUser } from "react-icons/fi";
import { PiChalkboardTeacherBold } from "react-icons/pi";

export const studentNavigation = [
  {
    to: "/student/rencana",
    label: "Pengajuan Rencana Belajar",
    icon: <img src="/pengajuan-rencana-beljar.png" alt="Rencana Belajar" />,
  },
  {
    to: "/student/awal",
    label: "Pengajuan Skor Awal",
    icon: <img src="/pengajuan-skor-awal.png" alt="Skor Awal" />,
  },
  {
    to: "/student/pembayaran",
    label: "Riwayat Pembayaran",
    icon: <img src="/riwayat-pembayaran.png" alt="Riwayat Pembayaran" />,
  },
  {
    to: "/student/instruktur",
    label: "Daftar Instruktur",
    icon: <img src="/instruktur.png" alt="Instruktur" />,
  },
  {
    to: "/student/langganan",
    label: "Berlangganan Paket Kursus",
    icon: <img src="/subscribe.png" alt="Langganan" />,
  },
  {
    to: "/student/profil",
    label: "Profil",
    icon: <img src="/profile.png" alt="Profil" />,
  },
];

export const instructorNavigation = 
    [
      { label: "Daftar Instruktur", to: "/instructor/daftar-instruktur", icon: <PiChalkboardTeacherBold /> },
      { label: "Tinjau Rencana Belajar", to: "/instructor/tinjau-rencana-belajar", icon: <FiEdit /> },
      { label: "Profil Saya", to: "/instructor/profil", icon: <FiUser /> }
    ]
    
export const adminNavigation =
    [
      { label: "Dashboard Admin", to: "/admin/dashboard", icon: <FiMonitor /> },
      { label: "Kelola Instruktur", to: "/admin/kelola-instruktur", icon: <PiChalkboardTeacherBold /> },
      { label: "Seleksi Skor Awal", to: "/admin/seleksi-skor", icon: <FiArrowDownCircle /> },
      { label: "Pantau Daftar Peserta", to: "/admin/pantau-peserta", icon: <FaRegListAlt /> },
      { label: "Riwayat Transaksi", to: "/admin/riwayat-transaksi", icon: <FiFileText /> },
      { label: "Notifikasi Admin", to: "/admin/notifikasi", icon: <FiBell /> },
      { label: "Profil Saya", to: "/admin/profil", icon: <FiUser /> },
      { label: "Kelola Paket Kursus", to: "/admin/kelola-paket", icon: <FiPackage /> },
    ]
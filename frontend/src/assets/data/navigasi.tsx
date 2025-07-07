import { FaRegListAlt, FaBookOpen, FaClipboardList } from "react-icons/fa";
import {
  FiArrowDownCircle,
  FiBell,
  FiEdit,
  FiFileText,
  FiMonitor,
  FiPackage,
  FiUser,
  FiPlay,
  FiBarChart,
  FiMessageSquare,
} from "react-icons/fi";
import { PiChalkboardTeacherBold } from "react-icons/pi";
import { HiOutlineDesktopComputer } from "react-icons/hi";
import { BiBookReader } from "react-icons/bi";

export const studentNavigation = [
  {
    label: "Dashboard",
    to: "/student", // ← NEW: Dashboard first
    icon: <FiMonitor className="w-5 h-5" />,
  },
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

  // PEMBELAJARAN FEATURES - Universal routes untuk student
  {
    to: "/student/materi",
    label: "Materi",
    icon: <FaBookOpen className="w-5 h-5" />,
  },
  {
    to: "/student/simulasi",
    label: "Simulasi",
    icon: <HiOutlineDesktopComputer className="w-5 h-5" />,
  },
  {
    to: "/student/konsultasi",
    label: "Konsultasi",
    icon: <FiMessageSquare className="w-5 h-5" />,
  },
  {
    to: "/student/laporan-pembelajaran",
    label: "Laporan Pembelajaran",
    icon: <FiBarChart className="w-5 h-5" />,
  },

  {
    to: "/student/profil",
    label: "Profil",
    icon: <img src="/profile.png" alt="Profil" />,
  },
];

export const instructorNavigation = [
  {
    label: "Dashboard",
    to: "/instructor", // ← NEW: Dashboard first
    icon: <FiMonitor className="w-5 h-5" />,
  },
  {
    label: "Daftar Instruktur",
    to: "/instructor/daftar-instruktur",
    icon: <PiChalkboardTeacherBold />,
  },
  {
    label: "Tinjau Rencana Belajar",
    to: "/instructor/tinjau-rencana-belajar",
    icon: <FiEdit />,
  },

  // PEMBELAJARAN FEATURES - Universal routes untuk instructor
  {
    label: "Kelola Materi",
    to: "/instructor/materi",
    icon: <BiBookReader className="w-5 h-5" />,
  },
  {
    label: "Kelola Simulasi",
    to: "/instructor/simulasi",
    icon: <FiPlay className="w-5 h-5" />,
  },
  {
    label: "Konsultasi",
    to: "/instructor/konsultasi",
    icon: <FiMessageSquare className="w-5 h-5" />,
  },

  { label: "Profil Saya", to: "/instructor/profil", icon: <FiUser /> },
];

export const adminNavigation = [
  { label: "Dashboard Admin", to: "/admin/dashboard", icon: <FiMonitor /> },
  {
    label: "Kelola Instruktur",
    to: "/admin/kelola-instruktur",
    icon: <PiChalkboardTeacherBold />,
  },
  {
    label: "Seleksi Skor Awal",
    to: "/admin/seleksi-skor",
    icon: <FiArrowDownCircle />,
  },
  {
    label: "Pantau Daftar Peserta",
    to: "/admin/pantau-peserta",
    icon: <FaRegListAlt />,
  },
  {
    label: "Riwayat Transaksi",
    to: "/admin/riwayat-transaksi",
    icon: <FiFileText />,
  },
  { label: "Notifikasi Admin", to: "/admin/notifikasi", icon: <FiBell /> },
  { label: "Profil Saya", to: "/admin/profil", icon: <FiUser /> },
  {
    label: "Kelola Paket Kursus",
    to: "/admin/kelola-paket",
    icon: <FiPackage />,
  },
];

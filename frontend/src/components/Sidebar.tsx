// src/components/Sidebar.tsx

import React from 'react';
import { type IconType } from 'react-icons';

// --- Impor semua ikon yang dibutuhkan untuk semua role ---
import {
  FiMonitor,
  FiArrowDownCircle,
  FiFileText,
  FiBell,
  FiUser,
  FiPackage,
  FiMenu,
  FiBarChart2, // Untuk Rencana Belajar
  FiEdit,      // Untuk Tinjau Belajar
} from 'react-icons/fi';
import { FaRegListAlt } from 'react-icons/fa';
import { LiaFileInvoiceDollarSolid } from "react-icons/lia"; // Untuk Riwayat Pembayaran
import { PiChalkboardTeacherBold } from 'react-icons/pi';

// --- Tipe Data ---
// Mendefinisikan peran (role) yang valid
type UserRole = 'admin' | 'student' | 'instructor';

// Mendefinisikan struktur item menu
interface NavItem {
  name: string;
  icon: IconType;
}

// Props untuk komponen Sidebar
interface SidebarProps {
  role: UserRole;
}

// --- Struktur Data Menu Terpusat ---
// Semua data menu untuk setiap role disimpan di sini
const navItemsByRole: Record<UserRole, NavItem[][]> = {
  // Menu untuk Admin
  admin: [
    [
      { name: 'Dashboard Admin', icon: FiMonitor },
      { name: 'Kelola Instruktur', icon: PiChalkboardTeacherBold },
      { name: 'Seleksi Skor Awal', icon: FiArrowDownCircle },
      { name: 'Pantau Daftar Peserta', icon: FaRegListAlt },
    ],
    [
      { name: 'Riwayat Transaksi', icon: FiFileText },
      { name: 'Notifikasi Admin', icon: FiBell },
    ],
    [
      { name: 'Profil Saya', icon: FiUser },
      { name: 'Kelola Paket Kursus', icon: FiPackage },
    ],
  ],
  // Menu untuk Mahasiswa (Student)
  student: [
    [
      { name: 'Pengajuan Rencana Belajar', icon: FiBarChart2 },
      { name: 'Pengajuan Skor Awal', icon: FaRegListAlt },
      { name: 'Riwayat Pembayaran', icon: LiaFileInvoiceDollarSolid },
      { name: 'Daftar Instruktur', icon: PiChalkboardTeacherBold },
    ],
    [
      { name: 'Profil Saya', icon: FiUser },
      { name: 'Berlangganan Paket Kursus', icon: FiPackage },
    ],
  ],
  // Menu untuk Instruktur
  instructor: [
    [
        { name: 'Daftar Instruktur', icon: PiChalkboardTeacherBold },
        { name: 'Tinjau Rencana Belajar', icon: FiEdit },
    ],
    [
        { name: 'Profil Saya', icon: FiUser },
    ]
  ],
};


const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  // Ambil grup menu berdasarkan role yang diberikan, default ke array kosong jika tidak ditemukan
  const navGroups = navItemsByRole[role] || [];

  // Pisahkan grup menu utama dengan grup menu bawah (biasanya Profil dll)
  // Kita anggap grup terakhir adalah grup bawah
  const mainNavGroups = navGroups.slice(0, navGroups.length - 1);
  const bottomNavGroup = navGroups[navGroups.length - 1] || [];


  return (
    <div className="relative flex">
      <aside className="bg-[#c52d3a] min-h-screen w-80 p-5 flex flex-col shadow-lg">
        {/* Header Logo */}
        <div className="bg-white rounded-lg p-3 mb-8 flex items-center justify-center shadow">
          <div className="text-center font-bold text-gray-800 text-[13px] leading-tight">
            <span>Telkom University</span><br />
            <span className="font-semibold">LANGUAGE CENTER</span>
          </div>
        </div>

        {/* Kontainer Navigasi */}
        <div className="flex flex-col justify-between flex-grow">
          {/* Grup Menu Utama (atas & tengah) */}
          <div className="space-y-8">
            {mainNavGroups.map((group, groupIndex) => (
              <div key={`${role}-group-${groupIndex}`} className="space-y-3">
                {group.map((item) => (
                  <button
                    key={item.name}
                    className="flex items-center w-full p-3 text-white rounded-lg border border-[#b02833] hover:bg-[#b02833] focus:outline-none focus:ring-2 focus:ring-white/50 transition-colors duration-200"
                  >
                    <item.icon className="h-6 w-6 mr-4 flex-shrink-0" />
                    <span className="text-md font-medium">{item.name}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>

          {/* Grup Menu Bawah */}
          <div className="space-y-3">
            {bottomNavGroup.map((item) => (
              <button
                key={item.name}
                className="flex items-center w-full p-3 text-white rounded-lg border border-[#b02833] hover:bg-[#b02833] focus:outline-none focus:ring-2 focus:ring-white/50 transition-colors duration-200"
              >
                <item.icon className="h-6 w-6 mr-4 flex-shrink-0" />
                <span className="text-md font-medium">{item.name}</span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Hamburger Menu Icon */}
      <div className="p-4 absolute top-2 right-4 sm:hidden">
        <button className="text-white">
          <FiMenu size={28} />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
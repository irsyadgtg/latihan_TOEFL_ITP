import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// ============ SHARED COMPONENTS ============
import MainLayout from "./new/shared/components/MainLayout";
import Notifications from "./new/shared/components/Notifications";

// ============ AUTH COMPONENTS (PUBLIC ROUTES) ============
import Register from "./new/persiapan/auth/Register";
import Login from "./new/persiapan/auth/Login";
import ForgotPassword from "./new/persiapan/auth/ForgotPassword";

// ============ MODUL PEMBELAJARAN (EXISTING & STABLE) ============
// Halaman utama pembelajaran - tidak ada subfolder components
import MateriList from "./new/pembelajaran/MateriList";
import Materi from "./new/pembelajaran/Materi";
import Simulasi from "./new/pembelajaran/Simulasi";
import SimulasiMulai from "./new/pembelajaran/SimulasiMulai";
import HasilSimulasi from "./new/pembelajaran/HasilSimulasi";
import ListSimulasi from "./new/pembelajaran/ListSimulasi";
import KelolaSimulasi from "./new/pembelajaran/KelolaSimulasi";
import Konsultasi from "./new/pembelajaran/Konsultasi";
import LaporanPembelajaran from "./new/pembelajaran/LaporanPembelajaran";
import DetailLaporan from "./new/pembelajaran/DetailLaporan";

// ============ MODUL PERSIAPAN - DASHBOARD ============
import DashboardAdmin from "./new/persiapan/dashboard/DashboardAdmin";
import DashboardPeserta from "./new/persiapan/dashboard/DashboardPeserta";
import DashboardInstruktur from "./new/persiapan/dashboard/DashboardInstruktur";

// ============ MODUL PERSIAPAN - PROFILE MANAGEMENT ============
import ProfilePeserta from "./new/persiapan/profile/ProfilePeserta";
import ProfileInstruktur from "./new/persiapan/profile/ProfileInstruktur";
import ProfileAdmin from "./new/persiapan/profile/ProfileAdmin";

// ============ MODUL PERSIAPAN - ADMIN PANEL ============
import KelolaInstruktur from "./new/persiapan/admin/KelolaInstruktur";
import PantauPeserta from "./new/persiapan/admin/PantauPeserta";
import KelolaPaketKursus from "./new/persiapan/admin/KelolaPaketKursus";
import SeleksiSkorAwal from "./new/persiapan/admin/SeleksiSkorAwal";
import RiwayatTransaksi from "./new/persiapan/admin/RiwayatTransaksi";
import NotifikasiAdmin from "./new/persiapan/admin/NotifikasiAdmin";

// ============ MODUL PERSIAPAN - PESERTA FEATURES ============
import DaftarInstruktur from "./new/persiapan/peserta/DaftarInstruktur";
import PengajuanSkorAwal from "./new/persiapan/peserta/PengajuanSkorAwal";
import PaketKursus from "./new/persiapan/peserta/PaketKursus";
import RencanaBelajar from "./new/persiapan/peserta/RencanaBelajar";
import Pembayaran from "./new/persiapan/peserta/Pembayaran";
import RiwayatPembayaran from "./new/persiapan/peserta/RiwayatPembayaran";

// ============ MODUL PERSIAPAN - INSTRUKTUR FEATURES ============
import TinjauRencanaBelajar from "./new/persiapan/instruktur/TinjauRencanaBelajar";
import DaftarPengajuan from "./new/persiapan/instruktur/DaftarPengajuan";

/**
 * ============================================================================
 * APP.JSX - FINAL TIMELESS VERSION
 * ============================================================================
 * 
 * PROJECT: LMS TOEFL ITP - Gabungan Modul Pembelajaran + Persiapan
 * VERSION: Final (Tidak akan berubah lagi)
 * 
 * STRUKTUR:
 * 1. PUBLIC ROUTES: Register, Login, ForgotPassword
 * 2. PROTECTED ROUTES: Semua dalam MainLayout dengan role-based access
 * 3. DASHBOARD: Role-based routing otomatis
 * 4. MODUL PEMBELAJARAN: 10 halaman (existing, stable)
 * 5. MODUL PERSIAPAN: 17 halaman (new features)
 * 
 * ROLE-BASED ACCESS:
 * - ADMIN: Dashboard Admin + Admin Panel (6 fitur) + Profile
 * - INSTRUKTUR: Dashboard Instruktur + Pembelajaran + Instruktur Panel + Profile  
 * - PESERTA: Dashboard Peserta + Pembelajaran + Peserta Features + Profile
 * 
 * CRITICAL NOTES:
 * - Backend API: 100% final, tidak boleh diubah
 * - Import paths: Sesuai struktur folder final
 * - Components: Timer, PageViewer, dll ada di pembelajaran/ langsung
 * - API service: Terpusat di new/shared/services/api.js
 * ============================================================================
 */

function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* ===================== PUBLIC ROUTES ===================== */}
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* ===================== PROTECTED ROUTES ===================== */}
        <Route element={<MainLayout />}>
          
          {/* DASHBOARD - Role-based Automatic Routing */}
          <Route path="/dashboard" element={<DashboardRoute />} />
          
          {/* ===================== MODUL PEMBELAJARAN ===================== */}
          {/* Akses: Peserta + Instruktur (role-based features dalam komponen) */}
          
          {/* Materi Pembelajaran */}
          <Route path="/materi" element={<MateriList />} />
          <Route path="/materi/:modul" element={<Materi />} />

          {/* Simulasi TOEFL */}
          <Route path="/simulasi" element={<Simulasi />} />
          <Route path="/simulasi/mulai" element={<SimulasiMulai />} />
          <Route path="/simulasi/hasil" element={<ListSimulasi />} />
          <Route path="/simulasi/hasil/:simulationId" element={<HasilSimulasi />} />
          <Route path="/simulasi/kelola" element={<KelolaSimulasi />} />

          {/* Konsultasi */}
          <Route path="/konsultasi" element={<Konsultasi />} />
          <Route path="/konsultasi/:instructorId" element={<Konsultasi />} />
          <Route path="/konsultasi/student/:studentId" element={<Konsultasi />} />

          {/* Laporan Pembelajaran */}
          <Route path="/laporan-pembelajaran" element={<LaporanPembelajaran />} />
          <Route path="/laporan-pembelajaran/detail" element={<DetailLaporan />} />

          {/* Notifications - Universal */}
          <Route path="/notifications" element={<Notifications />} />
          
          {/* ===================== MODUL PERSIAPAN ===================== */}
          
          {/* Profile Management - Universal (berdasarkan role di URL) */}
          <Route path="/profil/peserta" element={<ProfilePeserta />} />
          <Route path="/profil/instruktur" element={<ProfileInstruktur />} />
          <Route path="/profil/admin" element={<ProfileAdmin />} />
          
          {/* Admin Panel - Admin Only */}
          <Route path="/admin/kelola-instruktur" element={<KelolaInstruktur />} />
          <Route path="/admin/pantau-peserta" element={<PantauPeserta />} />
          <Route path="/admin/paket-kursus" element={<KelolaPaketKursus />} />
          <Route path="/admin/seleksi-skor" element={<SeleksiSkorAwal />} />
          <Route path="/admin/transaksi" element={<RiwayatTransaksi />} />
          <Route path="/admin/notifikasi" element={<NotifikasiAdmin />} />
          
          {/* Peserta Features - Peserta Only */}
          <Route path="/instruktur/daftar" element={<DaftarInstruktur />} />
          <Route path="/skor-awal" element={<PengajuanSkorAwal />} />
          <Route path="/paket-kursus" element={<PaketKursus />} />
          <Route path="/paket/:id/pembayaran" element={<Pembayaran />} />
          <Route path="/riwayat-pembayaran" element={<RiwayatPembayaran />} />
          <Route path="/rencana-belajar" element={<RencanaBelajar />} />
          
          {/* Instruktur Features - Instruktur Only */}
          <Route path="/tinjau-rencana" element={<TinjauRencanaBelajar />} />
          <Route path="/pengajuan-masuk" element={<DaftarPengajuan />} />
          
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

/**
 * ============================================================================
 * DASHBOARD ROUTE COMPONENT
 * ============================================================================
 * 
 * Handles role-based dashboard routing automatically
 * Reads role from localStorage and redirects to appropriate dashboard
 * 
 * MAPPING:
 * - role: 'admin' → DashboardAdmin (modul persiapan)
 * - role: 'instruktur' → DashboardInstruktur (modul persiapan)  
 * - role: 'peserta' → DashboardPeserta (modul persiapan)
 * - fallback → DashboardPeserta (default)
 * ============================================================================
 */
function DashboardRoute() {
  const role = localStorage.getItem('role');
  
  // Role-based dashboard routing
  switch(role) {
    case 'admin':
      return <DashboardAdmin />;
    case 'instruktur':
      return <DashboardInstruktur />;
    case 'peserta':
    default:
      return <DashboardPeserta />;
  }
}

export default App;

/**
 * ============================================================================
 * FINAL NOTES & CONSTRAINTS
 * ============================================================================
 * 
 * 1. TIDAK BOLEH DIUBAH LAGI - File ini sudah final dan timeless
 * 2. Backend API endpoints sudah 100% mapped dan tidak berubah
 * 3. Struktur folder fixed: new/shared/, new/pembelajaran/, new/persiapan/
 * 4. Role-based access dikontrol di level component, bukan routing
 * 5. Import paths sudah disesuaikan dengan struktur final
 * 6. MainLayout handle sidebar, header, authentication flow
 * 7. Semua 27 routes sudah complete sesuai requirements
 * 8. Components pembantu (Timer, PageViewer, dll) di pembelajaran/ langsung
 * 
 * TOTAL ROUTES:
 * - Public: 3 routes (auth)
 * - Protected: 24 routes (pembelajaran + persiapan)
 * - Dashboard: 1 route (role-based automatic)
 * 
 * MAINTENANCE: Hanya boleh menambah route baru, tidak boleh mengubah existing
 * ============================================================================
 */
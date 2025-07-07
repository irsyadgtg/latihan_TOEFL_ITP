// src/routes/AppRouter.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Layouts
import DashboardLayout from "../layouts/DashboardLayout";

// Auth Pages
import LoginPage from "../pages/auth/LoginPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswoedPage";
import ResetPassword from "../pages/auth/ResetPassword";
import RegistrationPage from "../pages/auth/RegistrationPage";
import VerificationLink from "../pages/auth/VerificationLink";

// Student Pages
import StudentDashboard from "../pages/students/StudentDashboard";
import ProfilePage from "../pages/students/ProfilPage";
import InitialScore from "../pages/students/InitialScore";
import CreateInitialScore from "../pages/students/CreateInitialScore";
import StudyPlanSubmission from "../pages/students/StudyPlanSubmission";
import StudyPlanSubmissionDetail from "../pages/students/StudyPlanSubmissionDetail";
import StudyPlanSubmissionCreate from "../pages/students/StudyPlanSubmissionCreate";
import StudentFeedback from "../pages/students/StudentPlanFeedback";
import SubscribePage from "../pages/students/SubscribePage";
import SubscribeForm from "../pages/students/SubscribeForm";
import SubscribeHistory from "../pages/students/SubscribeHistory";
import InstructurPage from "../pages/students/InstructurPage";

// Admin Pages
import Dashboard from "../pages/AdminView/Dashboard";
import KelolaInstruktur from "../pages/AdminView/KelolaInstruktur";
import KelolaPaket from "../pages/AdminView/KelolaPaket";
import PantauDaftarPeserta from "../pages/AdminView/PantauDaftarPeserta";
import SeleksiSkor from "../pages/AdminView/SeleksiSkorAwal";
import RiwayatTransaksi from "../pages/AdminView/RiwayatTransaksi";
import NotifikasiAdmin from "../pages/AdminView/NotifikasiAdmin";
import ProfilSaya from "../pages/AdminView/ProfilSaya";
import UbahKetersediaan from "../pages/AdminView/KelolaInstruktur/UbahKetersediaan";
import TambahInstruktur from "../pages/AdminView/KelolaInstruktur/TambahInstruktur";
import TambahPaket from "../pages/AdminView/KelolaPaket/TambahPaket";
import UbahDetail from "../pages/AdminView/KelolaPaket/UbahDetail";
import AktivasiPaket from "../pages/AdminView/KelolaPaket/Aktivasi";
import DetailPengajuan from "../pages/AdminView/SeleksiSkorAwal/DetailPengajuan";
import DetailTransaksi from "../pages/AdminView/RiwayatTransaksi/DetailTransaksi"; // Pastikan path ini benar

// Instructor Pages
import InstructorLoginPage from "../pages/auth/InstructorLoginPage";
import AdminLoginPage from "../pages/auth/AdminLoginPage";
import Profil from "../pages/instructor/Profil";
import DaftarInstruktur from "../pages/instructor/DaftarInstruktur";
import TinjauRencanaBelajar from "../pages/instructor/TinjauRencanaBelajar";

import DetailRencanaBelajar from "../pages/instructor/DetailRencanaBelajar";

// TAMBAH: Pembelajaran Components dari new/pembelajaran/
import MateriList from "../new/pembelajaran/MateriList";
import Materi from "../new/pembelajaran/Materi";
import Simulasi from "../new/pembelajaran/Simulasi";
import SimulasiMulai from "../new/pembelajaran/SimulasiMulai";
import HasilSimulasi from "../new/pembelajaran/HasilSimulasi";
import ListSimulasi from "../new/pembelajaran/ListSimulasi";
import KelolaSimulasi from "../new/pembelajaran/KelolaSimulasi";
import Konsultasi from "../new/pembelajaran/Konsultasi";
import LaporanPembelajaran from "../new/pembelajaran/LaporanPembelajaran";
import DetailLaporan from "../new/pembelajaran/DetailLaporan";
import Notifications from "../new/shared/components/Notifications";

//baru
import InstructorDashboard from "../pages/instructor/InstructorDashboard";


import { StudyPlanProvider } from "../contexts/StudyPlanContext";
import {
  adminNavigation,
  instructorNavigation,
  studentNavigation,
} from "../assets/data/navigasi";
import StudyPlanFeedbackDetail from "../pages/students/StudentPlanFeedback";

const AppRouter = () => {
  // TAMBAH: Function untuk get menu berdasarkan role
  // const getPembelajaranMenu = () => {
  //   const role = localStorage.getItem("role");
  //   switch (role) {
  //     case "instruktur":
  //       return instructorNavigation;
  //     case "peserta":
  //       return studentNavigation;
  //     default:
  //       return studentNavigation; // fallback
  //   }
  // };

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registrasi" element={<RegistrationPage />} />
        <Route path="/lupa-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verifikasi-link" element={<VerificationLink />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/admin"
          element={<DashboardLayout menuItems={adminNavigation} />}
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="kelola-instruktur" element={<KelolaInstruktur />} />
          <Route
            path="kelola-instruktur/tambah"
            element={<TambahInstruktur />}
          />
          <Route
            path="kelola-instruktur/ubah-ketersediaan/:idPegawai"
            element={<UbahKetersediaan />}
          />
          <Route path="kelola-paket" element={<KelolaPaket />} />
          <Route path="kelola-paket/tambah" element={<TambahPaket />} />
          <Route path="kelola-paket/ubah-detail/:id" element={<UbahDetail />} />
          <Route path="kelola-paket/aktivasi/:id" element={<AktivasiPaket />} />
          <Route path="pantau-peserta" element={<PantauDaftarPeserta />} />
          <Route path="seleksi-skor" element={<SeleksiSkor />} />
          <Route
            path="seleksi-skor/detail-pengajuan/:id"
            element={<DetailPengajuan />}
          />
          <Route path="riwayat-transaksi" element={<RiwayatTransaksi />} />
          <Route
            path="riwayat-transaksi/detail-transaksi"
            element={<DetailTransaksi />}
          />
          <Route path="notifikasi" element={<NotifikasiAdmin />} />
          <Route path="profil" element={<ProfilSaya />} />
        </Route>

        {/* Instructor Routes */}
        <Route path="/instruktur/login" element={<InstructorLoginPage />} />
        <Route
          path="/instructor"
          element={
            <StudyPlanProvider>
              <DashboardLayout menuItems={instructorNavigation} />
            </StudyPlanProvider>
          }
        >
          <Route index element={<InstructorDashboard />} />
          <Route path="dashboard" element={<InstructorDashboard />} />  
          <Route path="profil" element={<Profil />} />
          <Route path="daftar-instruktur" element={<DaftarInstruktur />} />
          <Route
            path="tinjau-rencana-belajar"
            element={<TinjauRencanaBelajar />}
          />
          <Route
            path="rencana-belajar/:id"
            element={<DetailRencanaBelajar />}
          />
          {/* TAMBAH: Pembelajaran routes untuk instructor */}
          <Route path="materi" element={<MateriList />} />
          <Route path="materi/:modul" element={<Materi />} />
          <Route path="simulasi" element={<Simulasi />} />
          <Route path="simulasi/kelola" element={<KelolaSimulasi />} />
          <Route path="konsultasi" element={<Konsultasi />} />
          <Route path="konsultasi/:instructorId" element={<Konsultasi />} />
          <Route
            path="konsultasi/student/:studentId"
            element={<Konsultasi />}
          />
          <Route
            path="laporan-pembelajaran"
            element={<LaporanPembelajaran />}
          />
          <Route
            path="laporan-pembelajaran/detail"
            element={<DetailLaporan />}
          />
          <Route path="notifications" element={<Notifications />} />
        </Route>

        {/* Student Routes */}
        <Route
          path="/student"
          element={<DashboardLayout menuItems={studentNavigation} />}
        >
          <Route index element={<StudentDashboard />} />
          <Route path="profil" element={<ProfilePage />} />
          <Route path="instruktur" element={<InstructurPage />} />
          <Route path="awal" element={<InitialScore />} />
          <Route path="awal/create" element={<CreateInitialScore />} />
          <Route path="rencana" element={<StudyPlanSubmission />} />
          <Route path="rencana/detail/:id" element={<StudyPlanSubmissionDetail />} />
          <Route path="rencana/detail/:id/feedback" element={<StudyPlanFeedbackDetail />} />
          <Route path="rencana/create" element={<StudyPlanSubmissionCreate />} />
          <Route path="langganan" element={<SubscribePage />} />
          <Route path="langganan/form/:id" element={<SubscribeForm />} />
          <Route path="langganan/riwayat" element={<SubscribeHistory />} />
          <Route path="pembayaran" element={<SubscribeHistory />} />{" "}
          {/* Ini mungkin duplikat dengan langganan/riwayat */}
          {/* TAMBAH: Pembelajaran routes untuk student */}
          <Route path="materi" element={<MateriList />} />
          <Route path="materi/:modul" element={<Materi />} />
          <Route path="simulasi" element={<Simulasi />} />
          <Route path="simulasi/hasil" element={<ListSimulasi />} />
          <Route
            path="simulasi/hasil/:simulationId"
            element={<HasilSimulasi />}
          />
          <Route path="konsultasi" element={<Konsultasi />} />
          <Route path="konsultasi/:instructorId" element={<Konsultasi />} />
          <Route
            path="laporan-pembelajaran"
            element={<LaporanPembelajaran />}
          />
          <Route
            path="laporan-pembelajaran/detail"
            element={<DetailLaporan />}
          />
          <Route path="notifications" element={<Notifications />} />
        </Route>
        {/* simulasi diluar dashboardlayout/sidebar */}
        <Route path="/student/simulasi/mulai" element={<SimulasiMulai />} />

        {/* Routes Pembelajaran dengan Layout */}
        {/* <Route element={<DashboardLayout menuItems={getPembelajaranMenu()} />}>
          <Route path="/materi" element={<MateriList />} />
          <Route path="/materi/:modul" element={<Materi />} />
          <Route path="/simulasi" element={<Simulasi />} />
          <Route path="/simulasi/mulai" element={<SimulasiMulai />} />
          <Route path="/simulasi/hasil" element={<ListSimulasi />} />
          <Route
            path="/simulasi/hasil/:simulationId"
            element={<HasilSimulasi />}
          />
          <Route path="/simulasi/kelola" element={<KelolaSimulasi />} />
          <Route path="/konsultasi" element={<Konsultasi />} />
          <Route path="/konsultasi/:instructorId" element={<Konsultasi />} />
          <Route
            path="/konsultasi/student/:studentId"
            element={<Konsultasi />}
          />
          <Route
            path="/laporan-pembelajaran"
            element={<LaporanPembelajaran />}
          />
          <Route
            path="/laporan-pembelajaran/detail"
            element={<DetailLaporan />}
          />
          <Route path="/notifications" element={<Notifications />} />
        </Route> */}

        {/* Rute default, arahkan ke login */}
        <Route path="/" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;

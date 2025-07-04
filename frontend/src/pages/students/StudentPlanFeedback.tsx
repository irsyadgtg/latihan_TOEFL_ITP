import React, { useEffect, useState } from "react";
import { useDashboardLayoutContext } from "../../layouts/DashboardLayout";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import { useNavigate, useParams } from "react-router-dom";
import TabSkillCard from "../../components/TabSkillCard"; // Pastikan path ini benar dan propsnya sesuai
import axios, { AxiosError } from "axios";
import axiosInstance from "../../services/axios";

// --- Interface untuk Struktur Data Rencana Belajar DETAIL dari API ---
// Ini mencerminkan respons dari GET /peserta/rencana-belajar/{id}
interface StudyPlanDetailData {
  idPengajuanRencanaBelajar: number; // ID utama dari model PengajuanRencanaBelajar
  namaRencana: string;
  targetSkor: number;
  targetWaktu: string;
  hariPerMinggu: number; // Jumlah hari per minggu (dari 'frekuensi_mingguan' di store)
  jamPerHari: string; // Durasi per hari (dari 'durasi_harian' di store)
  tglPengajuan: string; // Tanggal pengajuan
  status: "pending" | "disetujui" | "ditolak" | "sudah ada feedback" | "selesai"; // Status persetujuan
  keterangan: string | null; // Keterangan umum rencana belajar (bukan dari feedback)
  created_at: string;
  updated_at: string;

  // Relasi detail pengajuan rencana belajar (untuk skill yang diajukan)
  detail_pengajuan_rencana_belajar: Array<{
    idDetailPengajuanRencanaBelajar: number;
    idPengajuanRencanaBelajar: number;
    idSkill: number;
    skill: {
      idSkill: number;
      namaSkill: string; // Nama skill yang diajukan peserta
    };
  }>;

  // Relasi feedback rencana belajar dari instruktur
  feedback_rencana_belajar?: { // Bisa null jika belum ada feedback
    idFeedbackRencanaBelajar: number;
    idPengajuanRencanaBelajar: number;
    idPegawai: number;
    keterangan: string; // Keterangan umum dari feedback instruktur
    created_at: string;
    updated_at: string;
    // Relasi detail feedback per skill
    detail_feedback_rencana_belajar: Array<{
      idDetailFeedbackRencanaBelajar: number;
      idFeedbackRencanaBelajar: number;
      idSkill: number;
      feedback: string; // Komentar feedback untuk skill ini
      skill: {
        idSkill: number;
        namaSkill: string; // Nama skill
      };
    }>;
  } | null;
}

const StudentFeedback: React.FC = () => {
  const { setTitle, setSubtitle } = useDashboardLayoutContext();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); // Ambil ID rencana belajar dari URL

  const [studyPlanData, setStudyPlanData] = useState<StudyPlanDetailData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTitle("Hasil Feedback Rencana Belajar");
    setSubtitle("Peserta dapat melihat detail hasil feedback yang telah ditinjau oleh instruktur.");
  }, [setTitle, setSubtitle]);

  // Effect untuk mengambil data detail rencana belajar (yang berisi feedback)
  useEffect(() => {
    const fetchStudyPlanDetail = async () => {
      if (!id) {
        setError("ID Rencana Belajar tidak ditemukan di URL.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        // PENTING: Menggunakan endpoint untuk peserta
        const response = await axiosInstance.get<{ data: StudyPlanDetailData }>(`/peserta/rencana-belajar/${id}`);
        setStudyPlanData(response.data.data);
      } catch (err: unknown) {
        console.error("Failed to fetch study plan detail for feedback:", err);
        let errorMessage = "Gagal memuat hasil feedback rencana belajar. Silakan coba lagi.";

        if (axios.isAxiosError(err) && err.response) {
          const responseData = err.response.data as { message?: string };
          if (err.response.status === 404) {
            errorMessage = "Rencana belajar tidak ditemukan.";
          } else if (err.response.status === 401) {
            errorMessage = "Sesi Anda telah berakhir. Silakan login kembali.";
            localStorage.removeItem('AuthToken');
            localStorage.removeItem('userData');
            navigate('/login');
          } else if (responseData && responseData.message) {
            errorMessage = responseData.message;
          } else {
            errorMessage = `Error: ${err.response.status} - ${err.response.statusText}`;
          }
        } else if (err instanceof Error) {
          errorMessage = `Terjadi kesalahan: ${err.message}`;
        }
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudyPlanDetail();
  }, [id, navigate]);

  // Tampilkan loading state
  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm mx-auto text-center">
        <p className="text-gray-600">Memuat feedback rencana belajar...</p>
      </div>
    );
  }

  // Tampilkan error state
  if (error) {
    return (
      <div className="p-6 bg-red-100 border border-red-400 text-red-700 rounded-lg mx-auto text-center">
        <p>{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Kembali
        </button>
      </div>
    );
  }

  // Tampilkan pesan jika data tidak ditemukan (setelah loading dan tidak ada error)
  if (!studyPlanData) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm mx-auto text-center">
        <p className="text-gray-600">Rencana belajar atau feedback tidak ditemukan.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Kembali
        </button>
      </div>
    );
  }

  // --- PERBAIKAN: Olah data feedback untuk TabSkillCard ---
  const initialFeedbackData = {
    Structure: "Belum ada feedback untuk Structure.",
    Listening: "Belum ada feedback untuk Listening.",
    Reading: "Belum ada feedback untuk Reading.",
  };

  const processedFeedbackData = studyPlanData.feedback_rencana_belajar && studyPlanData.feedback_rencana_belajar.detail_feedback_rencana_belajar
    ? studyPlanData.feedback_rencana_belajar.detail_feedback_rencana_belajar.reduce((acc, item) => {
        // PERBAIKAN: Pastikan item.skill dan item.skill.namaSkill ada sebelum menggunakannya
        const skillName = item.skill?.namaSkill; 
        
        if (skillName) { // Hanya proses jika nama skill ada
            if (skillName.includes("Structure")) {
                acc.Structure = item.feedback;
            } else if (skillName.includes("Listening")) {
                acc.Listening = item.feedback;
            } else if (skillName.includes("Reading")) {
                acc.Reading = item.feedback;
            }
        }
        return acc;
      }, { ...initialFeedbackData }) // Mulai dengan nilai default
    : initialFeedbackData;

  // --- Pesan jika belum ada feedback ---
  const noFeedbackMessage = "Instruktur belum memberikan feedback untuk rencana belajar ini.";

  // Tampilkan pesan jika status belum ada feedback (status = pending, disetujui, ditolak)
  const showNoFeedbackYet = studyPlanData.status === 'pending' || studyPlanData.status === 'disetujui' || studyPlanData.status === 'ditolak';

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm mx-auto relative">
      <div className="flex gap-2 items-center">
        <button onClick={() => navigate(-1)} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
          <IoArrowBackCircleOutline size={30} color="#A80532" />
        </button>
        <div>
          <h3 className="text-[#A80532] font-bold text-xl">
            Detail Feedback Rencana Belajar
          </h3>
          <p className="text-[#8E8E8E] text-sm">
            Peserta dapat melihat detail hasil feedback yang telah ditinjau oleh instruktur.
          </p>
        </div>
      </div>
      
      {/* Tampilkan pesan jika belum ada feedback */}
      {showNoFeedbackYet ? (
        <div className="mt-6 p-4 border rounded-lg bg-blue-50 text-blue-800 text-center">
          <p>{noFeedbackMessage}</p>
        </div>
      ) : (
        <>
          <div className="mt-4">
            {/* Mengirimkan data feedback yang sudah diolah ke komponen TabSkillCard */}
            <TabSkillCard feedbackData={processedFeedbackData} />
          </div>

          {/* Menampilkan keterangan umum dari feedback instruktur jika ada */}
          {studyPlanData.feedback_rencana_belajar?.keterangan && (
            <div className="mt-6 p-4 border rounded-lg bg-gray-50">
              <h4 className="font-semibold text-lg text-gray-800">Catatan Tambahan dari Instruktur:</h4>
              <p className="text-gray-700 whitespace-pre-line">{studyPlanData.feedback_rencana_belajar.keterangan}</p>
            </div>
          )}
        </>
      )}

      {/* Anda mungkin juga ingin menampilkan ringkasan rencana belajar di sini */}
      <div className="mt-6 p-4 border rounded-lg bg-gray-50">
        <h4 className="font-semibold text-lg text-gray-800">Ringkasan Rencana Belajar:</h4>
        <p className="text-gray-700">Nama Rencana: {studyPlanData.namaRencana}</p>
        <p className="text-gray-700">Target Waktu: {studyPlanData.targetWaktu}</p>
        <p className="text-gray-700">Frekuensi Waktu (Jam per Hari): {studyPlanData.jamPerHari}</p>
        <p className="text-gray-700">Target Skor: {studyPlanData.targetSkor}</p>
        <p className="text-gray-700">Jumlah Hari per Minggu: {studyPlanData.hariPerMinggu}</p>
        <p className="text-gray-700">Status Persetujuan: {studyPlanData.status}</p>
        <p className="text-gray-700">Tanggal Pengajuan: {new Date(studyPlanData.tglPengajuan).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric'})}</p>
      </div>

    </div>
  );
};

export default StudentFeedback;
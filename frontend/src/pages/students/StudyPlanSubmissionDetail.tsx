// src/pages/student/StudyPlanSubmissionDetail.tsx
import React, { useEffect, useState } from "react";
import { useDashboardLayoutContext } from "../../layouts/DashboardLayout";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import { useNavigate, useParams } from "react-router-dom";
import axios, { AxiosError } from "axios";
import axiosInstance from "../../services/axios";

// --- Interface untuk struktur data Rencana Belajar DETAIL dari API ---
// Ini mencerminkan struktur objek PengajuanRencanaBelajar dari backend
interface StudyPlanDetailData {
  idPengajuanRencanaBelajar: number; // ID utama dari model PengajuanRencanaBelajar
  namaRencana: string;
  targetSkor: number;
  targetWaktu: string; // Contoh: "2 minggu", "1 bulan"
  hariPerMinggu: number; // Jumlah hari per minggu (dari 'frekuensi_mingguan' di store)
  jamPerHari: string; // Durasi per hari (dari 'durasi_harian' di store)
  tglPengajuan: string; // Tanggal pengajuan (ISO string atau YYYY-MM-DD HH:MM:SS)
  status: "pending" | "disetujui" | "ditolak" | "sudah ada feedback" | "selesai"; // Status persetujuan dari backend
  tanggalMulai?: string; // Opsional, jika ada di respons
  selesaiPada?: string; // Opsional, jika ada di respons
  idPeserta: number;
  idPengajuanSkorAwal: number;
  created_at: string;
  updated_at: string;

  // Relasi yang dimuat oleh controller
  detail_pengajuan_rencana_belajar: Array<{
    idDetailPengajuanRencanaBelajar: number;
    idPengajuanRencanaBelajar: number;
    idSkill: number;
    created_at: string;
    updated_at: string;
    skill: { // Objek skill di dalamnya
      idSkill: number;
      namaSkill: string; // Nama skill yang sebenarnya
      created_at: string;
      updated_at: string;
    };
  }>;
  feedback_rencana_belajar?: { // Relasi feedback, bisa null jika belum ada feedback
    idFeedbackRencanaBelajar: number;
    idPengajuanRencanaBelajar: number;
    idPegawai: number;
    keterangan: string; // Keterangan dari admin/instruktur
    created_at: string;
    updated_at: string;
    // detailFeedbackRencanaBelajar.skill juga dimuat, tapi mungkin tidak perlu ditampilkan di sini
  } | null;
}

const StudyPlanSubmissionDetail: React.FC = () => {
  const { setTitle, setSubtitle } = useDashboardLayoutContext();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); // Ambil ID dari URL (e.g., /student/rencana/detail/:id)

  const [studyPlanData, setStudyPlanData] = useState<StudyPlanDetailData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTitle("Detail Rencana Belajar");
    setSubtitle("Melihat detail rencana belajar yang telah diajukan.");
  }, [setTitle, setSubtitle]);

  // Effect untuk mengambil data detail rencana belajar
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
        // Endpoint GET detail: /peserta/rencana-belajar/{id}
        // Backend membungkus data dalam properti 'data'
        const response = await axiosInstance.get<{ data: StudyPlanDetailData }>(`/peserta/rencana-belajar/${id}`);
        setStudyPlanData(response.data.data); // Ambil objek data dari respons
        
      } catch (err: unknown) {
        console.error("Failed to fetch study plan detail:", err);
        let errorMessage = "Gagal memuat detail rencana belajar. Silakan coba lagi.";

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
  }, [id, navigate]); // Dependensi ID agar data di-fetch ulang jika ID berubah, dan navigate

  // Fungsi untuk memformat tanggal agar lebih mudah dibaca
  const formatDate = (dateString: string) => {
    try {
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      };
      return new Date(dateString).toLocaleDateString('id-ID', options);
    } catch (e) {
      console.error("Failed to format date:", dateString, e);
      return dateString; // Fallback to original string if formatting fails
    }
  };

  // Tampilkan loading state
  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm mx-auto text-center">
        <p className="text-gray-600">Memuat detail rencana belajar...</p>
      </div>
    );
  }

  // Tampilkan error state
  if (error) {
    return (
      <div className="p-6 bg-red-100 border border-red-400 text-red-700 rounded-lg mx-auto text-center">
        <p>{error}</p>
        <button
          onClick={() => navigate(-1)} // Kembali ke halaman sebelumnya
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
        <p className="text-gray-600">Rencana belajar tidak ditemukan.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Kembali
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm mx-auto relative">
      <div className="flex gap-2 items-center">
        <button onClick={() => navigate(-1)} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
          <IoArrowBackCircleOutline size={30} color="#A80532" />
        </button>
        <div>
          <h3 className="text-[#A80532] font-bold text-xl">
            Detail Pengajuan Rencana Belajar
          </h3>
          <p className="text-[#8E8E8E] text-sm">
            Hasil detail pengajuan rencana belajar yang telah diajukan.
          </p>
        </div>
      </div>

      <div className=" mt-5 flex justify-end">
        {/* Tombol Lihat Hasil Feedback */}
        {/* Muncul jika status adalah 'sudah ada feedback' atau 'selesai' */}
        {(studyPlanData.status === 'sudah ada feedback' || studyPlanData.status === 'selesai') && (
            <button
                onClick={() => navigate(`feedback`)} // Relatif ke URL saat ini: /student/rencana/detail/:id/feedback
                className="text-[#493BC0] font-medium border border-[#493BC0] px-4 py-2 rounded-lg hover:bg-[#493BC0]/10 transition"
            >
                Lihat Hasil Feedback
            </button>
        )}
      </div>

      {/* Form Tampilan Detail */}
      <div className="flex flex-col gap-5 mt-12">
        {/* Target Waktu */}
        <div>
          <label className="block font-semibold mb-1">Target Waktu</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none bg-gray-100 cursor-not-allowed"
            value={studyPlanData.targetWaktu} 
            readOnly
            disabled
          />
        </div>

        {/* Frekuensi Waktu (jam per hari) */}
        <div>
          <label className="block font-semibold mb-1">Frekuensi Waktu (Jam per Hari)</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none bg-gray-100 cursor-not-allowed"
            value={studyPlanData.jamPerHari} 
            readOnly
            disabled
          />
        </div>

        {/* Target Skor */}
        <div>
          <label className="block font-semibold mb-1">Target Skor</label>
          <input
            type="number"
            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none bg-gray-100 cursor-not-allowed"
            value={studyPlanData.targetSkor} 
            readOnly
            disabled
          />
        </div>

        {/* Berapa Waktu yang Diluangkan per-minggu (hari per minggu) */}
        <div>
          <label className="block font-semibold mb-1">
            Berapa hari waktu yang diluangkan per-minggu
          </label>
          <input
            type="number"
            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none bg-gray-100 cursor-not-allowed"
            value={studyPlanData.hariPerMinggu} 
            readOnly
            disabled
          />
        </div>

        {/* Status Persetujuan */}
        <div>
          <label className="block font-semibold mb-1">Status Persetujuan</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none bg-gray-100 cursor-not-allowed"
            value={studyPlanData.status} 
            readOnly
            disabled
          />
        </div>

        {/* Tanggal Pengajuan */}
        <div>
          <label className="block font-semibold mb-1">Tanggal Pengajuan</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none bg-gray-100 cursor-not-allowed"
            value={formatDate(studyPlanData.tglPengajuan)} 
            readOnly
            disabled
          />
        </div>
        
        {/* Skill yang Dipilih */}
        <div className="col-span-full">
          <label className="block font-semibold mb-1">Skill yang Dipilih</label>
          <ul className="list-disc list-inside bg-gray-100 p-4 rounded-md text-gray-800">
            {/* PERBAIKAN: Map dari relasi detail_pengajuan_rencana_belajar */}
            {studyPlanData.detail_pengajuan_rencana_belajar && studyPlanData.detail_pengajuan_rencana_belajar.length > 0 ? (
              studyPlanData.detail_pengajuan_rencana_belajar.map((detail, index) => (
                <li key={index}>{detail.skill.namaSkill}</li>
              ))
            ) : (
              <li>Tidak ada skill yang dipilih.</li>
            )}
          </ul>
        </div>

        {/* Keterangan Admin (jika ada) */}
        {/* PERBAIKAN: Akses keterangan dari relasi feedback_rencana_belajar */}
        {studyPlanData.feedback_rencana_belajar?.keterangan && (
          <div className="col-span-full">
            <label className="block font-semibold mb-1">Keterangan dari Admin/Instruktur</label>
            <textarea
              className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none bg-gray-100 cursor-not-allowed resize-y min-h-[100px]"
              value={studyPlanData.feedback_rencana_belajar.keterangan}
              readOnly
              disabled
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyPlanSubmissionDetail;
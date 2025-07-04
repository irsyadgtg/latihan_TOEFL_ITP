// src/pages/students/InitialScore.tsx
import React, { useEffect, useState } from "react";
import { useDashboardLayoutContext } from "../../layouts/DashboardLayout";
import Score from "../../components/Score";
import { useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";
import axiosInstance from "../../services/axios";
import { format, parseISO } from 'date-fns';
import { id as idLocale } from 'date-fns/locale'; 

// Definisikan interface untuk struktur data item skor dari API
// SESUAIKAN DENGAN NAMA FIELD YANG DIKEMBALIKAN OLEH CONTROLLER INDEX()
interface ScoreItemAPI {
  idPengajuanSkorAwal: number; // Dari backend: idPengajuanSkorAwal
  namaTes: string;            // Dari backend: namaTes
  skor: number;               // Dari backend: skor (integer)
  urlDokumenPendukung: string; // Dari backend: urlDokumenPendukung
  tglPengajuan: string;       // Dari backend: tglPengajuan (ISO string)
  status: string;             // Dari backend: status (Pending, Disetujui, Ditolak)
  masaBerlakuDokumen: string | null; // Dari backend: masaBerlakuDokumen (bisa null)
  keterangan: string | null;  // Dari backend: keterangan (bisa null)
}

const InitialScore: React.FC = () => {
  const { setTitle, setSubtitle } = useDashboardLayoutContext();
  const navigate = useNavigate();

  const [scoreList, setScoreList] = useState<ScoreItemAPI[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTitle("Pengajuan Skor Awal");
    setSubtitle(""); 
  }, [setTitle, setSubtitle]);

  useEffect(() => {
    const fetchScores = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Axios get type disesuaikan dengan respons controller index()
        const response = await axiosInstance.get<{ message: string; riwayat: ScoreItemAPI[] }>('/pengajuan-skor-awal'); 

        // --- PENGAMBILAN DATA SESUAI DENGAN STRUKTUR RESPON CONTROLLER INDEX() ---
        if (Array.isArray(response.data.riwayat)) {
            setScoreList(response.data.riwayat); 
            console.log("scoreList berhasil dimuat dari response.data.riwayat:", response.data.riwayat);
        } else {
            console.error("API response for /pengajuan-skor-awal is not an array in 'riwayat' property. Actual data:", response.data);
            setScoreList([]); // Pastikan scoreList selalu array
            setError("Format data riwayat dari server tidak sesuai.");
        }
        // --- AKHIR PENGAMBILAN DATA ---

      } catch (err: any) {
        console.error("Error fetching score list:", err);
        let errorMessage = "Gagal memuat daftar skor. Silakan coba lagi.";
        if (axios.isAxiosError(err) && err.response) {
          const responseData = err.response.data;
          if (err.response.status === 401) {
            errorMessage = "Sesi Anda telah berakhir. Silakan login kembali.";
            localStorage.removeItem('AuthToken');
            localStorage.removeItem('userData');
            navigate('/login');
          } else if (responseData && responseData.message) {
            errorMessage = responseData.message;
          } else {
            errorMessage = `Error: ${err.response.status} - ${err.response.statusText}`;
          }
        } else if (err.request) {
          errorMessage = "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.";
        } else {
          errorMessage = err.message || "Terjadi kesalahan tidak dikenal.";
        }
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchScores();
  }, [navigate]);

  const formatTanggalPengajuan = (dateString: string): string => {
    try {
      const date = parseISO(dateString);
      return format(date, 'dd MMMM yyyy, HH:mm', { locale: idLocale }); 
    } catch (e) {
      console.error("Failed to parse date:", dateString, e);
      return dateString;
    }
  };

  const getNamaHari = (dateString: string): string => {
    try {
      const date = parseISO(dateString);
      return format(date, 'EEEE', { locale: idLocale }); 
    } catch (e) {
      console.error("Failed to get day name:", dateString, e);
      return "";
    }
  };

  return (
    <div className="mt-4">
      <div className="flex justify-between items-start gap-4 flex-wrap">
        <p className="text-gray-600 text-sm leading-relaxed max-w-3xl">
          Silakan mengajukan skor tes bahasa Inggris terbaru kalian (EPRT, TOEFL
          ITP, dan sejenisnya). Belum punya skor tes acuan? Ikut EPRT dulu yuk
          supaya tahu kemampuanmu saat ini.
          <span className="text-[#493BC0] underline ml-1 cursor-pointer">
            <a href="https://smb.telkomuniversity.ac.id/daftar-toefl/?_gl=1*1ijiy9c*_gcl_au*MTE1NTc5ODk5NS4xNzUwMTY0MTkz*_ga*MTYxMDM2ODY4MC4xNzUwMTY0MDc2*_ga_0VSYWXVH4F*czE3NTAxNjQwODIkbzEkZzEkdDE3NTAxNjQyNDQkajgkbDAkaDAkZDdqdTFLOHE2T1NnUGpjaFNBUldGRllLSDhXZENuSU5RMmc.*_ga_43N69PWNNS*czE3NTAxNjQwODIkbzEkZzEkdDE3NTAxNjQyNDQkajgkbDAkaDAkZFFaQ2Q1NjJIbl9BQmYwb1Z6X1E2RFpnd2JXOHg1dUZVRkE.*_ga_4SWXWE0S8K*czE3NTAxNjQwODMkbzEkZzEkdDE3NTAxNjQyNDQkajM5JGwwJGgwJGQzU1NmTTNrdmo5bnMtdFJ6emFWd2x6dW8zSC1LeTJNYzJB" target="_blank" rel="noopener noreferrer">
              [link pendaftaran EPRT di LaC]
            </a>.
          </span>
        </p>
        <button
          onClick={() => navigate("create")}
          className="border border-[#493BC0] text-[#493BC0] font-medium px-4 py-2 rounded hover:bg-[#493BC0]/10 transition whitespace-nowrap"
        >
          Ajukan Skor Awal
        </button>
      </div>

      <div className="mt-6 space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <p className="text-gray-600 text-lg">Memuat daftar skor...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-md" role="alert">
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="mt-2 text-blue-700 underline">
              Coba Lagi
            </button>
          </div>
        ) : scoreList.length === 0 ? (
          <div className="flex justify-center items-center h-48">
            <p className="text-gray-600 text-lg">Belum ada pengajuan skor.</p>
          </div>
        ) : (
          scoreList.map((item) => (
            <Score
              key={item.idPengajuanSkorAwal} // ID harus sesuai dengan backend
              data={{
                name: item.namaTes, // Sesuaikan dengan nama field backend
                score: String(item.skor), 
                status: item.status, // Sesuaikan dengan nama field backend
                timestamp: `${getNamaHari(item.tglPengajuan)}, ${formatTanggalPengajuan(item.tglPengajuan)}`, // Sesuaikan dengan nama field backend
                masa_berlaku: item.masaBerlakuDokumen || '-', // Sesuaikan dengan nama field backend
                keterangan: item.keterangan || '-', 
              }}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default InitialScore;
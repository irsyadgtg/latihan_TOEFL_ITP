// src/pages/AdminView/SeleksiSkorAwal.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDashboardLayoutContext } from '../../layouts/DashboardLayout';
import axios, { AxiosError } from "axios"; // Import axios dan AxiosError
import axiosInstance from "../../services/axios"; // Pastikan path ini benar
import { format, parseISO } from 'date-fns'; // Import date-fns
import { id as idLocale } from 'date-fns/locale'; // Untuk nama hari/bulan dalam Bahasa Indonesia

// Definisikan interface untuk struktur data item skor dari API
// SESUAIKAN DENGAN NAMA FIELD YANG DIKEMBALIKAN OLEH CONTROLLER listForSeleksi()
interface ScoreItemAPI {
  id: number; // Dari backend: idPengajuanSkorAwal
  timestamp: string; // Dari backend: tglPengajuan
  namaLengkap: string;
  email: string;
  status: string; // "Pending", "Disetujui", "Ditolak"
  masaBerlakuDokumen: string | null; // Tanggal masa berlaku dokumen atau null
  keterangan: string | null; // Keterangan atau null
}

const SeleksiSkorAwal: React.FC = () => {
  const navigate = useNavigate();
  const { setTitle, setSubtitle } = useDashboardLayoutContext();

  const [scoreList, setScoreList] = useState<ScoreItemAPI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTitle("Seleksi Skor Awal");
    setSubtitle("Tinjau pengajuan skor awal peserta.");
  }, [setTitle, setSubtitle]);

  // --- Fetch Data Skor dari API ---
  useEffect(() => {
    const fetchScores = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Endpoint: /admin/pengajuan-skor-awal (sesuai permintaan Anda)
        // Axios get type disesuaikan dengan respons controller listForSeleksi()
        const response = await axiosInstance.get<{ message: string; data: ScoreItemAPI[] }>('/admin/pengajuan-skor-awal');
        
        // --- PENGAMBILAN DATA SESUAI DENGAN STRUKTUR RESPON CONTROLLER listForSeleksi() ---
        if (Array.isArray(response.data.data)) {
            setScoreList(response.data.data); 
            console.log("scoreList berhasil dimuat dari response.data.data:", response.data.data);
        } else {
            console.error("API response for /admin/pengajuan-skor-awal is not an array in 'data' property. Actual data:", response.data);
            setScoreList([]); // Pastikan scoreList selalu array
            setError("Format data daftar pengajuan dari server tidak sesuai.");
        }
        // --- AKHIR PENGAMBILAN DATA ---

      } catch (err: any) {
        console.error("Error fetching score list for selection:", err);
        let errorMessage = "Gagal memuat daftar pengajuan skor. Silakan coba lagi.";
        if (axios.isAxiosError(err) && err.response) {
          const responseData = err.response.data;
          if (err.response.status === 401) {
            errorMessage = "Sesi Anda telah berakhir. Silakan login kembali.";
            localStorage.removeItem('AuthToken');
            localStorage.removeItem('userData');
            navigate('/admin/login'); // Redirect ke login admin
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
  }, [navigate]); // navigate ditambahkan ke dependency array

  // Fungsi untuk memformat tanggal timestamp dari backend
  const formatTimestampDisplay = (dateStr: string): string => {
    try {
      const date = parseISO(dateStr); 
      // Contoh: "Kamis, 04 Juli 2024, 10:30"
      return format(date, 'EEEE, dd MMMM yyyy, HH:mm', { locale: idLocale }); 
    } catch (e) {
      console.error("Failed to parse timestamp:", dateStr, e);
      return dateStr; 
    }
  };

  // Fungsi untuk memformat masa berlaku dokumen (jika ada)
  const formatMasaBerlaku = (dateStr: string | null): string => {
    if (!dateStr) return '-';
    try {
      const date = parseISO(dateStr);
      return format(date, 'dd/MM/yyyy'); // Contoh: "20/12/2025"
    } catch (e) {
      console.error("Failed to parse masa berlaku date:", dateStr, e);
      return dateStr;
    }
  };


  return (
    <div className="space-y-4 mt-4">
      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <p className="text-gray-600 text-lg">Memuat daftar pengajuan...</p>
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
          <p className="text-gray-600 text-lg">Belum ada pengajuan skor awal.</p>
        </div>
      ) : (
        scoreList.map((item) => (
          <div
            key={item.id} // Menggunakan ID unik dari API
            className="border border-borderColor rounded-xl p-4 shadow-sm bg-white"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-center">
              {/* Kolom Nama Lengkap */}
              <div>
                <p className="text-gray-500 font-medium text-[12px]">
                  Nama Lengkap
                </p>
                <p className="font-semibold text-[16px]">{item.namaLengkap}</p>
              </div>
              {/* Kolom Email */}
              <div>
                <p className="text-gray-500 font-medium text-[12px]">Email</p>
                <p className="font-semibold text-[16px]">{item.email}</p>
              </div>
              {/* Kolom Status Pengajuan */}
              <div>
                <p className="text-gray-500 font-medium">Status Pengajuan</p>
                <p
                  className={`font-semibold ${
                    item.status === "Pending" ? 'text-yellow-600' : 
                    item.status === "Disetujui" ? 'text-green-600' : 
                    item.status === "Ditolak" ? 'text-red-600' : 'text-gray-800'
                  }`}
                >
                  {item.status}
                </p>
              </div>
              {/* Kolom Timestamp */}
              <div>
                <p className="text-gray-500 font-medium text-[12px]">
                  Timestamp Pengajuan
                </p>
                <p className="font-semibold text-[16px]">
                  {formatTimestampDisplay(item.timestamp)}
                </p>
              </div>
              {/* Kolom Masa Berlaku Dokumen */}
              <div>
                <p className="text-gray-500 font-medium text-[12px]">
                  Masa Berlaku Dokumen
                </p>
                <p className="font-semibold text-[16px]">
                  {formatMasaBerlaku(item.masaBerlakuDokumen)}
                </p>
              </div>
              {/* Kolom Keterangan */}
              <div>
                <p className="text-gray-500 font-medium text-[12px]">
                  Keterangan
                </p>
                <p className="font-semibold text-[16px]">{item.keterangan || '-'}</p>
              </div>
              {/* Tombol Seleksi */}
              <div>
                {/* ID yang diteruskan adalah item.id dari API, yang merupakan idPengajuanSkorAwal */}
                <button 
                  onClick={() => navigate(`/admin/seleksi-skor/detail-pengajuan/${item.id}`)} 
                  className="px-5 py-2 border border-blue-500 rounded-md font-semibold text-blue-500 bg-white hover:bg-blue-50">
                  Seleksi
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default SeleksiSkorAwal;
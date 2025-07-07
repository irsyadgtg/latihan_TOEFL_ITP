import React, { useEffect, useState } from "react";
import { useDashboardLayoutContext } from "../../layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import StudyPlan from "../../components/StudyPlan"; // Import komponen StudyPlan
import axios from "axios";
import axiosInstance from "../../services/axios"; // Path relatif yang benar
import { IoAddCircleOutline } from "react-icons/io5"; // Hanya perlu ikon tambah untuk tombol Ajukan

// Definisikan interface untuk satu item Rencana Belajar dari array 'riwayat'
interface StudyPlanListItem {
  idPengajuanRencanaBelajar: number; // ID unik
  namaRencana: string; // Contoh: "Rencana Belajar TOEFL - 03 July 2025 - Target Skor 500"
  targetSkor: number;
  targetWaktu: string; // Contoh: "3 minggu"
  hariPerMinggu: number;
  jamPerHari: string; // Contoh: "<2 jam"
  tglPengajuan: string; // Format tanggal ISO string
  status: "pending" | "Disetujui" | "Ditolak" | "sudah ada feedback" | "selesai"; // Status
  tanggalMulai: string; // ISO string
  selesaiPada: string; // ISO string
  detail_pengajuan_rencana_belajar: { skill: { idSkill: number; namaSkill: string; deskripsi: string; } }[];
  // Tambahkan properti lain jika ada dari API yang relevan dengan rencana belajar
}

// Definisikan interface untuk keseluruhan respons dari /peserta/rencana-belajar
interface StudyPlanListApiResponse {
  message: string;
  boleh_mengajukan: boolean;
  skor_awal: { // Mengikuti struktur skor_awal dari respons yang Anda berikan
    idPengajuanSkorAwal: number;
    idPeserta: number;
    idPegawai: number;
    skor: number; // Ini skor awal yang sebenarnya
    namaTes: string;
    tglSeleksi: string;
    masaBerlakuDokumen: string;
    urlDokumenPendukung: string;
    status: string;
    keterangan: string | null;
    created_at: string;
    updated_at: string;
  } | null;
  riwayat: StudyPlanListItem[];
}

const StudyPlanSubmission: React.FC = () => {
  const { setTitle, setSubtitle } = useDashboardLayoutContext();
  const navigate = useNavigate();

  // Deklarasi state yang dibutuhkan
  const [studyPlans, setStudyPlans] = useState<StudyPlanListItem[]>([]);
  const [bolehMengajukan, setBolehMengajukan] = useState<boolean>(false);
  const [skorAwalMessage, setSkorAwalMessage] = useState<string>("");
  const [initialScoreFromApi, setInitialScoreFromApi] = useState<number | undefined>(undefined); // State untuk skor awal dari API
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTitle("Pengajuan Rencana Belajar"); // Mengikuti judul dari kode contoh Anda
    setSubtitle("Rencana Studi untuk belajar"); // Mengikuti subtitle dari kode contoh Anda
    fetchStudyPlans();
  }, [setTitle, setSubtitle, navigate]);

  const fetchStudyPlans = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.get<StudyPlanListApiResponse>('/peserta/rencana-belajar');

      if (response.data && Array.isArray(response.data.riwayat)) {
        setStudyPlans(response.data.riwayat);
        setBolehMengajukan(response.data.boleh_mengajukan);
        setSkorAwalMessage(response.data.message);
        
        // Set initial score if available in skor_awal
        if (response.data.skor_awal && typeof response.data.skor_awal.skor === 'number') {
          setInitialScoreFromApi(response.data.skor_awal.skor);
        } else {
          setInitialScoreFromApi(undefined); // Reset jika tidak ada atau bukan angka
        }

        console.log("Study plans loaded:", response.data.riwayat);
        console.log("Boleh mengajukan:", response.data.boleh_mengajukan);
        console.log("Pesan Skor Awal:", response.data.message);
      } else {
        console.error("API response for /peserta/rencana-belajar is not in expected format:", response.data);
        setStudyPlans([]);
        setError("Format data riwayat dari server tidak sesuai.");
      }
    } catch (err: unknown) {
      console.error("Failed to fetch study plans:", err);
      if (axios.isAxiosError(err)) {
        const responseData = err.response?.data;
        if (err.response?.status === 500) {
          setError("Terjadi masalah di server. Mohon coba lagi nanti atau hubungi administrator.");
          if (responseData && typeof responseData === 'object' && 'message' in responseData) {
             setError(`Server Error: ${responseData.message}`);
          }
        } else if (err.response?.status === 401) {
          setError("Sesi Anda telah berakhir atau tidak valid. Silakan login kembali.");
          localStorage.removeItem('AuthToken');
          localStorage.removeItem('userData');
          navigate('/login');
        } else if (responseData && typeof responseData === 'object' && 'message' in responseData) {
          setError(responseData.message);
        } else {
          setError(`Terjadi kesalahan: ${err.response?.status} ${err.response?.statusText || 'Error'}`);
        }
      } else if (err instanceof Error) {
        setError(`Terjadi kesalahan: ${err.message}`);
      } else {
        setError("Terjadi kesalahan tidak terduga.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    navigate("/student/rencana/create"); // Rute ke halaman pengajuan baru
  };

  // const handleEdit = (id: number) => {
  //   navigate(`/student/rencana/edit/${id}`); // Rute ke halaman edit
  // };

  const handleViewDetail = (id: number) => {
    navigate(`/student/rencana/detail/${id}`); // Rute ke halaman detail
  };

  return (
    <div className="mt-4">
      {/* Bagian header (pesan info + tombol Ajukan) */}
      <div className="flex justify-between items-start gap-4 flex-wrap">
        <p className="text-gray-600 text-sm leading-relaxed max-w-3xl">
          Berikut adalah riwayat pengajuan rencana belajar Anda. Anda dapat mengajukan rencana baru jika diperlukan dan memenuhi syarat.
        </p>
        {bolehMengajukan && ( // Hanya tampilkan jika bolehMengajukan true
          <button
            onClick={handleCreateNew}
            className="border border-[#493BC0] text-[#493BC0] font-medium px-4 py-2 rounded hover:bg-[#493BC0]/10 transition whitespace-nowrap flex items-center gap-2"
          >
            <IoAddCircleOutline size={20} /> Ajukan Rencana Belajar
          </button>
        )}
      </div>

      {/* Pesan tentang skor awal jika tidak boleh mengajukan */}
      {!bolehMengajukan && skorAwalMessage && (
        <p className="text-sm text-yellow-800 bg-yellow-100 p-3 rounded-md mb-4 mt-4">
          {skorAwalMessage}
        </p>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center h-48">
          <p className="text-gray-600 text-lg">Memuat rencana belajar...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading ? (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-md mt-4" role="alert">
          <p>{error}</p>
          <button onClick={fetchStudyPlans} className="mt-2 text-blue-700 underline">
            Coba Lagi
          </button>
        </div>
      ) : null} {/* Tambahkan null untuk menghindari error rendering kosong */}

      {/* Display Study Plans */}
      {!loading && !error && (
        <div className="mt-6 space-y-4">
          {studyPlans.length > 0 ? (
            studyPlans.map((item) => (
              <StudyPlan
                key={item.idPengajuanRencanaBelajar} // Gunakan ID unik dari API
                data={item}
                onViewDetail={handleViewDetail}
                initialScore={initialScoreFromApi} // Pass skor awal dari API
              />
            ))
          ) : (
            <div className="flex justify-center items-center h-48">
              <p className="text-gray-600 text-lg">Belum ada rencana belajar yang diajukan.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudyPlanSubmission;
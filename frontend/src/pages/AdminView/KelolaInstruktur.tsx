// src/pages/admin/KelolaInstruktur.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import InstructorCardAdmin from "../../components/InstructorCardAdmin"; 
import { useDashboardLayoutContext } from '../../layouts/DashboardLayout';
import axiosInstance from "../../services/axios";
import DefaultAvatar from "../../assets/image/card1.jpeg"; 
import axios, { AxiosError } from "axios";

// icons
import { Plus } from "lucide-react";

// Interface untuk data yang diterima dari API (InstrukturController::daftarInstrukturAdmin)
interface InstrukturAPIResponse {
  idPegawai: number; 
  namaLengkap: string; 
  status: string; // 'aktif' atau 'nonaktif' dari backend
  urlFotoProfil: string | null; 
  email: string; 
  username: string; 
  idInstruktur: number; 
  keahlian: string; 
  tglKetersediaan: string;
  waktuMulai: string;
  waktuBerakhir: string;
}

export default function KelolaInstruktur() {
  const navigate = useNavigate();
  const { setTitle, setSubtitle } = useDashboardLayoutContext();

  const [instrukturList, setInstrukturList] = useState<InstrukturAPIResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null); 

  // Fungsi ini dipanggil oleh InstructorCardAdmin setelah PATCH berhasil
  const handleInstructorDeletionSuccess = (deletedId: number) => {
    // --- DIAGNOSTIK DAN PEMBARUAN LOKAL ---
    console.log(`[KelolaInstruktur] handleInstructorDeletionSuccess dipanggil untuk ID: ${deletedId}`);

    // 1. Perbarui status instruktur secara lokal di daftar SEGERA
    setInstrukturList(prevList => {
      const updatedList = prevList.map(inst => 
        inst.idPegawai === deletedId ? { ...inst, status: 'nonaktif' } : inst
      );
      console.log("[KelolaInstruktur] State lokal diperbarui. Status baru instruktur (jika ada):", updatedList.find(inst => inst.idPegawai === deletedId)?.status);
      return updatedList;
    });

    // 2. Tampilkan pesan sukses global
    setSuccessMessage(`Instruktur berhasil dinonaktifkan.`);
    setTimeout(() => setSuccessMessage(null), 3000); // Hapus pesan setelah 3 detik

    // 3. Panggil ulang fetchInstrukturs untuk mendapatkan data terbaru dari server
    //    Gunakan delay untuk memberi waktu database update dan user melihat pesan sukses lokal
    setTimeout(() => {
        console.log("[KelolaInstruktur] Memicu refresh data penuh dari API setelah 1 detik...");
        fetchInstrukturs();
    }, 1000); // Refresh setelah 1 detik
  };

  useEffect(() => {
    setTitle("Kelola Instruktur");
    setSubtitle("Tambah dan kelola data instruktur.");
  }, [setTitle, setSubtitle]);

  // Fungsi utama untuk mengambil daftar instruktur dari API
  const fetchInstrukturs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get<{data: InstrukturAPIResponse[]}>('/admin/instruktur');
      
      setInstrukturList(response.data.data || response.data); 
      console.log("[KelolaInstruktur] Data instruktur setelah fetch API:", response.data.data || response.data);

    } catch (err: unknown) {
      console.error("[KelolaInstruktur] Error fetching instruktur list:", err);
      let errorMessage = "Gagal memuat daftar instruktur. Silakan coba lagi.";
      if (axios.isAxiosError(err)) {
        if (err.response) {
          if (err.response.status === 401 && (err.response.data as any)?.message === 'Unauthenticated.') {
            errorMessage = "Sesi Anda telah berakhir. Silakan login kembali.";
            localStorage.removeItem('AuthToken');
            navigate('/admin/login');
          } else if (err.response.data && typeof err.response.data === 'object' && 'message' in err.response.data) {
            errorMessage = err.response.data.message as string;
          } else {
            errorMessage = `Terjadi kesalahan: ${err.response.status} ${err.response.statusText || 'Error'}`;
          }
        } else if (err.request) {
          errorMessage = "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.";
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInstrukturs();
  }, []); 

  // Fungsi untuk menangani klik pada InstructorCard (untuk navigasi ke ubah ketersediaan)
  const handleCardClick = (idPegawai: number) => {
    navigate(`/admin/kelola-instruktur/ubah-ketersediaan/${idPegawai}`);
  };

  // Fungsi untuk memformat waktu ketersediaan (HH:MM - HH:MM)
  const formatAvailabilityTime = (tgl: string, mulai: string, berakhir: string): string => {
    if (!tgl || !mulai || !berakhir) return "Tidak tersedia";
    return `${mulai.substring(0, 5)} - ${berakhir.substring(0, 5)}`;
  };

  return (
    <div className="mt-4">
      <div className="flex justify-end items-center mb-4">
        <button
          onClick={() => navigate("/admin/kelola-instruktur/tambah")}
          className="flex p-2 items-center text-[18px] border border-blue-500 rounded-[10px] text-blue-500 hover:bg-blue-50"
        >
          <Plus className="mr-1" />
          <span>Tambah Instruktur</span>
        </button>
      </div>

      {/* Pesan Sukses Global (akan tampil di atas grid) */}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          {successMessage}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <p className="text-gray-600 text-lg">Memuat daftar instruktur...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-md" role="alert">
          <p>{error}</p>
          <button
            onClick={fetchInstrukturs} 
            className="mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
          >
            Coba Lagi
          </button>
        </div>
      ) : instrukturList.length === 0 ? (
        <div className="flex justify-center items-center h-48">
          <p className="text-gray-600 text-lg">Belum ada data instruktur.</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {instrukturList.map((instruktur) => {
            const imageUrl = instruktur.urlFotoProfil
              ? `http://127.0.0.1:8000/storage/${instruktur.urlFotoProfil}` 
              : DefaultAvatar;

            return (
              <InstructorCardAdmin 
                key={`${instruktur.idPegawai}-${instruktur.email}`} 
                idPegawai={instruktur.idPegawai} 
                image={imageUrl}
                name={instruktur.namaLengkap}
                skill={instruktur.keahlian} 
                availability={formatAvailabilityTime(instruktur.tglKetersediaan, instruktur.waktuMulai, instruktur.waktuBerakhir)} 
                status={instruktur.status} 
                onDeleteSuccess={handleInstructorDeletionSuccess} 
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import InstructorCardAdmin from '../../components/ui/card/InstructorCard'; // Pastikan path ini benar
import { useDashboardLayoutContext } from '../../layouts/DashboardLayout'; 
import axiosInstance from '../../services/axios'; 
import axios, { AxiosError } from 'axios'; 
import DefaultAvatar from "../../assets/image/card1.jpeg"; // Pastikan path ini benar!

// icons
import { Plus } from "lucide-react";

// Definisikan interface untuk struktur data Instruktur dari API
// SESUAI DENGAN respons InstrukturController::daftarInstrukturAdmin atau daftarAktif
interface InstructorData { // PERBAIKAN: Ganti nama interface dari Instructor menjadi InstructorData
  idPegawai: number; // Digunakan untuk 'idPegawai' prop di InstructorCardAdmin dan key
  namaLengkap: string; 
  status: string; // Misal: 'aktif' atau 'nonaktif'
  urlFotoProfil: string | null; 
  email: string; // Penting untuk composite key jika idPegawai duplikat
  username: string;
  // idInstruktur: number; // Tidak digunakan sebagai prop di InstructorCardAdmin
  keahlian: string; // Properti 'keahlian' dari respons API
  tglKetersediaan: string; // Digunakan untuk format ketersediaan
  waktuMulai: string; // Digunakan untuk format ketersediaan
  waktuBerakhir: string; // Digunakan untuk format ketersediaan
  // Tambahkan properti lain yang mungkin ada dari API, sesuai kebutuhan Admin/Instruktur
}

const InstructorPage: React.FC = () => { // PERBAIKAN: Sesuaikan nama komponen
  const [instrukturList, setInstrukturList] = useState<InstructorData[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // selectedInstructorId tidak digunakan di sini untuk highlight, bisa dihapus jika tidak ada fungsionalitasnya
  // const [selectedInstructorId, setSelectedInstructorId] = useState<number | null>(null); 

  const { setTitle, setSubtitle } = useDashboardLayoutContext();
  const navigate = useNavigate(); 

  useEffect(() => {
    setTitle("Daftar Instruktur");
    setSubtitle("Pilih instruktur yang sesuai dengan kebutuhan Anda."); // Subtitle untuk instruktur/admin
  }, [setTitle, setSubtitle]);

  // Fungsi untuk memicu refresh daftar instruktur setelah aksi (misal, nonaktifkan)
  const handleInstructorUpdateSuccess = (updatedIdPegawai: number) => {
    // Memperbarui status instruktur di daftar lokal (tanpa perlu fetch ulang semua data)
    setInstrukturList(prevList => prevList.map(inst =>
      inst.idPegawai === updatedIdPegawai ? { ...inst, status: inst.status === 'aktif' ? 'nonaktif' : 'aktif' } : inst
    ));
    // Alternatif: panggil fetchInstrukturs() untuk mendapatkan data terbaru dari server
    // fetchInstrukturs();
  };

  const fetchInstrukturs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // ✅ Mengambil data dari endpoint /instruktur/daftar-instruktur
      // Asumsi respons adalah { data: [array_instruktur], ... }
      const response = await axiosInstance.get<{ data: InstructorData[] }>('/peserta/daftar-instruktur');
      
      setInstrukturList(response.data.data || []); // Mengakses array instruktur dari properti 'data'

      // DEBUGGING: Cetak respons untuk verifikasi
      console.log("API Response for instructors list:", response.data); 

    } catch (err) {
      console.error("Error fetching instruktur list:", err);
      let errorMessage = "Gagal memuat daftar instruktur. Silakan coba lagi.";
      if (axios.isAxiosError(err)) {
        if (err.response) {
          if (err.response.status === 401 && (err.response.data as any)?.message === 'Unauthenticated.') {
            errorMessage = "Sesi Anda telah berakhir atau tidak valid. Silakan login kembali.";
            localStorage.removeItem('AuthToken');
            navigate('/login'); // Arahkan ke login yang sesuai (instruktur/admin)
          } else if (err.response.status === 403) {
            errorMessage = "Anda tidak memiliki izin untuk melihat daftar instruktur ini.";
          }
          else if (err.response.data && typeof err.response.data === 'object' && 'message' in err.response.data) {
            errorMessage = err.response.data.message as string;
          } else {
            errorMessage = `Terjadi kesalahan: ${err.response.status} ${err.response.statusText || 'Error'}`;
          }
        } else if (err.request) {
          errorMessage = "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.";
        }
      } else {
        errorMessage = "Terjadi kesalahan tidak terduga.";
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInstrukturs();
  }, []); // Dependensi kosong agar hanya dimuat sekali saat mount

  // Fungsi untuk memformat waktu ketersediaan (HH:MM - HH:MM)
  const formatAvailabilityTime = (tglKetersediaan: string, waktuMulai: string, waktuBerakhir: string): string => {
    if (!tglKetersediaan || !waktuMulai || !waktuBerakhir) return "Tidak tersedia";
    // Menggabungkan waktu dan tanggal jika diperlukan
    const tanggal = new Date(tglKetersediaan).toLocaleDateString('id-ID', {day: '2-digit', month: '2-digit', year: 'numeric'});
    const mulai = waktuMulai.substring(0, 5);
    const berakhir = waktuBerakhir.substring(0, 5);
    return `${tanggal}, ${mulai} - ${berakhir}`;
  };

  // Fungsi untuk menangani klik pada InstructorCard (untuk navigasi ke ubah ketersediaan)
  const handleCardClick = (idPegawai: number) => {
    // setSelectedIndex(idPegawai); // Tidak digunakan untuk visual highlight di sini
    navigate(`/admin/kelola-instruktur/ubah-ketersediaan/${idPegawai}`);
  };

  return (
    <div className="mt-4">
      <div className="flex justify-end items-center mb-4">
      </div>

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
              ? `http://127.0.0.1:8000/storage/${instruktur.urlFotoProfil}` // Pastikan URL storage ini benar
              : DefaultAvatar;

            return (
              <InstructorCardAdmin 
                key={`${instruktur.idPegawai}-${instruktur.email}`} // Gunakan composite key untuk keunikan
                idPegawai={instruktur.idPegawai} 
                image={imageUrl}
                name={instruktur.namaLengkap}
                skill={instruktur.keahlian} // Meneruskan 'keahlian'
                availability={formatAvailabilityTime(instruktur.tglKetersediaan, instruktur.waktuMulai, instruktur.waktuBerakhir)} 
                status={instruktur.status} // Meneruskan status
                onDeleteSuccess={handleInstructorUpdateSuccess} // Meneruskan callback
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InstructorPage;
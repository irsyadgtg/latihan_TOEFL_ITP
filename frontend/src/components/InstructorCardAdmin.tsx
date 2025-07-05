// src/components/InstructorCardAdmin.tsx
import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../services/axios";
import axios, { AxiosError } from "axios";

// Definisikan props untuk InstructorCardAdmin
export interface InstructorCardAdminProps {
  idPegawai: number; // ID Pegawai, untuk aksi admin
  image: string;
  name: string;
  skill: string; // Keahlian instruktur
  availability: string; // Ketersediaan waktu
  status: string; // Status 'aktif'/'nonaktif'
  onDeleteSuccess: (deletedId: number) => void; // Callback setelah nonaktif berhasil
}

// --- KOMPONEN DeleteConfirmationModal DIHAPUS DARI FILE INI ---
// Jika Anda ingin menggunakannya di tempat lain, pindahkan definisinya
// ke file terpisah atau tempat yang lebih global.
// ---

const InstructorCardAdmin: React.FC<InstructorCardAdminProps> = ({
  idPegawai,
  image,
  name,
  skill,
  availability,
  status, // Status 'aktif'/'nonaktif'
  onDeleteSuccess
}) => {
  const navigate = useNavigate();
  // State showModal tidak lagi diperlukan
  // const [showModal, setShowModal] = useState(false); 
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fungsi handleNonaktif sekarang dipanggil langsung
  const handleNonaktif = async () => {
    setIsSubmitting(true);
    setDeleteError(null);
    setDeleteSuccess(null);
    try {
      console.log(`[InstructorCardAdmin] Mengirim PATCH /admin/instruktur/${idPegawai}/nonaktif`);
      const response = await axiosInstance.patch(`/admin/instruktur/${idPegawai}/nonaktif`);
      setDeleteSuccess(response.data.message || 'Instruktur berhasil dinonaktifkan.');
      onDeleteSuccess(idPegawai); 
      console.log(`[InstructorCardAdmin] PATCH berhasil:`, response.data);
      // Tidak ada lagi setTimeout untuk menutup modal karena tidak ada modal
      // setTimeout(() => setShowModal(false), 1500); 
    } catch (err) {
      console.error(`[InstructorCardAdmin] Gagal menonaktifkan instruktur ${idPegawai}:`, err);
      if (axios.isAxiosError(err)) {
        if (err.response) {
          if (err.response.status === 401) {
            setDeleteError("Sesi Anda berakhir. Silakan login kembali.");
            localStorage.removeItem('AuthToken');
            navigate('/admin/login');
          } else if (err.response.data && err.response.data.message) {
            setDeleteError(err.response.data.message);
          } else {
            setDeleteError(`Gagal menonaktifkan: ${err.response.status} ${err.response.statusText || 'Error'}`);
          }
        } else if (err.request) {
          setDeleteError("Tidak dapat terhubung ke server. Periksa koneksi Anda.");
        } else {
          setDeleteError("Terjadi kesalahan saat mengatur permintaan.");
        }
      } else {
        setDeleteError("Terjadi kesalahan tidak terduga.");
      }
      // Tidak ada lagi setTimeout untuk menutup modal
      // setTimeout(() => setShowModal(false), 2000); 
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusClass = (status: string) => {
    return status === 'aktif' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="w-full border border-gray-200 rounded-xl shadow-sm p-4 flex flex-col items-stretch">
      <img
        src={image}
        alt={name}
        className="w-full h-auto object-cover rounded-md mb-4 self-center"
      />

      <div className="text-justify flex-grow space-y-1">
        <h2 className="text-[20px] font-semibold">{name}</h2>
        <p className="text-[16px] text-gray-500">Keahlian: {skill}</p>
        <p className="text-[16px] text-gray-500">Ketersediaan: {availability}</p>
        <p className={`text-[16px] font-medium ${getStatusClass(status)}`}>Status: {status.charAt(0).toUpperCase() + status.slice(1)}</p>
      </div>

      {/* Button Aksi untuk Admin */}
      <div className="mt-4 flex gap-2 justify-between">
        <button
          onClick={() => navigate(`/admin/kelola-instruktur/ubah-ketersediaan/${idPegawai}`)}
          className="flex-1 text-sm border border-blue-500 text-blue-500 px-3 py-1 rounded hover:bg-blue-50 transition"
        >
          Ubah Ketersediaan
        </button>
        <button
          onClick={handleNonaktif} // PENTING: Panggil langsung handleNonaktif
          className="flex-1 text-sm text-center border border-red-500 text-red-500 px-3 py-1 rounded hover:bg-red-50 transition flex items-center justify-center gap-1"
          disabled={isSubmitting} 
        >
          {isSubmitting ? 'Memproses...' : <> <Trash2 className="w-4 h-4" />  </>}
        </button>
      </div>

      {/* Pesan Error/Sukses di dalam kartu */}
      {deleteError && (
        <div className="text-red-500 text-sm mt-2 text-center">{deleteError}</div>
      )}
      {deleteSuccess && (
        <div className="text-green-600 text-sm mt-2 text-center">{deleteSuccess}</div>
      )}

      {/* Komponen DeleteConfirmationModal telah dihapus dari sini */}
      {/* <DeleteConfirmationModal ... /> */}
    </div>
  );
};

export default InstructorCardAdmin;
// src/components/InstructorGrid.tsx
import React, { useEffect, useState } from "react";
import InstructorCard from "./InstructorCardAdmin"; // Pastikan path ini benar
import axiosInstance from "../services/axios"; // Pastikan path ini benar
import axios, { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { useDashboardLayoutContext } from "../layouts/DashboardLayout"; 

// Definisikan interface untuk struktur data instruktur dari API
// SESUAI DENGAN respons API yang Anda berikan sebelumnya
interface InstructorData {
  idPegawai: number; 
  namaLengkap: string; 
  status: string; 
  urlFotoProfil: string | null; 
  email: string; 
  username: string; 
  idInstruktur: number; 
  keahlian: string; // Properti 'keahlian' dari respons API
  tglKetersediaan: string; 
  waktuMulai: string; 
  waktuBerakhir: string; 
}

const InstructorGrid: React.FC = () => {
  const navigate = useNavigate();
  const { setTitle, setSubtitle } = useDashboardLayoutContext(); 

  const [instructors, setInstructors] = useState<InstructorData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInstructorId, setSelectedInstructorId] = useState<number | null>(null); 

  // Effect untuk mengatur judul dan subjudul halaman
  useEffect(() => {
    setTitle("Daftar Instruktur");
    setSubtitle("Lihat daftar instruktur yang tersedia dan aktif.");
  }, [setTitle, setSubtitle]); 

  useEffect(() => {
    fetchInstructors();
  }, []);

  const fetchInstructors = async () => {
    setLoading(true);
    setError(null);
    try {
      // ✅ Mengambil data dari endpoint /peserta/daftar-instruktur
      // PERBAIKAN PENTING: Asumsi API mengembalikan objek dengan properti 'data' yang berisi array
      const response = await axiosInstance.get<{ data: InstructorData[] }>('/peserta/daftar-instruktur');
      
      // --- Ini adalah baris yang menyebabkan TypeError sebelumnya ---
      // PASTIKAN Anda mengakses 'response.data.data'
      setInstructors(response.data.data || []); 

      // --- DEBUGGING: Cetak respons lengkap di konsol untuk verifikasi ---
      console.log("API Response for instructors:", response.data);
      console.log("Instructors data after processing:", response.data.data);

    } catch (err) {
      console.error("Failed to fetch instructors:", err);
      if (axios.isAxiosError(err)) {
        if (err.response) {
          if (err.response.status === 401 && (err.response.data as any)?.message === 'Unauthenticated.') {
            setError("Sesi Anda telah berakhir. Silakan login kembali.");
            localStorage.removeItem('AuthToken');
            navigate('/login');
          } else if (err.response.data && typeof err.response.data === 'object' && 'message' in err.response.data) {
            setError(err.response.data.message as string);
          } else {
            setError(`Terjadi kesalahan: ${err.response.status} ${err.response.statusText || 'Error'}`);
          }
        } else if (err.request) {
          setError("Tidak dapat terhubung ke server. Pastikan koneksi internet Anda aktif atau server sedang berjalan.");
        } else {
          setError("Terjadi kesalahan saat mengatur permintaan. Silakan coba lagi.");
        }
      } else {
        setError("Terjadi kesalahan tidak terduga.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk menggabungkan waktu mulai dan berakhir menjadi string "HH:MM - HH:MM"
  const formatAvailabilityTime = (waktuMulai: string, waktuBerakhir: string): string => {
    const mulai = waktuMulai ? waktuMulai.substring(0, 5) : 'N/A';
    const berakhir = waktuBerakhir ? waktuBerakhir.substring(0, 5) : 'N/A';
    return `${mulai} - ${berakhir}`;
  };

  const handleInstructorClick = (instructorId: number) => { 
    setSelectedInstructorId(instructorId); 
    // Anda bisa menambahkan logika lain di sini, misalnya navigasi ke detail instruktur
    // navigate(`/peserta/instruktur/${instructorId}`); 
  };

  // Tampilkan loading state
  if (loading) {
    return (
      <div className="mt-4 p-6 rounded-lg bg-white text-center text-gray-600">
        Memuat daftar instruktur...
      </div>
    );
  }

  // Tampilkan error state
  if (error) {
    return (
      <div className="mt-4 p-6 rounded-lg bg-red-100 border border-red-400 text-red-700 text-center">
        <p>{error}</p>
        <button
          onClick={fetchInstructors}
          className="mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  // Tampilkan pesan jika tidak ada instruktur
  if (instructors.length === 0) {
    return (
      <div className="mt-4 p-6 rounded-lg bg-white text-center text-gray-500">
        Tidak ada instruktur aktif yang ditemukan.
      </div>
    );
  }

  return (
    <div className="mx-auto p-6 rounded-lg bg-white mt-4">
      {/* Grid Instruktur */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {instructors.map((instructor) => (
          <InstructorCard
            key={instructor.idPegawai} 
            image={instructor.urlFotoProfil || `https://ui-avatars.com/api/?name=${encodeURIComponent(instructor.namaLengkap || 'Instruktur')}&background=random`}
            name={instructor.namaLengkap} 
            skill={instructor.keahlian} // Menggunakan properti 'keahlian'
            availability={formatAvailabilityTime(instructor.waktuMulai, instructor.waktuBerakhir)}
            selected={selectedInstructorId === instructor.idPegawai}
            onClick={() => handleInstructorClick(instructor.idPegawai)}
          />
        ))}
      </div>
    </div>
  );
};

export default InstructorGrid;
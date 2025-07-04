// src/pages/AdminView/KelolaInstruktur/UbahKetersediaan.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from "../../../services/axios";
import FotoProfile from "../../../assets/image/foto.png"; // Pastikan path ini benar
import { useDashboardLayoutContext } from '../../../layouts/DashboardLayout';

// icons
import { ChevronDown } from "lucide-react"; 

interface InstrukturData {
  nama_lengkap: string;
  username: string;
  email: string;
  ketersediaan_mulai: string;
  ketersediaan_berakhir: string;
  tanggal_ketersediaan: string;
  keahlian: string;
  foto_profil_url?: string;
}

interface BackendError {
  message?: string;
  errors?: { [key: string]: string[] };
}

export default function UbahKetersediaan() {
  const { idPegawai } = useParams<{ idPegawai: string }>();
  const navigate = useNavigate();
  const { setTitle, setSubtitle } = useDashboardLayoutContext();

  const [formData, setFormData] = useState<InstrukturData>({
    nama_lengkap: '',
    username: '',
    email: '',
    ketersediaan_mulai: '08:00',
    ketersediaan_berakhir: '16:00',
    tanggal_ketersediaan: '',
    keahlian: '',
    foto_profil_url: FotoProfile,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const availableTimes = Array.from({ length: 14 }, (_, i) => `${(i + 8).toString().padStart(2, '0')}:00`);
  const skills = ["TOEFL ITP Training", "TOEFL ITP Reading & Vocabulary", "TOEFL ITP Grammar & Writing", "Structure Written", "Listening", "Reading", "Speaking", "Writing", "Grammar"];

  useEffect(() => {
    setTitle("Ubah Ketersediaan");
    setSubtitle("Kelola detail profil dan jadwal instruktur.");
  }, [setTitle, setSubtitle]);

  useEffect(() => {
    const fetchInstrukturData = async () => {
      setIsLoading(true);
      setFetchError(null); 
      setSuccessMessage(null); 
      setError(null); 

      try {
        if (!idPegawai) {
          setFetchError("ID instruktur tidak ditemukan di URL. Tidak dapat memuat data.");
          setIsLoading(false);
          return;
        }

        const response = await axiosInstance.get(`/admin/instruktur/${idPegawai}`);
        const data = response.data;

        console.log(response.data)

        const formattedDate = data.tglKetersediaan ? 
          new Date(data.tglKetersediaan).toISOString().split('T')[0] 
          : '';

        setFormData({
          nama_lengkap: data.namaLengkap || '',
          username: data.username || '',
          email: data.email || '',
          ketersediaan_mulai: data.ketersediaan_mulai ? data.ketersediaan_mulai.substring(0, 5) : '08:00',
          ketersediaan_berakhir: data.ketersediaan_berakhir ? data.ketersediaan_berakhir.substring(0, 5) : '16:00',
          tanggal_ketersediaan: formattedDate,
          keahlian: data.keahlian || '',
          foto_profil_url: data.foto_profil_url || FotoProfile,
        });
      } catch (err: any) {
        console.error("Error fetching instruktur data:", err);
        let errorMessage = "Gagal memuat data instruktur. Silakan coba lagi.";
        if (err.response && err.response.data) {
          errorMessage = err.response.data.message || errorMessage;
          if (err.response.status === 404) {
            errorMessage = "Instruktur tidak ditemukan atau data ketersediaan tidak tersedia.";
          } else if (err.response.status === 401 && err.response.data.message === 'Unauthenticated.') {
                navigate('/admin/login');
          }
        } else if (err.request) {
          errorMessage = "Tidak ada respons dari server. Periksa koneksi internet Anda.";
        } else {
          errorMessage = "Terjadi kesalahan tidak terduga saat mengambil data.";
        }
        setFetchError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    if (idPegawai) {
      fetchInstrukturData();
    } else {
      setFetchError("ID instruktur tidak ditemukan di URL. Pastikan URL memiliki ID yang valid.");
      setIsLoading(false);
    }
  }, [idPegawai]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null); 
    setSuccessMessage(null);

    if (!formData.nama_lengkap || !formData.email || !formData.tanggal_ketersediaan || !formData.keahlian || !formData.ketersediaan_mulai || !formData.ketersediaan_berakhir) {
      setError("Semua field wajib diisi.");
      setIsSaving(false);
      return;
    }
    
    if (formData.ketersediaan_mulai >= formData.ketersediaan_berakhir) {
        setError("Waktu berakhir harus setelah waktu mulai.");
        setIsSaving(false);
        return;
    }

    try {
      const response = await axiosInstance.patch(`/admin/instruktur/${idPegawai}/ketersediaan`, {
  namaLengkap: formData.nama_lengkap,
  keahlian: formData.keahlian,
  waktuMulai: formData.ketersediaan_mulai,
  waktuBerakhir: formData.ketersediaan_berakhir,
  tglKetersediaan: formData.tanggal_ketersediaan,


});
      
      console.log('Data instruktur berhasil diperbarui:', response.data);
      setSuccessMessage('Data instruktur berhasil diperbarui!');
      // Opsional: Navigasi kembali ke halaman kelola instruktur setelah berhasil update
      // navigate('/admin/kelola-instruktur');
    } catch (err: any) {
      console.error('Error saat menyimpan data instruktur:', err);
      let errorMessage = "Terjadi kesalahan saat menyimpan data. Silakan coba lagi.";
      if (err.response && err.response.data) {
        const backendError: BackendError = err.response.data;
        if (backendError.message) {
          errorMessage = backendError.message;
        } else if (backendError.errors) {
          const validationErrors = Object.entries(backendError.errors)
            .map(([field, messages]) => `${field}: ${(Array.isArray(messages) ? messages : [messages]).join(', ')}`)
            .join('; ');
          errorMessage = `Validasi gagal: ${validationErrors}`;
        }
      } else if (err.request) {
        errorMessage = "Tidak ada respons dari server. Periksa koneksi internet Anda.";
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {isLoading ? (
        <div className="w-full py-2 px-28 flex justify-center items-center h-screen">
          <p className="text-xl text-gray-700">Memuat data instruktur...</p>
        </div>
      ) : fetchError ? (
        <div className="w-full py-2 px-28 flex justify-center items-center h-screen">
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
            <p>{fetchError}</p>
          </div>
        </div>
      ) : (
        <div className="w-full py-2 px-28">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <img
                src={formData.foto_profil_url || FotoProfile}
                alt="Foto Profil"
                className="w-20 h-20 rounded-full object-cover"
              />
              <div>
                <h2 className="text-[20px] font-semibold">{formData.nama_lengkap || 'Instruktur'}</h2>
                <p className="text-gray-500 text-[16px]">{formData.email}</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md" role="alert">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md" role="alert">
              {successMessage}
            </div>
          )}

          <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="nama_lengkap" className="block text-[22px] font-medium mb-1">
                Nama Lengkap
              </label>
              <input
                id="nama_lengkap"
                name="nama_lengkap"
                type="text"
                placeholder="Masukkan nama lengkap"
                value={formData.nama_lengkap}
                onChange={handleInputChange}
                className="w-full h-16 border border-borderColor rounded-xl px-4 py-2 focus:outline-none"
                required
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-[22px] font-medium mb-1">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                placeholder="Masukkan username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full h-16 border border-borderColor rounded-xl px-4 py-2 focus:outline-none"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-[22px] font-medium mb-1">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Masukkan E-mail pengguna"
                value={formData.email}
                onChange={handleInputChange}
                className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-6 ">
              <div className="rounded-md flex flex-col justify-start h-full">
                <label className="block font-semibold mb-4 text-[22px]">
                  Ketersediaan
                </label>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <label htmlFor="ketersediaan_mulai" className="text-[18px] w-24">Mulai</label>
                    <div className="relative w-full flex-1">
                      <select
                        id="ketersediaan_mulai"
                        name="ketersediaan_mulai"
                        value={formData.ketersediaan_mulai}
                        onChange={handleInputChange}
                        className="w-full h-16 border rounded-xl px-4 pr-10 py-2 border-borderColor appearance-none focus:outline-none"
                      >
                        {availableTimes.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-5 h-5 text-gray-500 absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <label htmlFor="ketersediaan_berakhir" className="text-[18px] w-24">Berakhir</label>
                    <div className="relative w-full flex-1">
                      <select
                        id="ketersediaan_berakhir"
                        name="ketersediaan_berakhir"
                        value={formData.ketersediaan_berakhir}
                        onChange={handleInputChange}
                        className="w-full h-16 border rounded-xl px-4 pr-10 py-2 border-borderColor appearance-none focus:outline-none"
                      >
                        {availableTimes.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-5 h-5 text-gray-500 absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <label htmlFor="tanggal_ketersediaan" className="text-[18px] w-24">Tanggal</label>
                    <input
                      id="tanggal_ketersediaan"
                      name="tanggal_ketersediaan"
                      type="date"
                      value={formData.tanggal_ketersediaan}
                      onChange={handleInputChange}
                      className="w-full h-16 border rounded-xl px-4 py-2 border-borderColor focus:outline-none"
                      required
                    />
                  </div>
                </div>
              </div>
              {/* ======================================================== */}
            </div> {/* Ini adalah penutup div untuk grid-cols-2 gap-6 */}
            {/* ======================================================== */}

            <div className="rounded-md flex flex-col justify-start h-full">
              <label htmlFor="keahlian" className="block font-semibold mb-4 text-[22px]">
                Keahlian
              </label>
              <div className="relative w-full">
                <select
                  id="keahlian"
                  name="keahlian"
                  value={formData.keahlian}
                  onChange={handleInputChange}
                  className="w-full h-16 border rounded-xl px-4 pr-10 py-2 border-borderColor appearance-none focus:outline-none"
                  required
                >
                  <option value="">Pilih Keahlian</option>
                  {skills.map(skill => (
                    <option key={skill} value={skill}>{skill}</option>
                  ))}
                </select>
                <ChevronDown className="w-5 h-5 text-gray-500 absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="border border-indigo-500 text-indigo-500 px-10 py-2 rounded-lg hover:bg-indigo-50 text-[16px] font-semibold disabled:opacity-50"
              >
                {isSaving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
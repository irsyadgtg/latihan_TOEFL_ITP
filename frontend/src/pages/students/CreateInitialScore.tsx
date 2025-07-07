// src/pages/student/CreateInitialScore.tsx
import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useDashboardLayoutContext } from "../../layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";
import axiosInstance from "../../services/axios";

import { UploadCloud } from "lucide-react";

// Interface untuk data form pengajuan skor
interface InitialScoreFormData {
  jenisTes: string;
  skor: string;
  dokumen: File | null;
}

const CreateInitialScore: React.FC = () => {
  const { setTitle, setSubtitle } = useDashboardLayoutContext();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<InitialScoreFormData>({
    jenisTes: "",
    skor: "",
    dokumen: null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setTitle("Pengajuan Skor Awal");
    setSubtitle("Isi formulir untuk mengajukan skor tes Anda.");
  }, [setTitle, setSubtitle]);

  // Handle perubahan input form
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const target = e.target as HTMLInputElement;

    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "file" ? (target.files ? target.files[0] : null) : value,
    }));
  };

  // Handle submit form
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    // Validasi sederhana di sisi klien
    if (!formData.jenisTes.trim() || !formData.skor.trim() || !formData.dokumen) {
      setError("Semua field harus diisi, termasuk dokumen.");
      setIsLoading(false);
      return;
    }

    const dataToSend = new FormData();
    dataToSend.append("namaTes", formData.jenisTes);
    dataToSend.append("skor", formData.skor);
    if (formData.dokumen) {
      dataToSend.append("dokumenPendukung", formData.dokumen);
    }

    console.log("--- FormData yang akan dikirim ---");
    for (let pair of dataToSend.entries()) {
      console.log(pair[0] + ': ' + (pair[1] instanceof File ? pair[1].name : pair[1]));
    }
    console.log("---------------------------------");

    try {
      const response = await axiosInstance.post("/pengajuan-skor-awal", dataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log("Pengajuan skor berhasil:", response.data);
      setSuccessMessage(response.data.message || "Pengajuan skor berhasil dikirim!");
      
      setFormData({
        jenisTes: "",
        skor: "",
        dokumen: null,
      });

      setTimeout(() => {
        navigate("/student/awal");
      }, 2000);

    } catch (err: any) {
      console.error("Terjadi kesalahan saat mengajukan skor:", err);
      let errorMessage = "Terjadi kesalahan saat mengajukan skor. Silakan coba lagi.";

      // --- PERBAIKAN AKHIR DI SINI ---
      if (axios.isAxiosError(err) && err.response) { // Pastikan ini AxiosError dan ada properti response
        // Kita membuat variabel lokal untuk data respons agar TypeScript bisa melakukan narrowing
        const responseData = err.response.data; 

        if (err.response.status === 401) {
          errorMessage = "Sesi Anda telah berakhir. Silakan login kembali.";
          localStorage.removeItem('AuthToken');
          localStorage.removeItem('userData');
          navigate('/login');
        } else if (responseData && responseData.errors) { // Gunakan responseData di sini
          const validationErrors = Object.keys(responseData.errors)
            .map(key => `${key}: ${responseData.errors[key].join(', ')}`)
            .join('; ');
          errorMessage = `Validasi Gagal: ${validationErrors}`;
        } else if (responseData && responseData.message) { // Gunakan responseData di sini
          errorMessage = responseData.message;
        } else {
          errorMessage = `Error: ${err.response.status} - ${err.response.statusText}`;
        }
      } else if (err.request) { // Jika tidak ada respons, tapi ada request (error jaringan)
        errorMessage = "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.";
      } else { // Menangkap error lain yang tidak terduga
        errorMessage = err.message || "Terjadi kesalahan tidak dikenal.";
      }
      // --- AKHIR PERBAIKAN ---

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full py-2">
      {/* Pesan status */}
      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md mb-4" role="alert">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded-md mb-4" role="status">
          {successMessage}
        </div>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Nama Tes yang Diikuti */}
        <div>
          <label htmlFor="jenisTes" className="block text-[22px] font-semibold mb-1">
            Nama Tes yang Diikuti
          </label>
          <div className="relative">
            <input
              id="jenisTes"
              name="jenisTes"
              type="text"
              placeholder="Masukkan nama tes yang diikuti (contoh: TOEFL ITP, IELTS, TOEIC)"
              className="w-full h-16 border rounded-xl px-4 py-2 border-borderColor focus:outline-none"
              value={formData.jenisTes}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Besaran Skor */}
        <div>
          <label htmlFor="skor" className="block text-[22px] font-semibold mb-1">
            Besaran Skor
          </label>
          <input
            id="skor"
            type="number"
            name="skor"
            placeholder="Masukkan besaran skor Anda (contoh: 550)"
            className="w-full h-16 border border-borderColor rounded-xl px-4 py-2 focus:outline-none"
            value={formData.skor}
            onChange={handleChange}
            required
            min="0"
            max="1000"
          />
        </div>

        {/* Dokumen Pendukung Sertifikat Test */}
        <div>
          <label htmlFor="dokumen" className="block text-[22px] font-semibold mb-1">
            Dokumen Pendukung Sertifikat Test (PDF/Gambar)
          </label>
          <div className="flex items-center border border-borderColor rounded-xl overflow-hidden p-4">
            <label
              htmlFor="dokumen"
              className="bg-blue-600 rounded-md text-white px-4 py-2 text-sm font-medium cursor-pointer flex items-center gap-2 hover:bg-blue-700 transition-colors"
            >
              <UploadCloud size={20} /> Unggah Dokumen
            </label>
            <input
              id="dokumen"
              type="file"
              name="dokumen"
              accept=".pdf,image/*"
              className="flex-1 px-4 py-2 text-gray-500 text-sm focus:outline-none hidden"
              onChange={handleChange}
              required
            />
            {formData.dokumen ? (
              <span className="ml-4 text-gray-700 break-words max-w-[calc(100%-150px)]">
                {formData.dokumen.name}
              </span>
            ) : (
              <span className="ml-4 text-gray-500">Pilih file...</span>
            )}
          </div>
        </div>

        {/* Tombol Ajukan */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="bg-yellow-500 text-white font-semibold text-[20px] py-3 px-8 rounded-lg hover:bg-yellow-600 duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? "Mengajukan..." : "Ajukan Skor"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateInitialScore;
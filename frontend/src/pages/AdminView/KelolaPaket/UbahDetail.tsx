import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDashboardLayoutContext } from '../../../layouts/DashboardLayout';
import axios from "axios"; // <-- Import default axios here!
import axiosInstance from "../../../services/axios"; // Your custom axios instance

import EditIcon from "../../../assets/icons/edit.svg";

// Interface untuk data yang diterima dari API (detail paket)
interface PaketKursusDetailAPIResponse {
  idPaketKursus: number;
  namaPaket: string;
  harga: string; // Tetap string karena input harga bisa di-format
  fasilitas: string;
  masaBerlaku: number;
  aktif: boolean;
  idPegawai: number;
  // Anda bisa menambahkan properti lain jika API show mengembalikannya
}

// Interface untuk payload update PATCH
interface UpdateCoursePackagePayload {
  namaPaket: string;
  harga: number; // Kirim sebagai number ke backend
  fasilitas: string;
}

export default function UbahDetailPaket() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { setTitle, setSubtitle } = useDashboardLayoutContext();

  const [namaPaket, setNamaPaket] = useState<string>("");
  const [harga, setHarga] = useState<string>("");
  const [fasilitas, setFasilitas] = useState<string>("");
  const [masaBerlaku, setMasaBerlaku] = useState<string>("");

  const [isEditingNamaPaket, setIsEditingNamaPaket] = useState(false);
  const [isEditingHarga, setIsEditingHarga] = useState(false);
  const [isEditingFasilitas, setIsEditingFasilitas] = useState(false);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setTitle("Ubah Detail Paket Kursus");
    setSubtitle("Perbarui informasi spesifik paket kursus.");
  }, [setTitle, setSubtitle]);

  useEffect(() => {
    const fetchPackageDetail = async () => {
      if (!id) {
        setError("ID Paket Kursus tidak ditemukan di URL.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.get<PaketKursusDetailAPIResponse>(`/paket-kursus/${id}`);
        const data = response.data;

        setNamaPaket(data.namaPaket);
        setHarga(formatRupiah(data.harga.toString()));
        setFasilitas(data.fasilitas);
        setMasaBerlaku(data.masaBerlaku.toString());
        
        setIsLoading(false);
      } catch (err: any) {
        console.error("Error fetching package detail:", err);
        let errorMessage = "Gagal memuat detail paket kursus. Silakan coba lagi.";
        // Use axios.isAxiosError here
        if (axios.isAxiosError(err) && err.response) {
          if (err.response.status === 404) {
            errorMessage = "Paket kursus tidak ditemukan.";
          } else if (err.response.data && err.response.data.message) {
            errorMessage = err.response.data.message;
          } else {
            errorMessage = `Error: ${err.response.status} - ${err.response.statusText}`;
          }
        } else {
          errorMessage = err.message || "Terjadi kesalahan tidak dikenal.";
        }
        setError(errorMessage);
        setIsLoading(false);
      }
    };

    fetchPackageDetail();
  }, [id]);

  const formatRupiah = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    if (!numericValue) return '';
    return 'Rp. ' + parseInt(numericValue).toLocaleString('id-ID');
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHarga(formatRupiah(e.target.value));
  };

  const handleSaveAllChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    if (!id) {
        setError("ID Paket Kursus tidak ditemukan untuk pembaruan.");
        setIsSubmitting(false);
        return;
    }

    if (!namaPaket || !harga || !fasilitas) {
      setError("Nama Paket, Harga, dan Fasilitas tidak boleh kosong.");
      setIsSubmitting(false);
      return;
    }

    const parsedHarga = parseInt(harga.replace(/[^0-9]/g, ''));
    if (isNaN(parsedHarga) || parsedHarga < 0) {
        setError("Harga harus angka positif.");
        setIsSubmitting(false);
        return;
    }

    const payload: UpdateCoursePackagePayload = {
      namaPaket,
      harga: parsedHarga,
      fasilitas,
    };

    try {
      const response = await axiosInstance.patch(`/paket-kursus/${id}/ubah-detail`, payload);
      setSuccess(response.data.message || "Detail paket kursus berhasil diperbarui!");
      setIsEditingNamaPaket(false);
      setIsEditingHarga(false);
      setIsEditingFasilitas(false);

      setTimeout(() => {
        setSuccess(null);
      }, 3000);

    } catch (err: any) {
      console.error("Error updating package detail:", err);
      let errorMessage = "Gagal memperbarui detail paket kursus. Silakan coba lagi.";
      // Use axios.isAxiosError here
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.data && err.response.data.errors) {
            const validationErrors = Object.values(err.response.data.errors).flat().join(". ");
            errorMessage = `Validasi Gagal: ${validationErrors}`;
        } else if (err.response.data && err.response.data.message) {
            errorMessage = err.response.data.message;
        } else {
            errorMessage = `Error: ${err.response.status} - ${err.response.statusText}`;
        }
      } else {
        errorMessage = err.message || "Terjadi kesalahan tidak dikenal.";
      }
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-600 text-lg">Memuat detail paket kursus...</p>
      </div>
    );
  }

  if (error && !isLoading) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-md" role="alert">
        <p>{error}</p>
        <button onClick={() => navigate("/admin/kelola-paket")} className="mt-2 text-blue-700 underline">
            Kembali ke Daftar Paket
        </button>
      </div>
    );
  }

  return (
    <div className="w-full py-2 ">
      <form className="space-y-6" onSubmit={handleSaveAllChanges}>
        {/* Input Nama Paket */}
        <div>
          <label htmlFor="namaPaket" className="block text-[22px] font-semibold mb-1">
            Nama Paket
          </label>
          <div className="flex items-center border border-borderColor rounded-xl px-4 h-16">
            <input
              type="text"
              id="namaPaket"
              placeholder="TOEFL ITP Preparation"
              className="flex-grow focus:outline-none bg-white"
              value={namaPaket}
              onChange={(e) => setNamaPaket(e.target.value)}
              readOnly={!isEditingNamaPaket}
            />
            <button
              type="button"
              onClick={() => setIsEditingNamaPaket(!isEditingNamaPaket)}
              className="ml-4 font-semibold flex items-center gap-4 bg-blue-500 text-white px-8 py-2 rounded-full hover:bg-blue-500/80 duration-200"
            >
              <img className="w-[18px]" src={EditIcon} alt="Edit" />
              {isEditingNamaPaket ? "Selesai" : "Edit"}
            </button>
          </div>
        </div>

        {/* Harga */}
        <div>
          <label htmlFor="harga" className="block text-[22px] font-semibold mb-1">
            Harga
          </label>
          <div className="flex items-center border border-borderColor rounded-xl px-4 h-16">
            <input
              type="text"
              id="harga"
              placeholder="Rp100.000"
              className="flex-grow focus:outline-none bg-white"
              value={harga}
              onChange={handlePriceChange}
              readOnly={!isEditingHarga}
            />
            <button
              type="button"
              onClick={() => setIsEditingHarga(!isEditingHarga)}
              className="ml-4 font-semibold flex items-center gap-4 bg-blue-500 text-white px-8 py-2 rounded-full hover:bg-blue-500/80 duration-200"
            >
              <img className="w-[18px]" src={EditIcon} alt="Edit" />
              {isEditingHarga ? "Selesai" : "Edit"}
            </button>
          </div>
        </div>

        {/* Fasilitas */}
        <div>
          <label htmlFor="fasilitas" className="block text-[22px] font-semibold mb-1">
            Fasilitas
          </label>
          <div className="flex items-start border border-borderColor rounded-xl px-4 py-2 min-h-16">
            <textarea
              id="fasilitas"
              placeholder="Tersedia modul belajar, belajar permateri, dan bisa melakukan konsultasi dengan instruktur"
              className="flex-grow focus:outline-none resize-y min-h-[4rem] bg-white"
              value={fasilitas}
              onChange={(e) => setFasilitas(e.target.value)}
              readOnly={!isEditingFasilitas}
            />
            <button
              type="button"
              onClick={() => setIsEditingFasilitas(!isEditingFasilitas)}
              className="ml-4 font-semibold flex items-center gap-4 bg-blue-500 text-white px-8 py-2 rounded-full hover:bg-blue-500/80 duration-200"
            >
              <img className="w-[18px]" src={EditIcon} alt="Edit" />
              {isEditingFasilitas ? "Selesai" : "Edit"}
            </button>
          </div>
        </div>

        {/* Ketentuan Paket Kursus (Masa Berlaku Paket Kursus) - Tidak bisa diedit */}
        <div>
          <label htmlFor="masaBerlaku" className="block text-[22px] font-semibold mb-1">
            Masa Berlaku Paket Kursus (dalam Bulan)
          </label>
          <div className="flex items-center border border-borderColor rounded-xl px-4 h-16">
            <input
              type="text"
              id="masaBerlaku"
              placeholder="12"
              className="flex-grow focus:outline-none bg-gray-100 cursor-not-allowed"
              value={masaBerlaku}
              readOnly
              disabled
            />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-center">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded-md text-center">
            {success}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-secondary w-[16rem] text-white font-semibold text-[20px] py-3 px-8 rounded-lg hover:bg-secondary/80 duration-200"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </div>
  );
}
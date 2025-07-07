// src/pages/admin/AktivasiPaket.tsx
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDashboardLayoutContext } from '../../../layouts/DashboardLayout'; // Pastikan path ini benar
import axios from "axios"; // Import default axios for isAxiosError
import axiosInstance from "../../../services/axios"; // Pastikan path ini benar

import StatusToggle from "../../../components/utils/StatusToggle"; 

// Interface untuk data yang diterima dari API (detail paket untuk aktivasi)
// Sesuai dengan respons `getDetailAktivasi` di controller Laravel
interface PaketKursusAktivasiAPIResponse {
  id: number; // Ini adalah idPaketKursus dari API
  namaPaket: string;
  harga: number; // Dari controller, harga dikembalikan sebagai number di sini
  fasilitas: string;
  masaBerlaku: number; // Dalam bulan
  aktif: boolean; // Status aktif/non-aktif
  // totalPenggunaPaket?: number; // Tambahkan ini jika controller mengembalikan count ini
}

export default function AktivasiPaket() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { setTitle, setSubtitle } = useDashboardLayoutContext();

  const [paketData, setPaketData] = useState<PaketKursusAktivasiAPIResponse | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setTitle("Aktivasi Paket Kursus");
    setSubtitle("Kelola status aktif atau non-aktif paket kursus.");
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
      setPaketData(null);
      try {
        // Axios response structure: { data: { data: PaketKursusAktivasiAPIResponse } }
        const response = await axiosInstance.get<{ data: PaketKursusAktivasiAPIResponse }>(`/paket-kursus/${id}/aktivasi`);
        setPaketData(response.data.data); // Ambil data dari properti 'data'
        setIsLoading(false);
      } catch (err: any) {
        console.error("Error fetching package detail for activation:", err);
        let errorMessage = "Gagal memuat detail aktivasi paket kursus. Silakan coba lagi.";
        if (axios.isAxiosError(err) && err.response) {
          if (err.response.status === 404) {
            errorMessage = "Paket kursus tidak ditemukan.";
          } else if (err.response.data?.message) {
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

  const formatRupiah = (value: number) => {
    return 'Rp. ' + value.toLocaleString('id-ID');
  };

  const handleToggleStatus = async (newStatus: boolean) => {
    if (!id || !paketData) return;

    setIsUpdatingStatus(true);
    setError(null);
    setSuccess(null);

    const payload = {
      aktif: newStatus,
    };

    try {
      const response = await axiosInstance.patch(`/paket-kursus/${id}/aktivasi`, payload);
      
      // Update state lokal dengan status baru dari respons API
      // Perhatikan bahwa `response.data` dari PATCH biasanya mengembalikan data yang diupdate,
      // tetapi jika hanya mengembalikan pesan, kita cukup update status `aktif` di `paketData`.
      // Jika controller patch mengembalikan data yang diperbarui, Anda bisa gunakan:
      // setPaketData(response.data.data || { ...paketData, aktif: newStatus });
      setPaketData(prevData => (prevData ? { ...prevData, aktif: newStatus } : null));
      
      setSuccess(response.data.message || `Status paket kursus berhasil diubah menjadi ${newStatus ? 'aktif' : 'non-aktif'}.`);
      
      setTimeout(() => setSuccess(null), 3000);

    } catch (err: any) {
      console.error("Error updating package activation status:", err);
      let errorMessage = "Gagal memperbarui status paket kursus. Silakan coba lagi.";
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.data?.errors) {
            const validationErrors = Object.values(err.response.data.errors).flat().join(". ");
            errorMessage = `Validasi Gagal: ${validationErrors}`;
        } else if (err.response.data?.message) {
            errorMessage = err.response.data.message;
        } else {
            errorMessage = `Error: ${err.response.status} - ${err.response.statusText}`;
        }
      } else {
        errorMessage = err.message || "Terjadi kesalahan tidak dikenal.";
      }
      setError(errorMessage);
    } finally {
      setIsUpdatingStatus(false);
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

  if (!paketData) { // Jika paketData null setelah loading selesai (misalnya ID tidak valid atau data tidak ada)
    return (
      <div className="flex justify-center items-center h-64 flex-col">
        <p className="text-gray-600 text-lg">Data paket kursus tidak ditemukan.</p>
        <button onClick={() => navigate("/admin/kelola-paket")} className="mt-2 text-blue-700 underline">
            Kembali ke Daftar Paket
        </button>
      </div>
    );
  }

  return (
    <div className="w-full py-2">
      <div className="mb-6">
        <StatusToggle
          isActive={paketData.aktif}
          onToggle={handleToggleStatus}
          disabled={isUpdatingStatus}
          loading={isUpdatingStatus}
        />
      </div>

      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-center mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded-md text-center mb-4">
          {success}
        </div>
      )}

      <form className="space-y-6">
        {/* Nama Paket */}
        <div>
          <label className="block text-[22px] font-semibold mb-1">
            Nama Paket
          </label>
          <input
            type="text"
            className="w-full h-16 border border-borderColor rounded-xl px-4 py-2 focus:outline-none bg-gray-100 cursor-not-allowed"
            value={paketData.namaPaket}
            readOnly
            disabled
          />
        </div>

        {/* Harga */}
        <div>
          <label className="block text-[22px] font-semibold mb-1">
            Harga
          </label>
          <input
            type="text"
            className="w-full h-16 border border-borderColor rounded-xl px-4 py-2 focus:outline-none bg-gray-100 cursor-not-allowed"
            value={formatRupiah(paketData.harga)}
            readOnly
            disabled
          />
        </div>

        {/* Fasilitas */}
        <div>
          <label className="block text-[22px] font-semibold mb-1">
            Fasilitas
          </label>
          <textarea
            className="w-full h-32 border border-borderColor rounded-xl px-4 py-2 focus:outline-none resize-y bg-gray-100 cursor-not-allowed"
            value={paketData.fasilitas}
            readOnly
            disabled
          />
        </div>

        {/* Masa Berlaku Paket Kursus */}
        <div>
          <label className="block text-[22px] font-semibold mb-1">
            Masa Berlaku Paket Kursus (dalam Bulan)
          </label>
          <input
            type="text"
            className="w-full h-16 border rounded-xl px-4 py-2 border-borderColor focus:outline-none bg-gray-100 cursor-not-allowed"
            value={`${paketData.masaBerlaku} Bulan`}
            readOnly
            disabled
          />
        </div>
      </form>
    </div>
  );
}
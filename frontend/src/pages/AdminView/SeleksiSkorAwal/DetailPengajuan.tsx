// src/pages/AdminView/SeleksiSkorAwal/DetailPengajuan.tsx
import React, { useState, useEffect, FormEvent } from "react";
import { useDashboardLayoutContext } from '../../../layouts/DashboardLayout';
import { useNavigate, useParams } from "react-router-dom"; // Import useParams
import axios, { AxiosError } from "axios";
import axiosInstance from "../../../services/axios";
import { format, parseISO } from 'date-fns';
import { id as idLocale } from 'date-fns/locale'; // Untuk lokalitas Bahasa Indonesia

// icons
import dokumenIcon from "../../../assets/icons/dokumen.svg"; // Pastikan path ini benar
import { ChevronDown } from "lucide-react";

// Interface untuk data detail pengajuan skor (dari GET /admin/pengajuan-skor-awal/{id})
// Sesuaikan field ini agar sama persis dengan yang dikirim backend Anda dari showDetailPengajuanSkor()
interface ScoreDetailAPI {
  id: number; // idPengajuanSkorAwal
  namaLengkap: string;
  email: string;
  timestamp: string; // tglPengajuan
  namaTes: string;
  skor: number; // ini dikirim sebagai number dari backend
  dokumen_pendukung: string; // URL lengkap dokumen
  status: string; // Status saat ini (Pending, Disetujui, Ditolak)
  masaBerlakuDokumen: string | null; // Tambahkan ini jika backend mengirimnya di show detail
  keterangan: string | null; // Keterangan dari peserta
}

const DetailPengajuan: React.FC = () => {
  const { setTitle, setSubtitle } = useDashboardLayoutContext();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); // Ambil ID dari URL

  // State untuk data detail pengajuan
  const [scoreDetail, setScoreDetail] = useState<ScoreDetailAPI | null>(null);
  
  // State untuk form input seleksi
  const [selectedStatus, setSelectedStatus] = useState<string>(""); 
  const [masaBerlaku, setMasaBerlaku] = useState<string>(""); // Untuk input masa berlaku dokumen (tanggal)
  const [adminKeterangan, setAdminKeterangan] = useState<string>(""); // Keterangan dari admin

  const [isLoadingDetail, setIsLoadingDetail] = useState(true); // Loading saat fetch detail
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading saat submit PATCH
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setTitle("Seleksi Skor Awal");
    setSubtitle("Melakukan seleksi skor awal dari hasil pengajuan peserta.");
  }, [setTitle, setSubtitle]);

  // Effect untuk mengambil detail pengajuan skor
  useEffect(() => {
    const fetchScoreDetail = async () => {
      if (!id) {
        setError("ID Pengajuan Skor tidak ditemukan di URL.");
        setIsLoadingDetail(false);
        return;
      }
      setIsLoadingDetail(true);
      setError(null);
      try {
        // Endpoint GET detail: /admin/pengajuan-skor-awal/{id}
        // Asumsi respons membungkus data dalam properti 'data'
        const response = await axiosInstance.get<{ message: string; data: ScoreDetailAPI }>(`/admin/pengajuan-skor-awal/${id}`); 
        const detailData = response.data.data;
        
        setScoreDetail(detailData);
        setSelectedStatus(detailData.status); // Set status awal pilihan sesuai yang ada di backend
        // Jika masa berlaku dokumen sudah ada dari backend dan status disetujui, set nilainya
        if (detailData.status === 'Disetujui' && detailData.masaBerlakuDokumen) {
          // Format tanggal dari backend agar sesuai dengan input type="date" (YYYY-MM-DD)
          setMasaBerlaku(format(parseISO(detailData.masaBerlakuDokumen), 'yyyy-MM-dd'));
        }
        // Jika ada keterangan dari admin sebelumnya, bisa diset juga
        // setAdminKeterangan(detailData.keterangan_admin || ""); // Contoh jika backend punya field ini

      } catch (err: any) {
        console.error("Error fetching score detail:", err);
        let errorMessage = "Gagal memuat detail pengajuan skor. Silakan coba lagi.";
        if (axios.isAxiosError(err) && err.response) {
          const responseData = err.response.data;
          if (err.response.status === 404) {
            errorMessage = "Pengajuan skor tidak ditemukan.";
          } else if (err.response.status === 401) {
            errorMessage = "Sesi Anda telah berakhir. Silakan login kembali.";
            localStorage.removeItem('AuthToken');
            localStorage.removeItem('userData');
            navigate('/login');
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
        setIsLoadingDetail(false);
      }
    };
    fetchScoreDetail();
  }, [id, navigate]);

  // Fungsi untuk memformat timestamp (tglPengajuan)
  const formatTimestampDisplay = (dateStr: string): string => {
    try {
      const date = parseISO(dateStr);
      return format(date, 'EEEE, dd MMMM yyyy, HH:mm', { locale: idLocale }); 
    } catch (e) {
      console.error("Failed to parse timestamp:", dateStr, e);
      return dateStr;
    }
  };

  // Handle submit form verifikasi
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    if (!id || !selectedStatus) {
      setError("Status seleksi wajib dipilih.");
      setIsSubmitting(false);
      return;
    }

    // Validasi tambahan untuk masa berlaku dokumen jika status disetujui
    if (selectedStatus === 'Disetujui' && !masaBerlaku) {
      setError("Masa berlaku dokumen wajib diisi jika status Disetujui.");
      setIsSubmitting(false);
      return;
    }
    // Validasi tambahan untuk keterangan jika status Ditolak
    if (selectedStatus === 'Ditolak' && !adminKeterangan.trim()) {
      setError("Keterangan wajib diisi jika status Ditolak.");
      setIsSubmitting(false);
      return;
    }

    // Payload untuk PATCH request
    const dataToSend: { status: string; masaBerlakuDokumen?: string; keterangan?: string } = {
      status: selectedStatus, 
    };

    if (selectedStatus === 'Disetujui') {
      dataToSend.masaBerlakuDokumen = masaBerlaku; // Kirim sebagai string YYYY-MM-DD
    } else if (selectedStatus === 'Ditolak') {
      dataToSend.keterangan = adminKeterangan; // Kirim keterangan admin
    }

    console.log("--- Data seleksi yang akan dikirim ---", dataToSend);

    try {
      // Endpoint PATCH: /pengajuan-skor-awal/{id}/seleksi
      const response = await axiosInstance.patch(`/pengajuan-skor-awal/${id}/seleksi`, dataToSend);

      console.log("Seleksi skor berhasil:", response.data);
      setSuccessMessage(response.data.message || "Status pengajuan skor berhasil diperbarui!");
      
      // Opsional: Setelah sukses, redirect atau perbarui detail di UI
      setTimeout(() => {
        navigate("/admin/seleksi-skor"); // Kembali ke daftar pengajuan
      }, 2000);

    } catch (err: any) {
      console.error("Terjadi kesalahan saat seleksi skor:", err);
      let errorMessage = "Terjadi kesalahan saat seleksi skor. Silakan coba lagi.";

      if (axios.isAxiosError(err) && err.response) {
        const responseData = err.response.data;
        if (err.response.status === 401) {
          errorMessage = "Sesi Anda telah berakhir. Silakan login kembali.";
          localStorage.removeItem('AuthToken');
          localStorage.removeItem('userData');
          navigate('/login');
        } else if (responseData && responseData.errors) {
          const validationErrors = Object.keys(responseData.errors).map(key => `${key}: ${responseData.errors[key].join('; ')}`).join('; ');
          errorMessage = `Validasi Gagal: ${validationErrors}`;
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
      setIsSubmitting(false);
    }
  };

  // Tampilan loading detail
  if (isLoadingDetail) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-600 text-lg">Memuat detail pengajuan skor...</p>
      </div>
    );
  }

  // Tampilan error saat fetch detail
  if (error && !isLoadingDetail) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-md mb-4" role="alert">
        <p>{error}</p>
        <button onClick={() => navigate("/admin/seleksi-skor")} className="mt-2 text-blue-700 underline">
          Kembali ke Daftar Pengajuan
        </button>
      </div>
    );
  }

  // Tampilan jika detail tidak ditemukan setelah loading
  if (!scoreDetail) {
    return (
      <div className="flex justify-center items-center h-64 flex-col">
        <p className="text-gray-600 text-lg">Detail pengajuan skor tidak ditemukan.</p>
        <button onClick={() => navigate("/admin/seleksi-skor")} className="mt-2 text-blue-700 underline">
          Kembali ke Daftar Pengajuan
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-[22px] font-semibold mb-4">Data Pengaju</h2>

      {/* Pesan Sukses */}
      {successMessage && (
        <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded-md mb-4" role="status">
          {successMessage}
        </div>
      )}
      {/* Pesan Error (jika ada error saat submit) */}
      {error && isSubmitting && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md mb-4" role="alert">
          {error}
        </div>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6 text-base"> {/* Menggunakan grid untuk tata letak data */}
          {/* Data Pengaju */}
          <div>
            <p className="font-semibold">Nama Pengaju</p>
            <p>{scoreDetail.namaLengkap}</p>
          </div>
          <div>
            <p className="font-semibold">Email</p>
            <p>{scoreDetail.email}</p>
          </div>
          <div>
            <p className="font-semibold">Timestamp</p>
            <p>{formatTimestampDisplay(scoreDetail.timestamp)}</p> {/* Menggunakan fungsi format */}
          </div>
          <div>
            <p className="font-semibold">Besaran Skor</p>
            <p>{scoreDetail.skor}</p>
          </div>
          <div>
            <p className="font-semibold">Nama Tes yang Diikuti</p>
            <p>{scoreDetail.namaTes}</p>
          </div>

          {/* Dokumen Pendukung */}
          <div className="md:col-span-2"> {/* Agar kolom ini mengambil 2 kolom di md ke atas */}
            <p className="font-semibold text-[22px] mb-2">Dokumen Pendukung</p>
            <div className="border rounded-lg px-4 py-6 flex items-center gap-4 w-full">
              <img src={dokumenIcon} alt="Dokumen" className="w-16 h-16" />
              {scoreDetail.dokumen_pendukung ? (
                <a href={scoreDetail.dokumen_pendukung} target="_blank" rel="noopener noreferrer" className="font-medium text-lg text-blue-600 hover:underline">
                  Lihat Dokumen
                </a>
              ) : (
                <p className="font-medium text-lg text-gray-500">Tidak ada dokumen</p>
              )}
            </div>
          </div>
        </div>

        {/* Bagian Seleksi Status */}
        <h3 className="text-[22px] font-semibold mt-8 mb-4">Verifikasi Status</h3>
        <div>
          <label htmlFor="status_seleksi" className="block font-semibold mb-1">
            Status
          </label>
          <div className="relative w-full max-w-xs"> {/* Atur lebar max */}
            <select
              id="status_seleksi"
              name="status_seleksi"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full h-16 px-4 pr-10 py-2 border border-gray-300 rounded-md appearance-none focus:outline-none bg-white"
              required
            >
              <option value="">Pilih Status</option>
              <option value="Pending">Pending</option>
              <option value="Disetujui">Disetujui</option>
              <option value="Ditolak">Ditolak</option>
            </select>
            <ChevronDown className="w-5 h-5 text-gray-500 absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Input Masa Berlaku Dokumen (hanya jika status = Disetujui) */}
        {selectedStatus === "Disetujui" && (
          <div>
            <label htmlFor="masaBerlakuDokumen" className="block font-semibold text-[22px] mb-1">
              Masa Berlaku Dokumen
            </label>
            <input
              type="date"
              id="masaBerlakuDokumen"
              name="masaBerlakuDokumen"
              value={masaBerlaku}
              onChange={(e) => setMasaBerlaku(e.target.value)}
              className="mt-1 block w-full max-w-xs py-2 border border-gray-300 rounded-md px-3 focus:outline-none"
              required
            />
          </div>
        )}

        {/* Input Keterangan Admin (hanya jika status = Ditolak) */}
        {selectedStatus === "Ditolak" && (
          <div>
            <label htmlFor="adminKeterangan" className="block font-semibold text-[22px] mb-1">
              Keterangan Admin
            </label>
            <textarea
              id="adminKeterangan"
              name="adminKeterangan"
              placeholder="Tulis alasan penolakan..."
              value={adminKeterangan}
              onChange={(e) => setAdminKeterangan(e.target.value)}
              rows={5}
              className="mt-1 block w-full max-w-3xl rounded py-2 px-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base resize-y"
              required
            />
          </div>
        )}

        {/* Tombol Submit */}
        <div className="mt-6 flex justify-end w-full">
          <button
            type="submit"
            className="px-6 py-3 bg-yellow-500 text-white font-semibold rounded-md hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Menyimpan..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DetailPengajuan;
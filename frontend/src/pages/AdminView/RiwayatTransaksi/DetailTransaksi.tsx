import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDashboardLayoutContext } from '../../../layouts/DashboardLayout';
import axiosInstance from "../../../services/axios";
import axios, { AxiosError } from "axios";

// icons
import dokumenIcon from "../../../assets/icons/dokumen.svg";
import { ChevronDown } from "lucide-react";

// --- Interface untuk data transaksi dari API (SESUAI DENGAN AdminTransaksiController) ---
interface TransaksiData {
  idTransaksi: number; // PERBAIKAN: Menggunakan idTransaksi sesuai respons API
  kodeTransaksi: string;
  nominal: number;
  status: "PENDING" | "BERHASIL" | "DITOLAK"; // Status dari backend (penting!)
  buktiPembayaran: string; // URL path ke bukti pembayaran
  keterangan: string | null;
  created_at: string; // Tanggal dan waktu transaksi
  updated_at: string;
  peserta_paket: {
    idPesertaPaketKursus: number;
    tglMulai: string;
    idPeserta: number;
    idPaketKursus: number;
    statusAktif: boolean;
    paketSaatIni: boolean;
    created_at: string;
    updated_at: string;
    paket: {
      idPaketKursus: number;
      namaPaket: string;
      harga: string; // PERBAIKAN: Harga dari backend adalah string "250000.00"
      fasilitas: string;
      masaBerlaku: number; // Ini number di respons Anda
      aktif: number; // Ini number (0 atau 1) di respons Anda
      created_at: string;
      updated_at: string;
    };
    peserta: {
      idPeserta: number;
      namaLengkap: string; // Nama lengkap peserta
      created_at: string;
      updated_at: string;
    };
  };
}

// --- Fungsi utilitas ---
function formatRupiah(amount: number | string): string { // Sesuaikan untuk menerima number atau string
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (typeof numAmount !== 'number' || isNaN(numAmount)) {
    return "Rp0";
  }
  return "Rp" + numAmount.toLocaleString("id-ID");
}

function formatTimestamp(dateStr: string): string {
  const date = new Date(dateStr);
  const formattedDate = date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const formattedTime = date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
  return `${formattedTime} – ${formattedDate}`;
}

// --- Komponen DetailTransaksi ---
export default function DetailTransaksi() {
  const { setTitle, setSubtitle } = useDashboardLayoutContext();
  const navigate = useNavigate();
  const location = useLocation();

  // Ambil ID dari state yang diteruskan oleh RiwayatTransaksi.tsx
  // ID ini adalah primary key (idTransaksi) dari tabel 'transaksi' di backend.
  const transactionId = location.state?.id;

  // --- DEBUGGING: Log nilai transactionId saat komponen pertama kali dirender ---
  console.log("DetailTransaksi: transactionId dari location.state =", transactionId);

  const [detailTransaksi, setDetailTransaksi] = useState<TransaksiData | null>(null);
  // Status internal frontend: PENDING, APPROVED (untuk BERHASIL), REJECTED (untuk DITOLAK)
  const [statusVerifikasi, setStatusVerifikasi] = useState<"APPROVED" | "PENDING" | "REJECTED">("PENDING");
  const [keterangan, setKeterangan] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setTitle("Detail Transaksi");
    setSubtitle("Melihat unggahan bukti pembayaran dan memilih status dari hasil unggahan bukti pembayaran.");

    // --- DEBUGGING: Log nilai transactionId di dalam useEffect ---
    console.log("useEffect: transactionId =", transactionId);

    if (!transactionId) {
      setError("ID Transaksi tidak ditemukan. Kembali ke halaman riwayat.");
      setLoading(false);
      // --- DEBUGGING: Log jika ID tidak ditemukan dan akan redirect ---
      console.warn("DetailTransaksi: transactionId tidak ditemukan, akan redirect ke riwayat transaksi.");
      setTimeout(() => navigate('/admin/riwayat-transaksi'), 3000);
      return;
    }

    const fetchDetailTransaksi = async () => {
      setLoading(true);
      setError(null);
      try {
        // Panggil endpoint GET /admin/transaksi/{idTransaksi}
        console.log(`DetailTransaksi: Memanggil API GET /admin/transaksi/${transactionId}`); // DEBUGGING
        const response = await axiosInstance.get<TransaksiData>(`/admin/transaksi/${transactionId}`);
        setDetailTransaksi(response.data);
        console.log("DetailTransaksi: Data transaksi berhasil dimuat:", response.data); // DEBUGGING

        // Set status awal dari data API, mapping dari backend ke frontend
        if (response.data.status === "BERHASIL") {
          setStatusVerifikasi("APPROVED");
        } else if (response.data.status === "DITOLAK") {
          setStatusVerifikasi("REJECTED");
        } else {
          setStatusVerifikasi("PENDING");
        }
        setKeterangan(response.data.keterangan || "");

      } catch (err: unknown) {
        console.error("Gagal mengambil detail transaksi:", err);
        if (axios.isAxiosError(err)) {
          if (err.response) {
            // --- DEBUGGING: Log respons error dari backend ---
            console.error("DetailTransaksi: Error response data:", err.response.data);
            if (err.response.status === 401 && (err.response.data as any)?.message === 'Unauthenticated.') {
              setError("Sesi Anda telah berakhir. Silakan login kembali.");
              localStorage.removeItem('AuthToken');
              navigate('/login');
            } else if (err.response.status === 404) {
              setError("Detail transaksi tidak ditemukan.");
            } else if (err.response.data && typeof err.response.data === 'object' && 'message' in err.response.data) {
              setError((err.response.data.message as string) || `Terjadi kesalahan: ${err.response.status} ${err.response.statusText || 'Error'}`);
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

    fetchDetailTransaksi();
  }, [setTitle, setSubtitle, navigate, transactionId]);

  const handleSubmit = async () => {
    if (!detailTransaksi) {
        console.error("handleSubmit: detailTransaksi is null, cannot submit."); // DEBUGGING
        return;
    }

    // Map status internal frontend ke status yang diharapkan backend
    let statusToSend: "BERHASIL" | "DITOLAK"; // Backend hanya menerima ini untuk verifikasi
    if (statusVerifikasi === "APPROVED") {
      statusToSend = "BERHASIL";
    } else if (statusVerifikasi === "REJECTED") {
      statusToSend = "DITOLAK";
    } else {
      setError("Tidak dapat memverifikasi transaksi dengan status 'Pending'.");
      console.warn("handleSubmit: Mencoba submit dengan status PENDING."); // DEBUGGING
      return;
    }

    // Validasi keterangan jika status ditolak
    if (statusToSend === "DITOLAK" && !keterangan.trim()) {
      setError("Keterangan harus diisi jika status Ditolak.");
      console.warn("handleSubmit: Keterangan kosong saat status DITOLAK."); // DEBUGGING
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const payload = {
        status: statusToSend,
        keterangan: statusToSend === "DITOLAK" ? keterangan : null,
      };

      // Panggil endpoint PATCH /admin/transaksi/{idTransaksi}/verifikasi
      // Gunakan `detailTransaksi.idTransaksi` karena itu adalah primary key yang diterima backend
      console.log(`handleSubmit: Memanggil API PATCH /admin/transaksi/${detailTransaksi.idTransaksi}/verifikasi dengan payload:`, payload); // DEBUGGING
      const response = await axiosInstance.patch(`/admin/transaksi/${detailTransaksi.idTransaksi}/verifikasi`, payload);

      setSuccessMessage(response.data.message || "Verifikasi transaksi berhasil diperbarui!");
      console.log("handleSubmit: Verifikasi berhasil:", response.data); // DEBUGGING
      setDetailTransaksi(prev => prev ? { ...prev, status: statusToSend, keterangan: payload.keterangan } : null);

      setTimeout(() => {
        navigate('/admin/riwayat-transaksi');
      }, 1500);

    } catch (err: unknown) {
      console.error("Gagal verifikasi transaksi:", err);
      if (axios.isAxiosError(err)) {
        console.error("handleSubmit: Error response data:", err.response?.data); // DEBUGGING
        if (err.response) {
          if (err.response.status === 401 && (err.response.data as any)?.message === 'Unauthenticated.') {
            setError("Sesi Anda telah berakhir. Silakan login kembali.");
            localStorage.removeItem('AuthToken');
            navigate('/login');
          } else if (err.response.data && typeof err.response.data === 'object' && 'message' in err.response.data) {
            setError((err.response.data.message as string) || `Terjadi kesalahan: ${err.response.status} ${err.response.statusText || 'Error'}`);
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
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-600">
        Memuat detail transaksi...
      </div>
    );
  }

  // Tampilkan error jika ada error dan detailTransaksi masih null (gagal memuat)
  if (error && !detailTransaksi) {
    return (
      <div className="mt-4 p-6 rounded-lg bg-red-100 border border-red-400 text-red-700 text-center">
        <p>{error}</p>
        <button
          onClick={() => navigate('/admin/riwayat-transaksi')} // Kembali ke riwayat, bukan detail
          className="mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
        >
          Kembali ke Riwayat
        </button>
      </div>
    );
  }

  if (!detailTransaksi) { // Fallback jika detailTransaksi null setelah loading (misal: ID tidak valid)
    return (
      <div className="text-center py-8 text-gray-500">
        Detail transaksi tidak tersedia.
      </div>
    );
  }

  // Helper untuk mendapatkan URL lengkap bukti pembayaran
  const getFullProofUrl = (path: string): string => {
    // Asumsi base URL untuk storage adalah sama dengan base URL API Anda
    const BASE_API_URL = axiosInstance.defaults.baseURL;
    const STORAGE_PREFIX = '/storage/';

    // Pastikan BASE_API_URL tidak null/undefined dan hapus '/api' jika ada
    const baseUrlWithoutApi = BASE_API_URL ? BASE_API_URL.replace('/api', '') : 'http://127.0.0.1:8000';
    return `${baseUrlWithoutApi}${STORAGE_PREFIX}${path}`;
  };

  return (
    <div className="w-full">
      <h2 className="text-[22px] font-semibold mb-4">Data Transaksi</h2>

      {/* Pesan Sukses/Error */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}

      <div className="space-y-6 text-base">
        <div>
          <p className="font-semibold">Nama Lengkap</p>
          <p>{detailTransaksi.peserta_paket.peserta?.namaLengkap || 'N/A'}</p>
        </div>
        <div>
          <p className="font-semibold">Nama Paket Kursus</p>
          <p>{detailTransaksi.peserta_paket.paket?.namaPaket || 'N/A'}</p>
        </div>
        <div>
          <p className="font-semibold">Timestamp</p>
          <p>{formatTimestamp(detailTransaksi.created_at)}</p>
        </div>
        <div>
          <p className="font-semibold">ID Transaksi</p>
          <p>{detailTransaksi.kodeTransaksi}</p>
        </div>
        <div>
          <p className="font-semibold text-[22px]">Jumlah Transaksi</p>
          <p>{detailTransaksi.nominal === 0 ? "Gratis" : formatRupiah(detailTransaksi.nominal)}</p>
        </div>

        {/* --- Bagian Bukti Pembayaran --- */}
        <div className="w-full">
          <div>
            <p className="font-semibold text-[22px] mb-2">Bukti Pembayaran</p>
            {detailTransaksi.buktiPembayaran ? (
              <a
                href={getFullProofUrl(detailTransaksi.buktiPembayaran)}
                target="_blank"
                rel="noopener noreferrer"
                className="border rounded-lg px-4 py-6 flex items-center gap-4 w-full cursor-pointer hover:bg-gray-50"
              >
                <img src={dokumenIcon} alt="Dokumen" className="w-16 h-16" />
                <p className="font-medium text-lg">Lihat Bukti Pembayaran</p>
              </a>
            ) : (
              <div className="border rounded-lg px-4 py-6 flex items-center gap-4 w-full text-gray-500">
                <img src={dokumenIcon} alt="Dokumen" className="w-16 h-16 opacity-50" />
                <p className="font-medium text-lg">Tidak ada bukti pembayaran tersedia</p>
              </div>
            )}
          </div>
        </div>

        {/* --- Bagian Status --- */}
        <div>
          <p className="font-semibold mb-1 text-[22px]">Status</p>
          <div className="relative w-[10rem]">
            <select
              value={statusVerifikasi}
              onChange={(e) => setStatusVerifikasi(e.target.value as "PENDING" | "APPROVED" | "REJECTED")}
              className="w-full h-16 px-4 pr-10 py-2 appearance-none focus:outline-none border border-gray-300 rounded-md"
              disabled={submitting}
            >
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Berhasil</option>
              <option value="REJECTED">Ditolak</option>
            </select>
            <ChevronDown className="w-5 h-5 text-gray-500 absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* --- Bagian Keterangan dan Submit --- */}
        <div className="w-full space-y-6">
          {statusVerifikasi === "REJECTED" && (
            <div>
              <p className="font-semibold text-[22px]">Keterangan</p>
              <textarea
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                rows={5}
                className="mt-1 block w-full rounded py-2 px-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                placeholder="Tulis alasan penolakan..."
                disabled={submitting}
              />
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSubmit}
              className={`px-6 py-3 font-semibold rounded-md transition-colors ${
                submitting || (statusVerifikasi === "REJECTED" && !keterangan.trim())
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-yellow-500 text-white hover:bg-yellow-600"
              }`}
              disabled={submitting || (statusVerifikasi === "REJECTED" && !keterangan.trim())}
            >
              {submitting ? "Mengirim..." : "Submit"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
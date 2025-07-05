import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useDashboardLayoutContext } from '../../layouts/DashboardLayout';
import axiosInstance from "../../services/axios";
import axios, { AxiosError } from "axios";

// --- Interface untuk data transaksi dari API (SESUAI DENGAN AdminTransaksiController) ---
interface TransaksiData {
  idTransaksi: number; // PERBAIKAN: Menggunakan idTransaksi sesuai respons API
  kodeTransaksi: string;
  nominal: number;
  status: "PENDING" | "BERHASIL" | "DITOLAK"; // Status dari backend (penting!)
  buktiPembayaran: string; // URL path ke bukti pembayaran
  keterangan: string | null;
  created_at: string; // Timestamp transaksi
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
      // Tambahkan properti lain dari model Peserta jika ada (misal: 'email' untuk notifikasi)
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

// --- Komponen RiwayatTransaksi ---
export default function RiwayatTransaksi() {
  const navigate = useNavigate();
  const { setTitle, setSubtitle } = useDashboardLayoutContext();

  const [transactions, setTransactions] = useState<TransaksiData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTitle("Riwayat Transaksi");
    setSubtitle("Lihat dan verifikasi riwayat transaksi peserta."); // Subjudul untuk admin

    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.get<TransaksiData[]>('/admin/transaksi');
        setTransactions(response.data);
      } catch (err: unknown) {
        console.error("Gagal mengambil riwayat transaksi:", err);
        if (axios.isAxiosError(err)) {
          if (err.response) {
            if (err.response.status === 401 && (err.response.data as any)?.message === 'Unauthenticated.') {
              setError("Sesi Anda telah berakhir. Silakan login kembali.");
              localStorage.removeItem('AuthToken');
              navigate('/login');
            } else if (err.response.status === 403) {
              setError("Anda tidak memiliki izin untuk mengakses riwayat transaksi ini. Pastikan Anda login sebagai Admin.");
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

    fetchTransactions();
  }, [setTitle, setSubtitle, navigate]);

  if (loading) {
    return (
      <div className="mt-4 p-6 rounded-lg bg-white text-center text-gray-600">
        Memuat riwayat transaksi...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-4 p-6 rounded-lg bg-red-100 border border-red-400 text-red-700 text-center">
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="mt-4 p-6 rounded-lg bg-white text-center text-gray-500">
        Belum ada riwayat transaksi.
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-4">
      {transactions.map((trx) => (
        <div
          key={trx.idTransaksi} // PERBAIKAN: Gunakan idTransaksi sebagai key
          className="border border-borderColor rounded-xl p-4 shadow-sm bg-white"
        >
          <div className="grid grid-cols-8 gap-4">
            <div>
              <p className="text-gray-500 font-medium text-[12px]">Nama Lengkap</p>
              <p className="font-semibold text-[16px]">{trx.peserta_paket.peserta?.namaLengkap || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-500 font-medium text-[12px]">Nama Paket Kursus</p>
              <p className="font-semibold text-[16px]">{trx.peserta_paket.paket?.namaPaket || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-500 font-medium text-[12px]">ID Transaksi</p>
              <p className="font-semibold text-[16px]">{trx.kodeTransaksi}</p>
            </div>
            <div>
              <p className="text-gray-500 font-medium text-[12px]">Timestamp</p>
              <p className="font-semibold text-[16px]">{formatTimestamp(trx.created_at)}</p>
            </div>
            <div>
              <p className="text-gray-500 font-medium text-[12px]">Jumlah</p>
              <p className="font-semibold text-[16px]">
                {/* PERBAIKAN: Nominal pembayaran dari trx.nominal, harga paket dari trx.peserta_paket.paket.harga */}
                {trx.nominal === 0 ? "Gratis" : formatRupiah(trx.nominal)}
              </p>
            </div>
            <div>
              <p className="text-gray-500 font-medium text-[12px]">Status</p>
              <p
                className={`font-semibold text-[16px] ${
                  trx.status === "PENDING" ? "text-yellow-600" :
                  trx.status === "BERHASIL" ? "text-green-600" :
                  "text-red-600"
                }`}
              >
                {trx.status === "PENDING" ? "Pending" :
                 trx.status === "BERHASIL" ? "Berhasil" :
                 "Ditolak"}
              </p>
            </div>
            <div>
              <button
                onClick={() => {
                  // PERBAIKAN: Meneruskan idTransaksi ke halaman detail
                  navigate("/admin/riwayat-transaksi/detail-transaksi", {
                    state: { id: trx.idTransaksi } // Menggunakan idTransaksi
                  });
                }}
                className="px-5 py-2 border border-blue-500 rounded-md font-semibold text-blue-500 bg-white hover:bg-blue-50"
              >
                Verifikasi
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
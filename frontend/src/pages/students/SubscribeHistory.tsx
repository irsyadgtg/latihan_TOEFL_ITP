// src/pages/student/SubscribeHistory.tsx
import React, { useEffect, useState } from "react";
import { useDashboardLayoutContext } from "../../layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../services/axios";
import axios, { AxiosError } from "axios";

// --- Interface untuk data transaksi dari API ---
interface TransaksiData {
  kodeTransaksi: string;
  namaPaket: string | null;
  hargaPaket: number | null;
  nominalBayar: number;
  // PERBAIKAN: Ubah tipe statusTransaksi menjadi string aktual dari backend
  statusTransaksi: "PENDING" | "BERHASIL" | "DITOLAK"; // Menggunakan string BE
  tanggalTransaksi: string;
  buktiPembayaran: string | null;
  keterangan: string | null;
}

// --- Fungsi utilitas (tidak berubah) ---
function formatRupiah(amount: number | string | null): string {
  if (amount === null || typeof amount === 'undefined') {
    return "Rp0";
  }
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (typeof numAmount !== 'number' || isNaN(numAmount)) {
    return "Rp0";
  }
  return "Rp" + numAmount.toLocaleString("id-ID");
}

function formatTimestamp(dateStr: string | null): string {
  if (!dateStr) {
    return "-";
  }
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

const SubscribeHistory: React.FC = () => {
  const { setTitle, setSubtitle } = useDashboardLayoutContext();
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState<TransaksiData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTitle("Riwayat Pembayaran");
    setSubtitle("Berisi data pembayaran yang Anda lakukan sebelumnya.");

    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.get<TransaksiData[]>('/pembayaran/riwayat');
        setTransactions(response.data);
      } catch (err: unknown) {
        console.error("Gagal mengambil riwayat pembayaran:", err);
        if (axios.isAxiosError(err)) {
          if (err.response) {
            if (err.response.status === 401 && (err.response.data as any)?.message === 'Unauthenticated.') {
              setError("Sesi Anda telah berakhir. Silakan login kembali.");
              localStorage.removeItem('AuthToken');
              navigate('/login');
            } else if (err.response.status === 403) {
              setError("Anda tidak memiliki izin untuk melihat riwayat pembayaran. Pastikan Anda login sebagai Peserta.");
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

  // Fungsi untuk mendapatkan warna teks status
  const getStatusTextColor = (status: TransaksiData['statusTransaksi']) => {
    switch (status) {
      case "BERHASIL": // PERBAIKAN: Ubah dari "APPROVED" menjadi "BERHASIL"
        return "text-green-600";
      case "PENDING":
        return "text-yellow-500";
      case "DITOLAK": // PERBAIKAN: Ubah dari "REJECTED" menjadi "DITOLAK"
        return "text-red-600";
      default:
        return "text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-600">
        Memuat riwayat pembayaran...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-red-100 border border-red-400 text-red-700 text-center">
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
      <div className="p-4 text-center text-gray-500">
        Belum ada riwayat pembayaran yang tersedia.
      </div>
    );
  }

  return (
    <div className="p-4 relative">
      <div className="space-y-4">
        {transactions.map((tx, idx) => (
          <div
            key={tx.kodeTransaksi || idx}
            className="border border-gray-200 rounded-xl p-4 shadow-sm bg-white"
          >
            <div className="grid grid-cols-[1.5fr_2fr_1.5fr_1.5fr_1fr_1.5fr] gap-4 items-center">
              <div>
                <p className="text-gray-500 font-medium text-[12px]">ID Transaksi</p>
                <p className="font-semibold text-[16px]">{tx.kodeTransaksi}</p>
              </div>

              <div>
                <p className="text-gray-500 font-medium text-[12px]">Nama Paket Kursus</p>
                <p className="font-semibold text-[16px]">{tx.namaPaket || 'N/A'}</p>
              </div>

              <div>
                <p className="text-gray-500 font-medium text-[12px]">Timestamp</p>
                <p className="font-semibold text-[16px]">{formatTimestamp(tx.tanggalTransaksi)}</p>
              </div>

              <div>
                <p className="text-gray-500 font-medium text-[12px]">Jumlah</p>
                <p className="font-semibold text-[16px]">{formatRupiah(tx.nominalBayar)}</p>
              </div>

              <div>
                <p className="text-gray-500 font-medium text-[12px]">Status</p>
                <p className={`font-semibold text-[16px] ${getStatusTextColor(tx.statusTransaksi)}`}>
                  {/* Tampilkan status sesuai nilai dari backend */}
                  {/* PERBAIKAN: Gunakan string status aktual dari backend */}
                  {tx.statusTransaksi === "PENDING" ? "Pending" :
                   tx.statusTransaksi === "BERHASIL" ? "Berhasil" :
                   "Ditolak"}
                </p>
              </div>

              <div>
                <p className="text-gray-500 font-medium text-[12px]">Keterangan</p>
                <p className="font-semibold text-[16px]">{tx.keterangan || '-'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubscribeHistory;
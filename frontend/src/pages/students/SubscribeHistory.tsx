// src/pages/student/SubscribeHistory.tsx
import React, { useEffect } from "react";
import { useDashboardLayoutContext } from "../../layouts/DashboardLayout";
import { useNavigate } from "react-router-dom"; // Import useNavigate

// Definisi tipe data Transaksi untuk dummyData
interface TransactionData {
  id: string;
  courseName: string;
  timestamp: string;
  amount: string;
  status: "Berhasil" | "Pending" | "Ditolak";
  notes: string;
}

const SubscribeHistory: React.FC = () => {
  const dummyData: TransactionData[] = [
    {
      id: "12345",
      courseName: "TOEFL ITP~Free",
      timestamp: "08:00 ~ 10/04/2025",
      amount: "Rp100.000",
      status: "Berhasil",
      notes: "-",
    },
    {
      id: "12345", // Asumsi ID bisa sama untuk demonstrasi visual
      courseName: "TOEFL ITP~Free",
      timestamp: "08:00 ~ 10/04/2025",
      amount: "Rp100.000",
      status: "Berhasil",
      notes: "-",
    },
    {
      id: "12345", // Asumsi ID bisa sama untuk demonstrasi visual
      courseName: "TOEFL ITP~Free",
      timestamp: "08:00 ~ 10/04/2025",
      amount: "Rp100.000",
      status: "Berhasil",
      notes: "-",
    },
    {
      id: "12345",
      courseName: "TOEFL ITP~6 Bulan",
      timestamp: "08:00 ~ 10/04/2025",
      amount: "Rp100.000",
      status: "Ditolak",
      notes: "-",
    },
    {
      id: "12345",
      courseName: "TOEFL ITP~6 Bulan",
      timestamp: "08:00 ~ 10/04/2025",
      amount: "Rp100.000",
      status: "Ditolak",
      notes: "-",
    },
    {
      id: "12345",
      courseName: "TOEFL ITP~6 Bulan",
      timestamp: "08:00 ~ 10/04/2025",
      amount: "Rp100.000",
      status: "Pending",
      notes: "-",
    },
    {
      id: "12345",
      courseName: "TOEFL ITP~1 Tahun",
      timestamp: "08:00 ~ 10/04/2025",
      amount: "Rp100.000",
      status: "Pending",
      notes: "-",
    },
    {
      id: "12345",
      courseName: "TOEFL ITP~1 Tahun",
      timestamp: "08:00 ~ 10/04/2025",
      amount: "Rp100.000",
      status: "Pending",
      notes: "-",
    },
  ];

  const { setTitle, setSubtitle } = useDashboardLayoutContext();
  const navigate = useNavigate();

  useEffect(() => {
    setTitle("Riwayat Pembayaran");
    setSubtitle("Berisi data pembayaran yang anda lakukan sebelumnya");
  }, [setTitle, setSubtitle]);

  // Fungsi untuk mendapatkan warna teks status
  const getStatusTextColor = (status: TransactionData['status']) => {
    switch (status) {
      case "Berhasil":
        return "text-green-600"; // Hijau untuk Berhasil
      case "Pending":
        return "text-yellow-500"; // Orange untuk Pending
      case "Ditolak":
        return "text-red-600";    // Merah untuk Ditolak
      default:
        return "text-gray-800";
    }
  };

  return (
    <div className="p-4 relative"> {/* Padding di sekitar seluruh konten, dan relative untuk tombol logout */}

      {/* Daftar Transaksi (Setiap Baris adalah Kartu Terpisah) */}
      <div className="space-y-4"> {/* Jarak antar kartu transaksi, sesuaikan dengan gambar */}
        {dummyData.map((tx, idx) => (
          <div
            key={idx} // Ingat: sebaiknya gunakan tx.id jika ID unik di data Anda
            className="border border-gray-200 rounded-xl p-4 shadow-sm bg-white" // Styling kartu per baris
          >
            {/* Grid untuk konten di dalam setiap kartu */}
            <div className="grid grid-cols-[1.5fr_2fr_1.5fr_1.5fr_1fr_1.5fr] gap-4 items-center">
                {/* Kolom ID Transaksi */}
                <div>
                    <p className="text-gray-500 font-medium text-[12px]">ID Transaksi</p>
                    <p className="font-semibold text-[16px]">{tx.id}</p>
                </div>

                {/* Kolom Nama Paket Kursus */}
                <div>
                    <p className="text-gray-500 font-medium text-[12px]">Nama Paket Kursus</p>
                    <p className="font-semibold text-[16px]">{tx.courseName}</p>
                </div>

                {/* Kolom Timestamp */}
                <div>
                    <p className="text-gray-500 font-medium text-[12px]">Timestamp</p>
                    <p className="font-semibold text-[16px]">{tx.timestamp}</p>
                </div>

                {/* Kolom Jumlah */}
                <div>
                    <p className="text-gray-500 font-medium text-[12px]">Jumlah</p>
                    <p className="font-semibold text-[16px]">{tx.amount}</p>
                </div>

                {/* Kolom Status */}
                <div>
                    <p className="text-gray-500 font-medium text-[12px]">Status</p>
                    <p className={`font-semibold text-[16px] ${getStatusTextColor(tx.status)}`}>
                        {tx.status}
                    </p>
                </div>

                {/* Kolom Keterangan */}
                <div>
                    <p className="text-gray-500 font-medium text-[12px]">Keterangan</p>
                    <p className="font-semibold text-[16px]">{tx.notes}</p>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubscribeHistory;
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// icons
import dokumenIcon from "../../../assets/icons/dokumen.svg";
import { ChevronDown } from "lucide-react";

// Import data dummy transaksi
import { transaksi } from "../../../assets/data/riwayatTransaksi";
import type { Transaksi } from "../../../assets/data/riwayatTransaksi";

// fungsi format rupiah
function formatRupiah(amount: number): string {
  return "Rp" + amount.toLocaleString("id-ID");
}

// fungsi format tanggal
function formatTimestamp(dateStr: string): string {
  const date = new Date(dateStr);
  const formattedDate = date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  return `08:00 – ${formattedDate}`;
}

export default function DetailTransaksi() {
  const navigate = useNavigate();
  const location = useLocation();
  const id = location.state?.id || "12345"; // Ambil dari state, fallback ke 12345

  const [status, setStatus] = useState<"Berhasil" | "Pending" | "Ditolak">("Pending");
  const [keterangan, setKeterangan] = useState("");
  const [detailTransaksi, setDetailTransaksi] = useState<Transaksi | undefined>(undefined);

  useEffect(() => {
    const foundTransaksi = transaksi.find(trx => trx.id === id);
    if (foundTransaksi) {
      setDetailTransaksi(foundTransaksi);
      setStatus(foundTransaksi.status);
    } else {
      console.error("Transaksi tidak ditemukan untuk ID:", id);
      navigate('/admin/riwayat-transaksi');
    }
  }, [id, navigate]);

  if (!detailTransaksi) {
    return (
      <div className="text-center py-8">
        Memuat data transaksi atau transaksi tidak ditemukan...
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-[22px] font-semibold mb-4">Data Transaksi</h2>

      {/* Bagian detail informasi transaksi (Nama Lengkap, Paket Kursus, dll.) */}
      <div className="space-y-6 text-base">
        <div>
          <p className="font-semibold">Nama Lengkap</p>
          <p>{detailTransaksi.name}</p>
        </div>
        <div>
          <p className="font-semibold">Nama Paket Kursus</p>
          <p>{detailTransaksi.coursePackage}</p>
        </div>
        <div>
          <p className="font-semibold">Timestamp</p>
          <p>{formatTimestamp(detailTransaksi.date)}</p>
        </div>
        <div>
          <p className="font-semibold">ID Transaksi</p>
          <p>{detailTransaksi.id}</p>
        </div>
        <div>
          <p className="font-semibold text-[22px]">Jumlah Transaksi</p>
          <p>{detailTransaksi.amount === 0 ? "Gratis" : formatRupiah(detailTransaksi.amount)}</p>
        </div>

        {/* --- Bagian Bukti Pembayaran (rata kanan, lebar penuh) --- */}
        <div className="w-full ml-auto"> {/* Kontainer untuk Bukti Pembayaran agar rata kanan */}
          <div>
            <p className="font-semibold text-[22px] mb-2">Bukti Pembayaran</p>
            <div className="border rounded-lg px-4 py-6 flex items-center gap-4 w-full"> 
              <img src={dokumenIcon} alt="Dokumen" className="w-16 h-16" />
              <p className="font-medium text-lg">Bukti Pembayaran Paket Kursus</p>
            </div>
          </div>
        </div>

        {/* --- Bagian Status (di bawah Bukti Pembayaran, di sebelah kiri, lebar terkontrol) --- */}
        {/* Tidak ada ml-auto di sini agar tetap di kiri */}
        <div> 
          <p className="font-semibold mb-1 text-[22px]">Status</p>
          <div className="relative w-[10rem]"> {/* Lebar spesifik untuk select box */}
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as "Berhasil" | "Pending" | "Ditolak")}
              className="w-full h-16 px-4 pr-10 py-2 appearance-none focus:outline-none border border-gray-300 rounded-md"
            >
              <option value="Pending">Pending</option>
              <option value="Berhasil">Berhasil</option>
              <option value="Ditolak">Ditolak</option>
            </select>
            <ChevronDown className="w-5 h-5 text-gray-500 absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* --- Bagian Keterangan dan Submit (rata kanan, lebar penuh) --- */}
        {/* Kontainer baru untuk Keterangan dan Submit agar rata kanan */}
        <div className="w-full ml-auto space-y-6"> 

          {status === "Ditolak" && (
            <div>
              <p className="font-semibold text-[22px]">Keterangan</p>
              <textarea
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                rows={5}
                className="mt-1 block w-full rounded py-2 px-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                placeholder="Tulis alasan penolakan..."
              />
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => {
                console.log(`Update transaksi ID: ${detailTransaksi.id}`);
                console.log("Status baru:", status);
                if (status === "Ditolak") {
                  console.log("Keterangan:", keterangan);
                }
                alert(`Status transaksi ${detailTransaksi.id} berhasil diubah menjadi ${status}`);
              }}
              className="px-6 py-3 bg-yellow-500 text-white font-semibold rounded-md hover:bg-yellow-600 transition-colors"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
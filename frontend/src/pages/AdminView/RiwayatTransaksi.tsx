import { useEffect } from "react"; // Import useEffect
import { transaksi } from "../../assets/data/riwayatTransaksi"; //data dummy
import { useNavigate } from 'react-router-dom';
import { useDashboardLayoutContext } from '../../layouts/DashboardLayout'; // Import context DashboardLayout


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

export default function RiwayatTransaksi() { // Nama komponen diganti menjadi RiwayatTransaksi
  const navigate = useNavigate();

  // Ambil setter dari context DashboardLayout
  const { setTitle, setSubtitle } = useDashboardLayoutContext();

  // Gunakan useEffect untuk mengatur judul saat komponen dimuat
  useEffect(() => {
    setTitle("Riwayat Transaksi"); // Judul untuk halaman Riwayat Transaksi
    setSubtitle("Lihat dan verifikasi riwayat transaksi peserta."); // Subjudul yang relevan
    
    // Opsional: Cleanup function jika Anda ingin mengatur ulang judul saat komponen unmount
    // return () => {
    //   setTitle(""); 
    //   setSubtitle("");
    // };
  }, [setTitle, setSubtitle]); // Pastikan dependensi dimasukkan

  return (
    <div className="space-y-4 mt-4"> {/* Tambahkan mt-4 jika perlu margin atas */}
      {transaksi.map((trx) => (
        <div
          key={trx.id}
          className="border border-borderColor rounded-xl p-4 shadow-sm bg-white"
        >
          <div className="grid grid-cols-8 gap-4">
            <div>
              <p className="text-gray-500 font-medium text-[12px]">Nama Lengkap</p>
              <p className="font-semibold text-[16px]">{trx.name}</p>
            </div>
            <div>
              <p className="text-gray-500 font-medium text-[12px]">Nama Paket Kursus</p>
              <p className="font-semibold text-[16px]">{trx.coursePackage}</p>
            </div>
            <div>
              <p className="text-gray-500 font-medium text-[12px]">ID Transaksi</p>
              <p className="font-semibold text-[16px]">{trx.id}</p>
            </div>
            <div>
              <p className="text-gray-500 font-medium text-[12px]">Timestamp</p>
              <p className="font-semibold text-[16px]">{formatTimestamp(trx.date)}</p>
            </div>
            <div>
              <p className="text-gray-500 font-medium text-[12px]">Jumlah</p>
              <p className="font-semibold text-[16px]">
                {trx.amount === 0 ? "Gratis" : formatRupiah(trx.amount)}
              </p>
            </div>
            <div>
              <p className="text-gray-500 font-medium text-[12px]">Status</p>
              <p
                className={`font-semibold text-[16px] ${
                  trx.status === "Pending" ? "text-yellow-600" :
                  trx.status === "Berhasil" ? "text-green-600" :
                  "text-red-600" // Untuk Ditolak
                }`}
              >
                {trx.status}
              </p>
            </div>
            <div>
              <button
                onClick={() => navigate("/admin/riwayat-transaksi/detail-transaksi", {
                  state: { id: trx.id } // Meneruskan ID transaksi yang sebenarnya
                })}
                className="px-5 py-2 border border-blue-500 rounded-md font-semibold text-blue-500 bg-white hover:bg-blue-50">
                Verifikasi
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
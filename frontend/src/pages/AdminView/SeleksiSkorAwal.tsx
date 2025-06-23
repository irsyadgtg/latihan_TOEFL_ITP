import { useNavigate } from "react-router-dom";
import { skor } from "../../assets/data/seleksiSkorAwal"; //data dummy
import { useEffect } from "react"; // Import useEffect
import { useDashboardLayoutContext } from '../../layouts/DashboardLayout'; // Import context DashboardLayout


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

export default function SeleksiSkorAwal() {
  const navigate = useNavigate();

  // Ambil setter dari context DashboardLayout
  const { setTitle, setSubtitle } = useDashboardLayoutContext();

  // Gunakan useEffect untuk mengatur judul saat komponen dimuat
  useEffect(() => {
    setTitle("Seleksi Skor Awal"); // Judul untuk halaman Seleksi Skor Awal
    setSubtitle("Tinjau pengajuan skor awal peserta."); // Subjudul yang relevan
    
    // Opsional: Cleanup function jika Anda ingin mengatur ulang judul saat komponen unmount
    // return () => {
    //   setTitle(""); 
    //   setSubtitle("");
    // };
  }, [setTitle, setSubtitle]); // Pastikan dependensi dimasukkan

  return (
    <div className="space-y-4 mt-4"> {/* Tambahkan mt-4 jika perlu margin atas */}
      {skor.map((trx) => (
        <div
          key={trx.id}
          className="border border-borderColor rounded-xl p-4 shadow-sm bg-white"
        >
          <div className="grid grid-cols-7 gap-4 items-center">
            <div>
              <p className="text-gray-500 font-medium text-[12px]">
                Nama Lengkap
              </p>
              <p className="font-semibold text-[16px]">{trx.name}</p>
            </div>
            <div>
              <p className="text-gray-500 font-medium text-[12px]">Email</p>
              <p className="font-semibold text-[16px]">{trx.email}</p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">Status Pengajuan</p>
              <p
                className={`font-semibold ${
                  trx.status === "Pending"
                    ? "" // Tambahkan kelas warna jika Anda punya, misal: 'text-yellow-500'
                    : '' // Atau 'text-green-500' untuk Disetujui, 'text-red-500' untuk Ditolak
                }`}
              >
                {trx.status}
              </p>
            </div>
            <div>
              <p className="text-gray-500 font-medium text-[12px]">
                Timestamp
              </p>
              <p className="font-semibold text-[16px]">
                {formatTimestamp(trx.date)}
              </p>
            </div>
            <div>
              <p className="text-gray-500 font-medium text-[12px]">
                Masa Berlaku
              </p>
              <p className="font-semibold text-[16px]">
                20/12/2025
              </p>
            </div>
            <div>
              <p className="text-gray-500 font-medium text-[12px]">
                Keterangan
              </p>
              <p className="font-semibold text-[16px]">{trx.keterangan}</p>
            </div>
            <div>
              <button 
                onClick={() => navigate("/admin/seleksi-skor/detail-pengajuan", { state: { id: trx.id } })} // Meneruskan ID
                className="px-5 py-2 border border-blue-500 rounded-md font-semibold text-blue-500 bg-white hover:bg-blue-50">
                Seleksi
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
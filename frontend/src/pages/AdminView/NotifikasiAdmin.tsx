import { useState, useEffect } from "react"; // ⬅️ PENTING
import { notifications as data } from "../../assets/data/notifikasi";
import { Bell } from "lucide-react";
import { useDashboardLayoutContext } from '../../layouts/DashboardLayout'; // Import context DashboardLayout

export default function Notifikasi() { // Nama komponen diganti menjadi Notifikasi
  // filter terbaca atau belum terbaca
  const [filter, setFilter] = useState<"Semua" | "Baca" | "Belum Terbaca">(
    "Semua"
  );

  // Ambil setter dari context DashboardLayout
  const { setTitle, setSubtitle } = useDashboardLayoutContext();

  // Gunakan useEffect untuk mengatur judul saat komponen dimuat
  useEffect(() => {
    setTitle("Notifikasi"); // Judul untuk halaman Notifikasi
    setSubtitle("Lihat semua notifikasi dan pesan Anda."); // Subjudul yang relevan
    
    // Opsional: Cleanup function jika Anda ingin mengatur ulang judul saat komponen unmount
    // return () => {
    //   setTitle(""); 
    //   setSubtitle("");
    // };
  }, [setTitle, setSubtitle]); // Pastikan dependensi dimasukkan

  const filtered = data.filter((item) => {
    if (filter === "Baca") return item.read;
    if (filter === "Belum Terbaca") return !item.read;
    return true;
  });

  return (
    <div className="mt-4"> {/* Tambahkan mt-4 jika perlu margin atas */}
      {/* Filter Buttons */}
      <div className="flex gap-2 mb-6">
        {["Semua", "Baca", "Belum Terbaca"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status as any)}
            className={`px-4 py-2 rounded-full border text-sm font-medium ${
              filter === status
                ? "bg-blue-600 text-white"
                : "bg-white border-blue-600 text-black"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="space-y-4">
        {filtered.map((notif) => (
          <div
            key={notif.id}
            className="border border-gray-300 rounded-xl p-4 flex items-center justify-between bg-white"
          >
            <div className="flex items-center gap-3">
              <Bell className="text-red-600 w-6 h-6" />
              <div className="grid grid-cols-2">
                <p className="text-[16px] font-medium text-black px-4">
                  {notif.message}
                </p>
                <div className="text-gray-600 flex gap-16 mt-1 items-center justify-center w-[28rem]">
                  <span className="text-[18px]">{notif.read ? "Baca" : "Belum Terbaca"}</span>
                  <span className="font-semibold text-[16px]">{notif.time}</span>
                </div>
              </div>
            </div>
            {!notif.read && (
              <button
                onClick={() => (notif.read = true)} // Optional: Mark as read
                className="bg-blue-500 w-[13rem] font-semibold hover:bg-blue-600 duration-200 text-white text-sm px-4 py-3 rounded-full"
              >
                Tandai Terbaca
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
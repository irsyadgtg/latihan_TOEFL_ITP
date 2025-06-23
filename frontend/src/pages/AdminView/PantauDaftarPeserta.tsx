import { useEffect } from "react"; // Import useEffect
import { participants } from "../../assets/data/pantauDaftarPeserta"; //data dummy
import { useDashboardLayoutContext } from '../../layouts/DashboardLayout'; // Import context DashboardLayout

// icons
import Search from "../../assets/icons/search.png";


export default function PantauPeserta() { // Nama komponen diganti menjadi PantauPeserta
  // Ambil setter dari context DashboardLayout
  const { setTitle, setSubtitle } = useDashboardLayoutContext();

  // Gunakan useEffect untuk mengatur judul saat komponen dimuat
  useEffect(() => {
    setTitle("Pantau Peserta"); // Judul untuk halaman Pantau Peserta
    setSubtitle("Lihat status dan progres peserta kursus."); // Subjudul yang relevan
    
    // Opsional: Cleanup function jika Anda ingin mengatur ulang judul saat komponen unmount
    // return () => {
    //   setTitle(""); 
    //   setSubtitle("");
    // };
  }, [setTitle, setSubtitle]); // Pastikan dependensi dimasukkan

  return (
    <div className="mt-4"> {/* Tambahkan mt-4 jika perlu margin atas */}
      {/* input pencarian */}
      <div className="relative w-1/2 mb-6">
        <img
          src={Search}
          alt="Search"
          className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 opacity-60 peer peer-focus:hidden"
        />
        <input
          type="text"
          placeholder="Pencarian"
          className="w-full border border-borderColor rounded-lg pl-10 pr-4 py-2 focus:outline-none"
        />
      </div>
      {/* tabel */}
        <div className="space-y-4">
          {participants.map((p, i) => (
            <div
              key={i}
              className="border border-borderColor rounded-xl p-4 shadow-sm"
            >
              <div className="grid grid-cols-5 gap-4">
                <div>
                  <p className="text-gray-600 text-[12px]">Nama Lengkap</p>
                  <p className="font-semibold text-[16px]">{p.name}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-[12px]">Username</p>
                  <p className="font-semibold text-[16px]">{p.username}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-[12px]">Email</p>
                  <p className="font-semibold text-[16px]">{p.email}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-[12px]">Paket Kursus</p>
                  <p className="font-semibold text-[16px]">
                    {p.coursePackage.toLowerCase() === "free"
                      ? "Free"
                      : `${p.coursePackage}`}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-[12px]">
                    Sisa Masa Berlaku Paket Kursus
                  </p>
                  <p className="font-semibold text-[16px]">
                    {p.remainingTime}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
    </div>
  );
}
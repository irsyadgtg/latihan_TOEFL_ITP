import { useNavigate } from "react-router-dom";
import { useEffect } from "react"; // Import useEffect
import { useDashboardLayoutContext } from '../../layouts/DashboardLayout'; // Import context DashboardLayout
// image
import img1 from "../../assets/image/Kelola-Paket-Kursus/image 25.png";

type CoursePackage = {
  title: string;
  price: string;
  description: string;
  expiredAt: string;
  duration: string;
  isActive: boolean;
  image: string;
};

const coursePackages: CoursePackage[] = [
  {
    title: "TOEFL ITP® Preparation",
    price: "Free",
    description: "Hanya tersedia modul belajar dengan keterbatasan akses",
    expiredAt: "20-09-2025",
    duration: "Free",
    isActive: false,
    image: img1,
  },
  {
    title: "TOEFL ITP® Preparation",
    price: "Rp. 250.000",
    description: "Tersedia pembelajaran modul sesuai rencana belajar.",
    expiredAt: "20-09-2025",
    duration: "6 Bulan",
    isActive: true,
    image: img1,
  },
  {
    title: "TOEFL ITP® Preparation",
    price: "Rp. 475.000",
    description: "Tersedia pembelajaran modul sesuai rencana belajar.",
    expiredAt: "20-09-2025",
    duration: "1 Tahun",
    isActive: true,
    image: img1,
  },
  {
    title: "TOEFL ITP® Preparation",
    price: "Free",
    description: "Hanya tersedia modul belajar dengan keterbatasan akses",
    expiredAt: "20-09-2025",
    duration: "Free",
    isActive: false,
    image: img1,
  },
  {
    title: "TOEFL ITP® Preparation",
    price: "Free",
    description: "Hanya tersedia modul belajar dengan keterbatasan akses",
    expiredAt: "20-09-2025",
    duration: "Free",
    isActive: false,
    image: img1,
  },
  {
    title: "TOEFL ITP® Preparation",
    price: "Rp. 250.000",
    description: "Tersedia pembelajaran modul sesuai rencana belajar.",
    expiredAt: "20-09-2025",
    duration: "6 Bulan",
    isActive: true,
    image: img1,
  },
  {
    title: "TOEFL ITP® Preparation",
    price: "Rp. 475.000",
    description: "Tersedia pembelajaran modul sesuai rencana belajar.",
    expiredAt: "20-09-2025",
    duration: "1 Tahun",
    isActive: true,
    image: img1,
  },
  {
    title: "TOEFL ITP® Preparation",
    price: "Free",
    description: "Hanya tersedia modul belajar dengan keterbatasan akses",
    expiredAt: "20-09-2025",
    duration: "Free",
    isActive: false,
    image: img1,
  },
];

export default function KelolaPaket() {
  const navigate = useNavigate();

  // Ambil setter dari context DashboardLayout
  const { setTitle, setSubtitle } = useDashboardLayoutContext();

  // Gunakan useEffect untuk mengatur judul saat komponen dimuat
  useEffect(() => {
    setTitle("Kelola Paket Kursus"); // Judul untuk halaman Kelola Paket Kursus
    setSubtitle("Tambah dan atur paket kursus yang tersedia."); // Subjudul yang relevan
    
    // Opsional: Cleanup function jika Anda ingin mengatur ulang judul saat komponen unmount
    // return () => {
    //   setTitle(""); 
    //   setSubtitle("");
    // };
  }, [setTitle, setSubtitle]); // Pastikan dependensi dimasukkan

  return (
    <div className="mt-4"> {/* Tambahkan mt-4 jika perlu margin atas */}
      {/* button tambah paket */}
      <div className="flex justify-end items-center mb-4">
        <button
          onClick={() => navigate("/admin/kelola-paket/tambah")}
          className="border border-blue-500 text-blue-500 px-4 py-2 rounded-lg text-[18px] hover:bg-blue-50 transition-all"
        >
          + Tambah Paket Kursus
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
        {coursePackages.map((pkg, index) => (
          <div
            key={index}
            className={`rounded-xl border border-gray-300 p-4 shadow-sm bg-white flex flex-col`}
          >
            <div className="flex gap-4 flex-grow">
              <img
                src={pkg.image}
                alt={pkg.title}
                className="w-[10rem] h-[6rem] md:w-[22rem] md:h-[12rem] object-cover rounded-md"
              />
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-sm text-gray-500 mb-1 underline flex justify-end">
                    {pkg.isActive ? "Paket kursus aktif" : "Paket kursus non-aktif"}
                  </div>
                  {/* Judul: Warna 066993 */}
                  <h3 className="text-lg font-semibold text-[#066993]">
                    {pkg.title}
                  </h3>
                  {/* Harga: Dipindahkan ke bawah judul */}
                  <div className="text-sm text-gray-500 mb-1">
                    {pkg.price.toLowerCase() === "free" ? "Harga Free" : `${pkg.price}`}
                  </div>
                  <p className="text-sm text-gray-800">{pkg.description}</p>
                  <p className="text-sm mt-2 font-medium">{pkg.expiredAt}</p>
                </div>
              </div>
            </div>
            {/* Durasi dan Button Actions (DIKEMBALIKAN KE POSISI SEMULA) */}
            <div className="flex justify-between items-center mt-4">
              <span
                className={`text-sm px-3 py-1 rounded-md font-medium bg-[#FF9C9C] text-white`} // Warna pink #FF9C9C dan teks putih
              >
                {pkg.duration}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate("/admin/kelola-paket/aktivasi")}
                  className="px-4 py-1 rounded-md border border-blue-500 text-blue-500 hover:bg-blue-50 transition-all"
                >
                  Aktivasi
                </button>
                <button
                  onClick={() => navigate("/admin/kelola-paket/ubah-detail")}
                  className="px-4 py-1 rounded-md border border-blue-500 text-blue-500 hover:bg-blue-50 transition-all"
                >
                  Ubah
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
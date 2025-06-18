import { useNavigate } from "react-router-dom";
import Layout from "../../layouts/AdminView";
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

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <Layout
      title="Kelola Paket Kursus"
      note={""}
    >
      <div>
        {/* button tambah paket */}
        <div className="flex justify-end items-center mb-4">
          <button onClick={() => navigate("/tambahPaket")} className="border border-blue-500 text-blue-500 px-4 py-2 rounded-lg text-[18px] hover:bg-blue-50 transition-all">
            + Tambah Paket Kursus
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
          {coursePackages.map((pkg, index) => (
            <div
              key={index}
              className={`rounded-xl border ${
                pkg.isActive ? "border-borderColor" : "border-borderColor"
              } p-4 shadow-sm`}
            >
              <div className="flex gap-4">
                <img
                  src={pkg.image}
                  alt={pkg.title}
                  className="w-[10rem] h-[6rem] md:w-[22rem] md:h-[12rem] object-cover rounded-md"
                />
                <div className="flex-1">
                  {/* paket aktif or non-aktif */}
                  <div className="text-sm text-gray-500 mb-1 underline">
                    {pkg.isActive
                      ? "Paket kursus aktif"
                      : "Paket kursus non-aktif"}
                  </div>
                  {/* price */}
                  <div className="text-sm text-gray-500 mb-1">
                    {pkg.price.toLowerCase() === "free"
                      ? "Harga Free"
                      : `${pkg.price}`}
                  </div>
                  {/* teks preparation */}
                  <h3 className="text-lg font-semibold text-primary">
                    {pkg.title}
                  </h3>
                  <p className="text-sm text-gray-800">{pkg.description}</p>
                  <p className="text-sm mt-2 font-medium">{pkg.expiredAt}</p>
                </div>
              </div>
              {/* Free or Bulanan */}
              <div className="flex justify-between items-center mt-4">
                <span
                  className={`text-sm px-3 py-1 rounded-md font-medium bg-red-200 text-white ${
                    pkg.duration === "Free"
                  }`}
                >
                  {pkg.duration}
                </span>
                {/* button */}
                <div className="flex gap-2">
                  <button onClick={() => navigate("/aktivasi")} className="px-4 py-1 rounded-md border border-blue-500 text-blue-500 hover:bg-blue-50 transition-all">
                    Aktivasi
                  </button>
                  <button onClick={() => navigate("/ubahDetail")} className="px-4 py-1 rounded-md border border-blue-500 text-blue-500 hover:bg-blue-50 transition-all">
                    Ubah
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}

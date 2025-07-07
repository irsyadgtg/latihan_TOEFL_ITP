import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDashboardLayoutContext } from '../../layouts/DashboardLayout';
import axiosInstance from "../../services/axios"; // Pastikan path ini benar ke axiosInstance Anda!

// image fallback jika API tidak menyediakan gambar
import img1 from "../../assets/image/Kelola-Paket-Kursus/image 25.png";

// Interface untuk data yang diterima dari API sesuai dengan respons controller Laravel
type CoursePackageAPIResponse = {
  idPaketKursus: number;
  namaPaket: string;
  harga: string; // Atau number, tergantung bagaimana Anda ingin menampilkannya
  fasilitas: string;
  masaBerlaku: number; // Dalam bulan atau unit durasi lainnya
  aktif: boolean;
  idPegawai: number;
  pegawai?: { // Opsional karena Anda hanya memilih 'idPegawai' dan 'namaLengkap'
    idPegawai: number;
    namaLengkap: string;
  };
  // Asumsi tidak ada 'image' langsung dari endpoint ini, jadi kita akan pakai fallback
  // Asumsi juga tidak ada 'expiredAt' dan 'duration' string langsung, akan dibuat dari 'masaBerlaku'
};

export default function KelolaPaket() {
  const navigate = useNavigate();
  const { setTitle, setSubtitle } = useDashboardLayoutContext();

  const [coursePackages, setCoursePackages] = useState<CoursePackageAPIResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTitle("Kelola Paket Kursus");
    setSubtitle("Tambah dan atur paket kursus yang tersedia.");
  }, [setTitle, setSubtitle]);

  useEffect(() => {
    const fetchCoursePackages = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Menggunakan axiosInstance untuk mengambil data dari endpoint /paket-kursus
        const response = await axiosInstance.get<CoursePackageAPIResponse[]>('/paket-kursus');
        // Asumsi respons langsung berupa array data paket kursus
        setCoursePackages(response.data);
      } catch (err: any) {
        console.error("Error fetching course packages:", err);
        let errorMessage = "Gagal memuat daftar paket kursus. Silakan coba lagi.";
        if (err.response && err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.request) {
          errorMessage = "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.";
        } else {
          errorMessage = err.message || "Terjadi kesalahan tidak dikenal.";
        }
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoursePackages();
  }, []); // Array dependensi kosong agar hanya dijalankan sekali saat komponen di-mount

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-600 text-lg">Memuat paket kursus...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-md" role="alert">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="mt-4">
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
        {coursePackages.length === 0 ? (
          <p className="col-span-full text-center text-gray-500">
            Belum ada paket kursus yang tersedia.
          </p>
        ) : (
          coursePackages.map((pkg) => {
            // Memetakan data API ke properti yang dibutuhkan di UI
            const displayPrice = pkg.harga === "0" ? "Free" : `Rp. ${parseInt(pkg.harga).toLocaleString('id-ID')}`;
            const displayDuration = pkg.masaBerlaku === 0 ? "Free" : `${pkg.masaBerlaku} Bulan`;
            // Untuk expiredAt, karena tidak ada di API, kita bisa tentukan cara tampilkan,
            // atau menghapusnya jika tidak relevan. Untuk contoh, kita bisa buat placeholder.
            // const displayExpiredAt = "N/A"; // Karena tidak ada data 'expiredAt' langsung dari API

            return (
              <div
                key={pkg.idPaketKursus} // Menggunakan ID unik dari API sebagai key
                className={`rounded-xl border border-gray-300 p-4 shadow-sm bg-white flex flex-col`}
              >
                <div className="flex gap-4 flex-grow">
                  {/* Gunakan gambar fallback karena API tidak menyediakan URL gambar */}
                  <img
                    src={img1}
                    alt={pkg.namaPaket}
                    className="w-[10rem] h-[6rem] md:w-[22rem] md:h-[12rem] object-cover rounded-md"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-sm text-gray-500 mb-1 underline flex justify-end">
                        {pkg.aktif ? "Paket kursus aktif" : "Paket kursus non-aktif"}
                      </div>
                      <h3 className="text-lg font-semibold text-[#066993]">
                        {pkg.namaPaket}
                      </h3>
                      <div className="text-sm text-gray-500 mb-1">
                        {displayPrice}
                      </div>
                      <p className="text-sm text-gray-800">{pkg.fasilitas}</p>
                      {/* <p className="text-sm mt-2 font-medium">{displayExpiredAt}</p> */}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <span
                    className={`text-sm px-3 py-1 rounded-md font-medium bg-[#FF9C9C] text-white`}
                  >
                    {displayDuration}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/admin/kelola-paket/aktivasi/${pkg.idPaketKursus}`)} // Teruskan ID
                      className="px-4 py-1 rounded-md border border-blue-500 text-blue-500 hover:bg-blue-50 transition-all"
                    >
                      Aktivasi
                    </button>
                    <button
                      onClick={() => navigate(`/admin/kelola-paket/ubah-detail/${pkg.idPaketKursus}`)} // Teruskan ID
                      className="px-4 py-1 rounded-md border border-blue-500 text-blue-500 hover:bg-blue-50 transition-all"
                    >
                      Ubah
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
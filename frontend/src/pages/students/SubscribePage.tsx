// src/pages/students/SubscribePage.tsx
import React, { useEffect, useState } from "react";
import { useDashboardLayoutContext } from "../../layouts/DashboardLayout";
import PackageCard from "../../components/PackageCard"; // Pastikan path ini benar
import axiosInstance from "../../services/axios"; // Pastikan path ini benar
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios"; // Import AxiosError untuk type checking

// Asumsi default image jika API tidak mengembalikan URL foto
import defaultPackageImage from "/package.png"; // Pastikan path ini benar

// --- Interface PackageData Disesuaikan ---
// Memperbaiki tipe masaBerlaku menjadi 'number' karena backend mengirim angka (contoh: 6 untuk 6 bulan)
// Menambahkan properti 'pegawai' jika Anda ingin menampilkannya suatu saat
interface PackageData {
  idPaketKursus: number;
  namaPaket: string;
  harga: string; // Tetap string karena bisa 'Free' atau '250000.00'
  fasilitas: string;
  masaBerlaku: number; // <-- Diubah menjadi number
  aktif: boolean;
  pegawai?: { // <-- Ditambahkan (opsional)
    idPegawai: number;
    namaLengkap: string;
  };
}

const SubscribePage: React.FC = () => {
  const { setTitle, setSubtitle } = useDashboardLayoutContext();
  const navigate = useNavigate();

  const [packages, setPackages] = useState<PackageData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTitle("Berlangganan Paket Kursus");
    setSubtitle(
      "Melihat paket kursus yang tersedia untuk berlangganan belajar TOEFL ITP. Anda harus memiliki pengajuan skor awal yang telah disetujui, masih berlaku, dan mendapatkan feedback rencana belajar terlebih dahulu"
    );

    fetchPackages();
  }, [setTitle, setSubtitle]); // Dependencies ditambahkan untuk useEffect

  const fetchPackages = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.get<PackageData[]>("/peserta/paket-kursus");
      setPackages(response.data);
    } catch (err) {
      console.error("Gagal mengambil paket:", err);
      if (err instanceof AxiosError) {
        if (err.response) {
          if (err.response.status === 401 && err.response.data.message === "Unauthenticated.") {
            setError("Sesi Anda telah berakhir. Silakan login kembali.");
            // Idealnya, Anda juga menghapus token autentikasi di sini
            navigate("/login");
          } else if (err.response.data && err.response.data.message) {
            setError(err.response.data.message);
          } else {
            setError(`Terjadi kesalahan: ${err.response.status} ${err.response.statusText || "Error"}`);
          }
        } else if (err.request) {
          setError("Tidak dapat terhubung ke server. Pastikan koneksi internet Anda aktif atau server sedang berjalan.");
        } else {
          setError("Terjadi kesalahan saat mengatur permintaan. Silakan coba lagi.");
        }
      } else {
        setError("Terjadi kesalahan tak terduga.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Fungsi helper untuk memformat masa berlaku dari angka ke string
  const formatMasaBerlaku = (months: number): string => {
    if (months === 0) return "Gratis";
    if (months === 12) return "1 Tahun";
    if (months > 12 && months % 12 === 0) {
      return `${months / 12} Tahun`;
    }
    return `${months} Bulan`;
  };

  const handlePackageClick = (packageId: number) => {
    navigate(`/student/langganan/form?packageId=${packageId}`);
  };

  // --- Render Kondisional ---
  if (loading) {
    return (
      <div className="mt-4 p-6 rounded-lg bg-white text-center text-gray-600">
        Memuat daftar paket kursus...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-4 p-6 rounded-lg bg-red-100 border border-red-400 text-red-700 text-center">
        <p>{error}</p>
        <button
          onClick={fetchPackages}
          className="mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div>
      {packages.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-5">
          {packages.map((pkg) => {
            // Memeriksa harga "Free" atau 0
            const isFreePackage = pkg.harga.toLowerCase() === "free" || parseFloat(pkg.harga) === 0;
            const displayPrice = isFreePackage ? "Gratis" : `Rp${parseInt(pkg.harga).toLocaleString("id-ID")}`;

            return (
              <PackageCard
                key={pkg.idPaketKursus}
                image={defaultPackageImage}
                title={pkg.namaPaket}
                price={displayPrice}
                description={pkg.fasilitas}
                date={""} // <-- Diubah menjadi string kosong untuk menghilangkan teks hitam
                label={formatMasaBerlaku(pkg.masaBerlaku)} // Tetap menggunakan fungsi format untuk label pink
                isBeli={!isFreePackage && pkg.aktif}
                onClick={() => handlePackageClick(pkg.idPaketKursus)}
              />
            );
          })}
        </div>
      ) : (
        <div className="text-gray-500 text-center py-8">
          Tidak ada paket kursus yang tersedia.
        </div>
      )}
    </div>
  );
};

export default SubscribePage;

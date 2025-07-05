// src/pages/students/SubscribePage.tsx
import React, { useEffect, useState } from "react";
import { useDashboardLayoutContext } from "../../layouts/DashboardLayout";
import PackageCard from "../../components/PackageCard"; // Pastikan path ini benar
import axiosInstance from "../../services/axios"; // Pastikan path ini benar
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios"; // Import AxiosError untuk type checking

// Asumsi default image jika API tidak mengembalikan URL foto
import defaultPackageImage from "/package.png"; // Pastikan path ini benar

// Definisikan interface untuk struktur data paket dari API
// Sesuaikan nama field ini agar SAMA PERSIS dengan yang dikirim backend Anda dari /peserta/paket-kursus
interface PackageData {
  idPaketKursus: number; // ID unik paket dari API
 
  namaPaket: string;     // Misal: "TOEFL ITP® Preparation"
  harga: string;         // Misal: "Free", "250000" (string dari backend)
  fasilitas: string;     // Misal: "Hanya tersedia modul belajar dengan keterbatasan akses" (ini adalah 'description')
  masaBerlaku: string;   // Misal: "6 Bulan", "1 Tahun", "Free" (ini adalah 'duration_langganan')
  aktif: boolean;        // Status aktif/non-aktif
  // Anda bisa menambahkan properti lain dari 'pegawai' jika diperlukan, atau URL foto jika backend menyediakannya
  // urlFotoPaket?: string; // Jika backend menyediakan URL foto paket

  namaPaket: string; // Misal: "TOEFL ITP® Preparation"
  harga: string; // Misal: "Free", "250000" (string dari backend)
  fasilitas: string; // Misal: "Hanya tersedia modul belajar dengan keterbatasan akses" (ini adalah 'description')
  masaBerlaku: number; // Mengubah dari 'string' menjadi 'number' karena sepertinya backend mengirim angka (misal: 6 untuk 6 Bulan)
  aktif: boolean; // Status aktif/non-aktif 
  // Menambahkan relasi pegawai jika backend mengirimkannya (sesuaikan dengan output 'pegawai:idPegawai,namaLengkap')
  pegawai?: {
    idPegawai: number;
    namaLengkap: string;
  };

}

const SubscribePage: React.FC = () => {
  const { setTitle, setSubtitle } = useDashboardLayoutContext();
  const navigate = useNavigate();

  // State untuk menyimpan data paket dari API
  const [packages, setPackages] = useState<PackageData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTitle("Berlangganan Paket Kursus");
    setSubtitle(
      "Melihat paket kursus yang tersedia untuk berlangganan belajar TOEFL ITP. Anda harus memiliki pengajuan skor awal yang telah disetujui, masih berlaku, dan mendapatkan feedback rencana belajar terlebih dahulu"
    );

    fetchPackages();
  }, [setTitle, setSubtitle]);

  const fetchPackages = async () => {
    setLoading(true);
    setError(null);

    try {
      // Melakukan GET request ke endpoint /peserta/paket-kursus
<<<<<<< HEAD
      const response = await axiosInstance.get<PackageData[]>('/peserta/paket-kursus');
      
      // === PENTING: Sesuaikan ini dengan struktur respons API Anda ===
      // Controller Laravel Anda `indexPeserta` langsung mengembalikan array.
      setPackages(response.data); // Karena respons langsung array, gunakan response.data
    } catch (err) {
      console.error("Failed to fetch packages:", err);
      if (err instanceof AxiosError) {
        if (err.response) {
          if (err.response.status === 401 && err.response.data.message === 'Unauthenticated.') {
            setError("Sesi Anda telah berakhir. Silakan login kembali.");
            // Pertimbangkan untuk melakukan clear token/session di sini
            navigate('/login'); // Arahkan ke halaman login peserta
          } else if (err.response.data && err.response.data.message) {
            setError(err.response.data.message);
          } else {
            setError(`Terjadi kesalahan: ${err.response.status} ${err.response.statusText || 'Error'}`);
          }
        } else if (err.request) {
          setError("Tidak dapat terhubung ke server. Pastikan koneksi internet Anda aktif atau server sedang berjalan.");
        } else {
          setError("Terjadi kesalahan saat mengatur permintaan. Silakan coba lagi.");
        }
      } else {
        setError("Terjadi kesalahan tidak terduga.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk menangani klik pada PackageCard
  const handlePackageClick = (packageId: number) => { // Menggunakan number karena idPaketKursus adalah number
    // Di sini Anda bisa menavigasi ke halaman detail paket atau form langganan
    // Menggunakan packageId dari idPaketKursus
    navigate(`/student/langganan/form?packageId=${packageId}`); // Contoh: passing packageId via query parameter
  };

  if (loading) {
    return (
      <div className="mt-4 p-6 rounded-lg bg-white text-center text-gray-600">
        Memuat daftar paket kursus...
      </div>
    );
  }

=======
      // Axios secara otomatis akan melakukan deserialisasi JSON
      const response = await axiosInstance.get<PackageData[]>('/peserta/paket-kursus');

      // Karena respons langsung array, gunakan response.data
      setPackages(response.data);
    } catch (err) {
      console.error("Failed to fetch packages:", err);
      if (err instanceof AxiosError) {
        if (err.response) {
          if (err.response.status === 401 && err.response.data.message === 'Unauthenticated.') {
            setError("Sesi Anda telah berakhir. Silakan login kembali.");
            // Pertimbangkan untuk melakukan clear token/session di sini
            navigate('/login'); // Arahkan ke halaman login peserta
          } else if (err.response.data && err.response.data.message) {
            setError(err.response.data.message);
          } else {
            setError(`Terjadi kesalahan: ${err.response.status} ${err.response.statusText || 'Error'}`);
          }
        } else if (err.request) {
          setError("Tidak dapat terhubung ke server. Pastikan koneksi internet Anda aktif atau server sedang berjalan.");
        } else {
          setError("Terjadi kesalahan saat mengatur permintaan. Silakan coba lagi.");
        }
      } else {
        setError("Terjadi kesalahan tidak terduga.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk menangani klik pada PackageCard
  const handlePackageClick = (packageId: number) => {
    // Di sini Anda bisa menavigasi ke halaman detail paket atau form langganan
    // Menggunakan packageId dari idPaketKursus
    navigate(`/student/langganan/form?packageId=${packageId}`); // Contoh: passing packageId via query parameter
  };

  // Fungsi helper untuk memformat masa berlaku
  const formatMasaBerlaku = (months: number): string => {
    if (months === 0) return "Gratis"; // Jika 0 bulan, asumsikan gratis atau tidak terbatas
    if (months === 12) return "1 Tahun";
    if (months > 12 && months % 12 === 0) {
      return `${months / 12} Tahun`;
    }
    return `${months} Bulan`;
  };

  if (loading) {
    return (
      <div className="mt-4 p-6 rounded-lg bg-white text-center text-gray-600">
        Memuat daftar paket kursus...
      </div>
    );
  }

>>>>>>> 3107e1a3 (ngambil data backend yang kurang)
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
<<<<<<< HEAD
            const isFreePackage = pkg.harga.toLowerCase() === 'free';
            const displayPrice = isFreePackage ? "Free" : `Rp${parseInt(pkg.harga).toLocaleString('id-ID')}`;
            
            return (
              <PackageCard 
=======
            const isFreePackage = pkg.harga.toLowerCase() === 'free' || parseFloat(pkg.harga) === 0;
            const displayPrice = isFreePackage ? "Gratis" : `Rp${parseInt(pkg.harga).toLocaleString('id-ID')}`;
            
            return (
              <PackageCard
>>>>>>> 3107e1a3 (ngambil data backend yang kurang)
                key={pkg.idPaketKursus} // Menggunakan idPaketKursus sebagai key
                image={defaultPackageImage} // Tetap menggunakan default image karena API tidak menyediakan urlFotoPaket
                title={pkg.namaPaket}
                price={displayPrice}
                description={pkg.fasilitas} // 'fasilitas' dari API menjadi 'description' di card
<<<<<<< HEAD
                date={pkg.masaBerlaku} // 'masaBerlaku' dari API menjadi 'date' di card
                label={pkg.masaBerlaku} // 'masaBerlaku' juga menjadi 'label' di card
=======
                date={formatMasaBerlaku(pkg.masaBerlaku)} // Format masaBerlaku untuk tampilan
                label={formatMasaBerlaku(pkg.masaBerlaku)} // Gunakan format yang sama untuk label
>>>>>>> 3107e1a3 (ngambil data backend yang kurang)
                isBeli={!isFreePackage && pkg.aktif} // Tombol beli aktif jika bukan free dan paketnya aktif
                onClick={() => handlePackageClick(pkg.idPaketKursus)} // Teruskan idPaketKursus
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
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDashboardLayoutContext } from '../../../layouts/DashboardLayout';
import axiosInstance from "../../../services/axios"; // Pastikan path ini benar!

// Anda mungkin ingin menambahkan interface untuk payload request POST
interface CreateCoursePackagePayload {
  namaPaket: string;
  harga: number; // Harga sebaiknya dikirim sebagai number ke backend
  fasilitas: string;
  masaBerlaku: number; // Masa berlaku juga sebagai number (misalnya, dalam bulan)
}

export default function TambahPaketKursus() {
  const navigate = useNavigate();
  const { setTitle, setSubtitle } = useDashboardLayoutContext();

  // State untuk form input
  const [namaPaket, setNamaPaket] = useState<string>("");
  const [harga, setHarga] = useState<string>(""); // Tetap string untuk input, akan di-parse saat submit
  const [fasilitas, setFasilitas] = useState<string>("");
  const [masaBerlaku, setMasaBerlaku] = useState<string>(""); // Tetap string untuk input

  // State untuk loading dan error
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setTitle("Tambah Paket Kursus");
    setSubtitle("Isi detail untuk paket kursus baru.");
  }, [setTitle, setSubtitle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    // Validasi sederhana di sisi klien
    if (!namaPaket || !harga || !fasilitas || !masaBerlaku) {
      setError("Semua bidang harus diisi.");
      setIsLoading(false);
      return;
    }

    const parsedHarga = parseInt(harga.replace(/[^0-9]/g, '')); // Bersihkan input harga
    const parsedMasaBerlaku = parseInt(masaBerlaku);

    if (isNaN(parsedHarga) || parsedHarga < 0) {
      setError("Harga harus angka positif.");
      setIsLoading(false);
      return;
    }

    if (isNaN(parsedMasaBerlaku) || parsedMasaBerlaku < 0) {
      setError("Masa berlaku harus angka positif.");
      setIsLoading(false);
      return;
    }

    const payload: CreateCoursePackagePayload = {
      namaPaket,
      harga: parsedHarga,
      fasilitas,
      masaBerlaku: parsedMasaBerlaku,
    };

    try {
      // Mengirim data ke endpoint POST /paket-kursus
      const response = await axiosInstance.post('/paket-kursus', payload);
      setSuccess(response.data.message || "Paket kursus berhasil ditambahkan!");
      
      // Kosongkan form setelah sukses
      setNamaPaket("");
      setHarga("");
      setFasilitas("");
      setMasaBerlaku("");

      // Opsional: Navigasi kembali setelah beberapa detik atau langsung
      setTimeout(() => {
        navigate("/admin/kelola-paket");
      }, 2000); // Redirect setelah 2 detik
    } catch (err: any) {
      console.error("Error creating course package:", err);
      let errorMessage = "Gagal menambahkan paket kursus. Silakan coba lagi.";
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

  // Fungsi untuk memformat input harga menjadi Rupiah saat pengguna mengetik
  const formatRupiah = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, ''); // Hapus semua karakter non-angka
    if (!numericValue) return '';
    
    return 'Rp. ' + parseInt(numericValue).toLocaleString('id-ID');
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHarga(formatRupiah(e.target.value));
  };


  return (
    <div className="w-full py-2">
      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Input Nama Paket */}
        <div>
          <label htmlFor="namaPaket" className="block text-[22px] font-semibold mb-1">
            Nama Paket
          </label>
          <input
            type="text"
            id="namaPaket"
            placeholder="Masukkan nama paket"
            className="w-full h-16 border border-borderColor rounded-xl px-4 py-2 focus:outline-none"
            value={namaPaket}
            onChange={(e) => setNamaPaket(e.target.value)}
            required
          />
        </div>

        {/* Input Harga */}
        <div>
          <label htmlFor="harga" className="block text-[22px] font-semibold mb-1">
            Harga
          </label>
          <input
            type="text"
            id="harga"
            placeholder="Contoh: Rp. 250.000"
            className="w-full h-16 border border-borderColor rounded-xl px-4 py-2 focus:outline-none"
            value={harga}
            onChange={handlePriceChange}
            required
          />
        </div>

        {/* Input Fasilitas (saya ubah kembali ke textarea karena fasilitas biasanya multi-line) */}
        <div className="rounded-md flex flex-col justify-start h-full">
          <label htmlFor="fasilitas" className="block font-semibold mb-1 text-[22px]">
            Fasilitas
          </label>
          <textarea
            id="fasilitas"
            placeholder="Tuliskan fasilitas yang tersedia (pisahkan dengan koma atau baris baru)"
            className="w-full h-32 border border-borderColor rounded-xl px-4 py-2 focus:outline-none resize-y"
            value={fasilitas}
            onChange={(e) => setFasilitas(e.target.value)}
            required
          />
        </div>

        {/* Input Masa Berlaku Paket Kursus */}
        <div>
          <label htmlFor="masaBerlaku" className="block text-[22px] font-semibold mb-1">
            Masa Berlaku Paket Kursus (dalam bulan)
          </label>
          <input
            type="number" // Menggunakan type="number" untuk input numerik
            id="masaBerlaku"
            placeholder="Contoh: 6 (untuk 6 bulan)"
            className="w-full h-16 border rounded-xl px-4 py-2 border-borderColor focus:outline-none"
            value={masaBerlaku}
            onChange={(e) => setMasaBerlaku(e.target.value)}
            min="0" // Masa berlaku tidak boleh negatif
            required
          />
        </div>

        {/* Pesan status (loading, error, success) */}
        {isLoading && (
          <div className="text-blue-600 text-center text-lg mt-4">
            Menyimpan paket kursus...
          </div>
        )}
        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-center">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded-md text-center">
            {success}
          </div>
        )}

        {/* button simpan */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-secondary w-[16rem] text-white font-semibold text-[20px] py-3 px-8 rounded-lg hover:bg-secondary/80 duration-200"
            disabled={isLoading} // Nonaktifkan tombol saat loading
          >
            {isLoading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>
    </div>
  );
}
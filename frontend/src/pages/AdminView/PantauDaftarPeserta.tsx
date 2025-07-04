import { useEffect, useState, ChangeEvent } from "react";
import { useDashboardLayoutContext } from '../../layouts/DashboardLayout';
import axiosInstance from "../../services/axios";
import { useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";

// icons
import Search from "../../assets/icons/search.png";

// Definisikan interface untuk struktur data Peserta dari API
// SESUAI DENGAN respons PantauPesertaController::index
interface ParticipantData {
  // Tidak ada properti 'id' yang eksplisit di respons map backend,
  // jadi kita akan menggunakan 'username' sebagai key karena seharusnya unik.
  namaLengkap: string;
  username: string;
  email: string;
  paketKursus: string | null; // Nama paket, bisa null
  sisaMasaBerlaku: number | null; // Sisa hari, bisa null
}

export default function PantauPeserta() {
  const { setTitle, setSubtitle } = useDashboardLayoutContext();
  const navigate = useNavigate();

  const [participants, setParticipants] = useState<ParticipantData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    setTitle("Pantau Peserta");
    setSubtitle("Lihat status dan progres peserta kursus.");

    // Panggil fungsi untuk mengambil data peserta setiap kali searchTerm berubah
    // atau saat komponen pertama kali dimuat
    const delayDebounceFn = setTimeout(() => {
      fetchParticipants();
    }, 500); // Debounce 500ms untuk pencarian

    return () => clearTimeout(delayDebounceFn); // Cleanup debounce timer
  }, [setTitle, setSubtitle, searchTerm, navigate]); // Tambahkan 'navigate' ke dependency

  const fetchParticipants = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = '/admin/pantau-peserta';
      // Jika ada searchTerm, tambahkan sebagai query parameter
      if (searchTerm) {
        url += `?search=${encodeURIComponent(searchTerm)}`;
      }

      // PERBAIKAN: Mengambil data dari response.data.data
      const response = await axiosInstance.get<{ data: ParticipantData[] }>(url);

      setParticipants(response.data.data || []); // Mengakses array peserta dari properti 'data'
      
      // DEBUGGING: Cetak respons untuk verifikasi
      console.log("API Response for participants:", response.data);
      console.log("Participants data after processing:", response.data.data);

    } catch (err) {
      console.error("Failed to fetch participants:", err);
      if (axios.isAxiosError(err)) {
        if (err.response) {
          if (err.response.status === 401 && (err.response.data as any)?.message === 'Unauthenticated.') {
            setError("Sesi Anda telah berakhir. Silakan login kembali.");
            localStorage.removeItem('AuthToken'); // Pastikan token dihapus
            navigate('/admin/login'); // Arahkan ke login admin
          } else if (err.response.data && typeof err.response.data === 'object' && 'message' in err.response.data) {
            setError(err.response.data.message as string);
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

  // Handle perubahan input pencarian
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Fungsi untuk memformat sisa masa berlaku
  const formatRemainingTime = (days: number | null): string => {
    if (days === null) {
      return "-";
    }
    if (days > 0) {
      return `${days} hari`;
    } else if (days === 0) {
      return "Hari ini berakhir";
    } else {
      return "Telah berakhir"; // Jika days < 0
    }
  };

  return (
    <div className="mt-4">
      {/* input pencarian */}
      <div className="relative w-1/2 mb-6">
        <img
          src={Search}
          alt="Search"
          className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 opacity-60 peer peer-focus:hidden"
        />
        <input
          type="text"
          placeholder="Pencarian nama atau username peserta..."
          className="w-full border border-borderColor rounded-lg pl-10 pr-4 py-2 focus:outline-none"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      {/* Tampilkan Loading, Error, atau Data Peserta */}
      {loading && <div className="text-gray-600 text-center py-4">Memuat data peserta...</div>}
      {error && (
        <div className="text-red-500 text-center py-4">
          {error}
          <button
            onClick={fetchParticipants} // Tombol coba lagi untuk error
            className="mt-2 ml-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-4">
          {participants.length > 0 ? (
            participants.map((p) => (
              <div
                key={p.username} // PERBAIKAN: Gunakan username sebagai key (asumsi unik)
                className="border border-borderColor rounded-xl p-4 shadow-sm"
              >
                <div className="grid grid-cols-5 gap-4">
                  <div>
                    <p className="text-gray-600 text-[12px]">Nama Lengkap</p>
                    <p className="font-semibold text-[16px]">{p.namaLengkap}</p> {/* PERBAIKAN: namaLengkap */}
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
                      {p.paketKursus ? p.paketKursus : "Belum ada"} {/* PERBAIKAN: paketKursus */}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-[12px]">
                      Sisa Masa Berlaku Paket Kursus
                    </p>
                    <p className="font-semibold text-[16px]">
                      {formatRemainingTime(p.sisaMasaBerlaku)} {/* PERBAIKAN: sisaMasaBerlaku */}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-gray-500 text-center py-8">Tidak ada peserta yang ditemukan.</div>
          )}
        </div>
      )}
    </div>
  );
}
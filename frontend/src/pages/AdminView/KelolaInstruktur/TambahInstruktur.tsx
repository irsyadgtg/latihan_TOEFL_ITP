import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useDashboardLayoutContext } from '../../../layouts/DashboardLayout';
import axiosInstance from "../../../services/axios";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";

// icons
import { ChevronDown } from "lucide-react";
// ✅ Import format, addDays
import { format, addDays } from 'date-fns';

// Definisikan interface untuk struktur data instruktur
interface InstrukturFormData {
  keahlian: string;
  waktuMulai: string;
  waktuBerakhir: string;
  tglKetersediaan: string; // Format 'YYYY-MM-DD'
  username: string;
  email: string;
  foto: File | null; // File objek untuk diupload
  namaLengkap: string;
  nikNip: string; // Tetap camelCase di frontend
}

export default function TambahInstruktur() {
  const { setTitle, setSubtitle } = useDashboardLayoutContext();
  const navigate = useNavigate();

  // ✅ FUNGSI HELPER BARU: Mengambil tanggal hari ini (atau hari berikutnya) di awal hari UTC
  const getTodayOrTomorrowUTCFormatted = (offsetDays: number = 0) => {
    const today = new Date();
    // Atur ke awal hari UTC
    today.setUTCHours(0, 0, 0, 0); 
    // Tambahkan offset hari
    const targetDate = addDays(today, offsetDays);
    // Format ke YYYY-MM-DD
    return format(targetDate, 'yyyy-MM-dd');
  };

  // State untuk menyimpan data form
  const [formData, setFormData] = useState<InstrukturFormData>({
    keahlian: "",
    waktuMulai: "08:00",
    waktuBerakhir: "16:00",
    // ✅ Menggunakan tanggal hari ini di awal UTC sebagai default.
    // Jika masih error, coba getTodayOrTomorrowUTCFormatted(1) untuk tanggal besok di UTC.
    tglKetersediaan: getTodayOrTomorrowUTCFormatted(0), 
    username: "",
    email: "",
    foto: null,
    namaLengkap: "",
    nikNip: "",
  });

  // State untuk error dan success message
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  // State untuk loading saat submit form
  const [loading, setLoading] = useState<boolean>(false);

  // Gunakan useEffect untuk mengatur judul saat komponen dimuat
  useEffect(() => {
    setTitle("Kelola Instruktur");
    setSubtitle("Tambah data instruktur baru.");
  }, [setTitle, setSubtitle]);

  // Handle perubahan input form
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const target = e.target as HTMLInputElement;

    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "file" ? (target.files ? target.files[0] : null) : value,
    }));
  };

  // Handle submit form
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const dataToSend = new FormData();
    dataToSend.append("keahlian", formData.keahlian);
    dataToSend.append("waktuMulai", formData.waktuMulai);
    dataToSend.append("waktuBerakhir", formData.waktuBerakhir);
    dataToSend.append("tglKetersediaan", formData.tglKetersediaan); 
    dataToSend.append("username", formData.username);
    dataToSend.append("email", formData.email);
    dataToSend.append("namaLengkap", formData.namaLengkap);
    dataToSend.append("nik_nip", formData.nikNip); // Mengirim 'nik_nip' ke backend

    if (formData.foto) {
      dataToSend.append("foto", formData.foto);
    }

    // ✅ DEBUGGING: Log FormData sebelum mengirim
    console.log("--- FormData yang akan dikirim ---");
    for (let pair of dataToSend.entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }
    console.log("---------------------------------");

    try {
      const response = await axiosInstance.post("/admin/instruktur", dataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log("Instruktur berhasil ditambahkan:", response.data);

      setSuccessMessage("Instruktur berhasil ditambahkan!");
      // Reset form setelah berhasil
      setFormData({
        keahlian: "",
        waktuMulai: "08:00",
        waktuBerakhir: "16:00",
        tglKetersediaan: getTodayOrTomorrowUTCFormatted(0), // ✅ Reset ke tanggal hari ini UTC
        username: "",
        email: "",
        foto: null,
        namaLengkap: "",
        nikNip: "",
      });

    } catch (err) {
      console.error("Terjadi kesalahan saat menambahkan instruktur:", err);
      if (err instanceof AxiosError && err.response) {
        if (err.response.data && err.response.data.errors) {
            const validationErrors = Object.entries(err.response.data.errors)
                .map(([field, messages]) => {
                    return `${field}: ${(Array.isArray(messages) ? messages : [messages]).join(', ')}`;
                })
                .join('; ');
            setError(`Validasi Gagal: ${validationErrors}`);
        } else if (err.response.data && err.response.data.message) {
            setError(err.response.data.message);
        } else {
            setError("Terjadi kesalahan pada server. Silakan coba lagi.");
        }

        if (err.response.data.message === 'Unauthenticated.') {
          navigate('/admin/login');
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Terjadi kesalahan jaringan atau tak terduga. Silakan coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full py-2 ">
      {/* Form */}
      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Input Nama Lengkap */}
        <div>
          <label className="block text-[22px] font-semibold mb-1">
            Nama Lengkap
          </label>
          <input
            type="text"
            name="namaLengkap"
            placeholder="Masukkan nama lengkap"
            className="w-full h-16 border border-borderColor rounded-xl px-4 py-2 focus:outline-none"
            value={formData.namaLengkap}
            onChange={handleChange}
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-[22px] font-semibold mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            placeholder="Masukkan E-mail pengguna"
            className="w-full h-16 border border-borderColor rounded-xl px-4 py-2 focus:outline-none"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        {/* Keahlian */}
        <div className="rounded-md flex flex-col justify-start h-full">
          <label className="block font-semibold mb-4 text-[22px]">
            Keahlian
          </label>
          <div className="relative w-full">
            <select
              name="keahlian"
              className="w-full h-16 border rounded-xl px-4 pr-10 py-2 border-borderColor appearance-none focus:outline-none"
              value={formData.keahlian}
              onChange={handleChange}
              required
            >
              <option value="">Pilih keahlian</option>
              <option value="Structure Written">Structure Written</option>
              <option value="Listening">Listening</option>
              <option value="Reading">Reading</option>
              {/* Tambahkan opsi keahlian lain jika ada */}
            </select>
            <ChevronDown className="w-5 h-5 text-gray-500 absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Username */}
        <div>
          <label className="block text-[22px] font-semibold mb-1">
            Username
          </label>
          <input
            type="text"
            name="username"
            placeholder="Masukkan username"
            className="w-full h-16 border border-borderColor rounded-xl px-4 py-2 focus:outline-none"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>

        {/* NIK/NIP */}
        <div>
          <label className="block text-[22px] font-semibold mb-1">
            NIK/NIP
          </label>
          <input
            type="text"
            name="nikNip" 
            placeholder="Masukkan NIK/NIP"
            className="w-full h-16 border border-borderColor rounded-xl px-4 py-2 focus:outline-none"
            value={formData.nikNip}
            onChange={handleChange}
            required
          />
        </div>

        {/* Unggah Foto */}
        <div>
          <label className="block text-[22px] font-semibold mb-1">Foto</label>
          <div className="flex items-center border border-borderColor rounded-xl overflow-hidden p-4">
            <label
              htmlFor="foto"
              className="bg-blue-600 rounded-md text-white px-4 py-2 text-sm font-medium cursor-pointer"
            >
              Unggah
            </label>
            <input
              id="foto"
              type="file"
              name="foto"
              accept="image/*"
              className="flex-1 px-4 py-2 text-gray-500 text-sm focus:outline-none"
              onChange={handleChange}
              required
            />
            {formData.foto && (
              <span className="ml-2 text-gray-700">
                {formData.foto.name}
              </span>
            )}
          </div>
        </div>

        {/* Ketersediaan */}
        <div className="grid grid-cols-2 gap-6 ">
          {/* Ketersediaan */}
          <div className="rounded-md flex flex-col justify-start h-full">
            <label className="block font-semibold mb-4 text-[22px]">
              Ketersediaan
            </label>

            {/* Grid 2 Kolom */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-[52rem]">
              {/* Kolom Kiri: Mulai & Berakhir */}
              <div className="space-y-4">
                {/* Mulai */}
                <div className="flex items-center gap-4">
                  <label className="text-[18px] w-24">Mulai</label>
                  <div className="relative w-full flex-1">
                    <select
                      name="waktuMulai"
                      className="w-full h-16 border rounded-xl px-4 pr-10 py-2 border-borderColor appearance-none focus:outline-none"
                      value={formData.waktuMulai}
                      onChange={handleChange}
                      required
                    >
                      <option value="08:00">08:00</option>
                      <option value="09:00">09:00</option>
                      <option value="10:00">10:00</option>
                      <option value="11:00">11:00</option>
                      <option value="12:00">12:00</option>
                      <option value="13:00">13:00</option>
                      <option value="14:00">14:00</option>
                      <option value="15:00">15:00</option>
                      <option value="16:00">16:00</option>
                      <option value="17:00">17:00</option>
                      <option value="18:00">18:00</option>
                      <option value="19:00">19:00</option>
                      <option value="20:00">20:00</option>
                    </select>
                    <ChevronDown className="w-5 h-5 text-gray-500 absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Berakhir */}
                <div className="flex items-center gap-4">
                  <label className="text-[18px] w-24">Berakhir</label>
                  <div className="relative w-full flex-1">
                    <select
                      name="waktuBerakhir"
                      className="w-full h-16 border rounded-xl px-4 pr-10 py-2 border-borderColor appearance-none focus:outline-none"
                      value={formData.waktuBerakhir}
                      onChange={handleChange}
                      required
                    >
                      <option value="15:00">15:00</option>
                      <option value="17:00">17:00</option>
                      <option value="18:00">18:00</option>
                      <option value="19:00">19:00</option>
                      <option value="20:00">20:00</option>
                      <option value="21:00">21:00</option>
                      <option value="22:00">22:00</option>
                    </select>
                    <ChevronDown className="w-5 h-5 text-gray-500 absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Kolom Kanan: Tanggal */}
              <div className="flex items-start gap-4 h-full">
                <label className="text-[18px] w-24 mt-5">Tanggal</label>
                <input
                  type="date"
                  name="tglKetersediaan"
                  className="w-full flex-1 h-16 border rounded-xl px-4 py-2 border-borderColor focus:outline-none"
                  value={formData.tglKetersediaan}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Display loading, error, or success message */}
        {loading && <div className="text-blue-600 text-center py-2">Mengirim data instruktur...</div>}
        {error && (
          <div className="text-red-500 text-sm mt-2">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="text-green-600 text-sm mt-2">
            {successMessage}
          </div>
        )}

        {/* button kirim undangan */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-secondary text-white font-semibold text-[20px] py-3 px-8 rounded-lg hover:bg-secondary/80 duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            Kirim Undangan
          </button>
        </div>
      </form>
    </div>
  );
}
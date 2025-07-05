import { useState, useEffect, ChangeEvent } from "react";
import { FaEdit } from "react-icons/fa";
// Import DayPicker dan format jika Anda memang ingin menggunakannya untuk tanggal lahir
import { format } from 'date-fns'; // Asumsi untuk format tanggal
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

import { useDashboardLayoutContext } from '../../layouts/DashboardLayout';
import axiosInstance from "../../services/axios"; // Pastikan path ini benar
import { AxiosError } from "axios"; // Import AxiosError
import { useNavigate } from "react-router-dom"; // Import useNavigate

// Definisikan interface untuk struktur data profil admin dari API
interface AdminProfileAPIResponse {
  username: string;
  email: string;
  namaLengkap: string;
  nik_nip: string; // NIK/NIP
  nomorTelepon: string;
  alamat: string;
  urlFotoProfil?: string; // URL gambar profil dari API, opsional
  // Jika ada tanggal lahir di API, tambahkan di sini, misalnya:
  // tanggalLahir?: string; // Format string (misal: 'YYYY-MM-DD')
}

export default function Profil() {
  const { setTitle, setSubtitle } = useDashboardLayoutContext();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  // Asumsi 'tanggalLahir' adalah field yang terpisah dan bisa diatur
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const [photoFile, setPhotoFile] = useState<File | null>(null); // Untuk file foto yang di-upload
  const [photoPreview, setPhotoPreview] = useState<string | null>(null); // Untuk preview foto

  // State untuk data profil yang akan ditampilkan/diubah, disesuaikan dengan mapping API
  const [profileData, setProfileData] = useState({
    fullName: "", // -> namaLengkap dari API
    username: "",
    email: "",
    idNumber: "", // -> nik_nip dari API
    address: "", // -> alamat dari API
    phone: "", // -> nomorTelepon dari API
    // Jika ada field waktu/keahlian untuk admin, inisialisasi di sini
    // waktu: '',
    // keahlian: '',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setTitle("Profil Saya");
    setSubtitle("Isikan profil pengguna Anda");
    fetchProfile(); // Panggil fungsi untuk mengambil data profil saat komponen dimuat
  }, [setTitle, setSubtitle, navigate]); // Tambahkan navigate sebagai dependency

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get<AdminProfileAPIResponse>('/profil/admin');
      const data = response.data;
      
      // Mapping data dari API ke state profileData
      setProfileData({
        fullName: data.namaLengkap || '',
        username: data.username || '',
        email: data.email || '',
        idNumber: data.nik_nip || '',
        address: data.alamat || '',
        phone: data.nomorTelepon || '',
        // Jika ada waktu/keahlian di respons API:
        // waktu: data.waktu || '',
        // keahlian: data.keahlian || '',
      });

      // Set photo preview dari URL yang diambil dari API
      setPhotoPreview(data.urlFotoProfil || "https://ui-avatars.com/api/?name=Admin+Profile&background=random");
      
      // Jika ada tanggalLahir di respons API dan formatnya sesuai Date object:
      // if (data.tanggalLahir) {
      //   setSelectedDate(new Date(data.tanggalLahir));
      // } else {
      //   setSelectedDate(undefined); // Atau default lain jika tidak ada
      // }

    } catch (err) {
      console.error("Failed to fetch profile:", err);
      if (err instanceof AxiosError && err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
        if (err.response.data.message === 'Unauthenticated.') {
          navigate('/admin/login'); // Asumsi admin login path
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Terjadi kesalahan saat mengambil data profil.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file); // Simpan file objek
      setPhotoPreview(URL.createObjectURL(file)); // Buat URL lokal untuk preview
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setIsCalendarOpen(false);
  };

  const handleEditToggle = async () => {
    if (isEditing) {
      // Jika mode edit, berarti tombol ini adalah 'Simpan'
      setLoading(true); // Tampilkan loading saat menyimpan
      setError(null);
      setSuccessMessage(null);

      const formData = new FormData();
      // Mapping data dari state ke field API yang diharapkan untuk update
      formData.append("namaLengkap", profileData.fullName);
      formData.append("username", profileData.username);
      formData.append("email", profileData.email);
      formData.append("nik_nip", profileData.idNumber);
      formData.append("alamat", profileData.address);
      formData.append("nomorTelepon", profileData.phone);
      
      // Jika ada field waktu/keahlian yang perlu diupdate untuk admin:
      // if (profileData.waktu) formData.append("waktu", profileData.waktu);
      // if (profileData.keahlian) formData.append("keahlian", profileData.keahlian);
      
      // Jika ada tanggal lahir yang perlu diupdate:
      // if (selectedDate) {
      //   formData.append("tanggalLahir", format(selectedDate, 'yyyy-MM-dd')); // Format tanggal untuk API
      // }

      if (photoFile) {
        // 'fotoProfil' adalah tebakan nama field untuk file yang diunggah.
        // KONFIRMASI nama field ini dengan backend Anda!
        formData.append("fotoProfil", photoFile); 
      }
      
      
      try {
        const response = await axiosInstance.post('/profil/admin', formData, {
          headers: {
            // Penting: Axios biasanya secara otomatis mengatur Content-Type: multipart/form-data
            // ketika Anda mengirim instance FormData. Namun, secara eksplisit menuliskannya
            // tidak akan merugikan dan bisa lebih jelas.
            'Content-Type': 'multipart/form-data', 
          },
        });

        console.log("Profile updated:", response.data);
        setSuccessMessage("Profil berhasil diperbarui!");
        // Re-fetch data untuk memastikan UI sinkron dengan backend setelah update
        await fetchProfile();
        setIsEditing(false); // Keluar dari mode edit
      } catch (err) {
        console.error("Failed to update profile:", err);
        if (err instanceof AxiosError && err.response && err.response.data && err.response.data.message) {
          setError(err.response.data.message);
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Terjadi kesalahan saat menyimpan profil.");
        }
      } finally {
        setLoading(false); // Sembunyikan loading
      }
    } else {
      // Jika bukan mode edit, masuk ke mode edit
      setIsEditing(true);
      setSuccessMessage(null); // Clear previous messages when entering edit mode
      setError(null);
    }
  };

  const inputStyles =
    'w-full mt-1 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100';

  // Tampilkan loading atau error screen penuh
  if (loading) {
    return <div className="text-gray-600 text-center py-8">Memuat profil...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-8">{error}</div>;
  }

  return (
    <>
      <div className="mx-auto p-6 rounded-lg bg-white mt-4">
        <div className="flex justify-between items-start pb-6 border-b border-gray-200">
          <div className="flex items-start gap-4">
            {/* BAGIAN FOTO PROFIL */}
            <div className="m-4 rounded-full border-[3px] border-gray-300 p-2 shadow-md">
              <div className="rounded-full border-[1px] border-black p-2">
                <div className="w-32 h-32 rounded-full overflow-hidden relative group">
                  <img
                    src={photoPreview || "https://ui-avatars.com/api/?name=Admin+Profile&background=random"}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                  {isEditing && (
                    <label
                      htmlFor="photo-upload"
                      className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <span className="text-white text-sm">Ubah Foto</span>
                      <input
                        id="photo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Informasi Profil */}
            <div className="flex flex-col justify-start space-y-1 mt-2">
              <h2 className="text-xl font-semibold">{profileData.fullName}</h2>
              <p className="text-sm text-gray-600">{profileData.email}</p>
              <p className="text-sm text-gray-500">{profileData.idNumber}</p>
            </div>
          </div>

          {/* Tombol Edit/Simpan */}
          <button
            onClick={handleEditToggle}
            className="px-4 py-2 border border-[#6B46C1] text-[#6B46C1] rounded-lg hover:bg-[#6B46C1]/10 transition text-sm font-medium flex items-center gap-2"
          >
            {isEditing ? "Simpan" : "Edit"}
            {!isEditing && <FaEdit className="w-4 h-4" />}
          </button>
        </div>

        {/* Success/Error Message */}
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mt-4" role="alert">
            {successMessage}
          </div>
        )}
        {error && !loading && ( // Tampilkan error hanya jika tidak loading
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4" role="alert">
            {error}
          </div>
        )}

        <div className="pt-6 space-y-4">
          <div>
            <label className="block font-semibold mb-1">Nama Lengkap</label>
            <input
              name="fullName"
              placeholder="Masukkan nama lengkap"
              value={profileData.fullName}
              onChange={handleChange}
              disabled={!isEditing}
              className={inputStyles}
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Nama Pengguna</label>
            <input
              name="username"
              placeholder="Masukkan nama pengguna"
              value={profileData.username}
              onChange={handleChange}
              disabled={!isEditing}
              className={inputStyles}
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Email</label>
            <input
              name="email"
              type="email"
              placeholder="Masukkan email"
              value={profileData.email}
              onChange={handleChange}
              disabled={!isEditing}
              className={inputStyles}
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">NIK/NIP</label>
            <input
              name="idNumber"
              placeholder="Masukkan NIK/NIP"
              value={profileData.idNumber}
              onChange={handleChange}
              disabled={!isEditing}
              className={inputStyles}
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Alamat Lengkap</label>
            <input
              name="address"
              placeholder="Masukkan Alamat lengkap"
              value={profileData.address}
              onChange={handleChange}
              disabled={!isEditing}
              className={inputStyles}
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Nomor Telepon</label>
            <input
              name="phone"
              placeholder="Masukkan nomor telepon"
              value={profileData.phone}
              onChange={handleChange}
              disabled={!isEditing}
              className={inputStyles}
            />
          </div>

          {/* Bagian tanggal lahir, waktu, keahlian saya biarkan dalam komentar 
              karena tidak ada di respons API yang Anda berikan. 
              Jika Anda ingin ini ada, backend perlu mengirimkan data ini dari endpoint /profil/admin 
              dan Anda bisa uncomment serta mengaktifkan kembali logikanya. */}
          {/* <div>
            <label className="block font-semibold mb-1">Tanggal Lahir</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Pilih tanggal"
                value={selectedDate ? format(selectedDate, 'dd/MM/yyyy') : ''}
                onClick={() => isEditing && setIsCalendarOpen(!isCalendarOpen)}
                readOnly
                disabled={!isEditing}
                className={`${inputStyles} cursor-pointer`}
              />
              {isCalendarOpen && isEditing && (
                <div className="absolute z-10 bg-white border border-gray-300 rounded-md shadow-lg mt-1">
                  <DayPicker
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    initialFocus
                  />
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">Waktu</label>
            <input
              name="waktu"
              placeholder="Masukkan waktu (contoh: 08.00-16.00)"
              value={profileData.waktu}
              onChange={handleChange}
              disabled={!isEditing}
              className={inputStyles}
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Keahlian</label>
            <input
              name="keahlian"
              placeholder="Masukkan keahlian"
              value={profileData.keahlian}
              onChange={handleChange}
              disabled={!isEditing}
              className={inputStyles}
            />
          </div>
          */}
        </div>
      </div>
    </>
  );
}
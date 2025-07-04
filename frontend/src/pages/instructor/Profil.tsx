import { useState, useEffect, ChangeEvent } from "react";
import { FaEdit } from "react-icons/fa";
import { format } from 'date-fns'; // Asumsi ini digunakan untuk format tanggal
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
// import { id as idLocale } from 'date-fns/locale'; // Impor jika ingin locale Bahasa Indonesia untuk DayPicker

import { useDashboardLayoutContext } from '../../layouts/DashboardLayout';
import axiosInstance from "../../services/axios";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";

// Definisikan interface untuk struktur data profil instruktur dari API
// SESUAI DENGAN respons getProfilInstruktur() di KelolaProfilPegawaiController
interface InstructorProfileAPIResponse {
  username: string;
  email: string;
  namaLengkap: string;
  nik_nip: string; // NIK/NIP atau identifikasi unik instruktur
  nomorTelepon: string | null; // Bisa null
  alamat: string | null; // Bisa null
  keahlian: string; // Dari relasi instruktur
  waktuMulai: string; // Dari relasi instruktur
  waktuBerakhir: string; // Dari relasi instruktur
  tglKetersediaan: string; // Dari relasi instruktur
  urlFotoProfil?: string | null; // URL gambar profil dari API, opsional
  // tanggalLahir tidak dikembalikan oleh getProfilInstruktur()
}

export default function Profil() {
  const { setTitle, setSubtitle } = useDashboardLayoutContext();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // State untuk data profil yang akan ditampilkan/diubah, disesuaikan dengan mapping API instruktur
  const [profileData, setProfileData] = useState({
    fullName: "", // -> namaLengkap dari API
    username: "",
    email: "",
    idNumber: "", // -> nik_nip dari API
    address: "", // -> alamat dari API
    phone: "", // -> nomorTelepon dari API
    waktu: "", // Ini akan menjadi gabungan waktuMulai dan waktuBerakhir (atau tglKetersediaan)
    keahlian: "", // -> keahlian dari API
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setTitle("Profil Saya");
    setSubtitle("Isikan profil pengguna Anda");
    fetchProfile(); 
  }, [setTitle, setSubtitle, navigate]);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get<InstructorProfileAPIResponse>('/profil/instruktur');
      const data = response.data;

      setProfileData({
        fullName: data.namaLengkap || '',
        username: data.username || '',
        email: data.email || '',
        idNumber: data.nik_nip || '',
        address: data.alamat || '',
        phone: data.nomorTelepon || '',
        // Menggabungkan waktu ketersediaan dari backend
        waktu: data.waktuMulai && data.waktuBerakhir ? `${data.waktuMulai.substring(0, 5)}-${data.waktuBerakhir.substring(0, 5)}` : '', 
        keahlian: data.keahlian || '', 
      });

      setPhotoPreview(data.urlFotoProfil || "https://ui-avatars.com/api/?name=Instruktur+Profile&background=random");

      // Tanggal ketersediaan (tglKetersediaan) dari API tidak dipetakan ke selectedDate
      // karena selectedDate digunakan untuk tanggal lahir, yang tidak ada di respons instruktur.
      // Jika ingin menampilkan tglKetersediaan di kalender, perlu penyesuaian lebih lanjut.

    } catch (err) {
      console.error("Failed to fetch instructor profile:", err);
      if (err instanceof AxiosError && err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
        if (err.response.data.message === 'Unauthenticated.') {
          navigate('/instruktur/login');
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Terjadi kesalahan saat mengambil data profil instruktur.");
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
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setIsCalendarOpen(false);
  };

  const handleEditToggle = async () => {
    if (isEditing) {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      const formData = new FormData();
      formData.append("namaLengkap", profileData.fullName);
      formData.append("username", profileData.username);
      formData.append("email", profileData.email);
      formData.append("nik_nip", profileData.idNumber);
      formData.append("alamat", profileData.address);
      formData.append("nomorTelepon", profileData.phone);
      // PERBAIKAN: Sesuaikan nama field dengan yang diharapkan backend untuk update instruktur
      formData.append("waktuKetersediaan", profileData.waktu); // Ini akan dikirim sebagai "08.00-16.00"
      formData.append("bidangKeahlian", profileData.keahlian); // Ini akan dikirim sebagai "Structure"

      // Jika ada tanggal lahir yang perlu diupdate:
      // if (selectedDate) {
      //   formData.append("tanggalLahir", format(selectedDate, 'yyyy-MM-dd'));
      // }

      if (photoFile) {
        // PERBAIKAN: Sesuaikan nama field file foto dengan yang diharapkan backend
        // Berdasarkan updateProfilInstruktur di KelolaProfilPegawaiController, nama fieldnya 'foto'
        formData.append("foto", photoFile); 
      }

      // --- PENTING: Menggunakan method spoofing untuk PATCH ---
      // Karena backend Anda mengkonfirmasi bahwa rute dukungan GET, HEAD, POST,
      // maka kita HARUS mengirimkan POST, dan menggunakan _method: 'PATCH'
      formData.append("_method", "PATCH"); 

      try {
        // PERBAIKAN: Ubah axiosInstance.patch menjadi axiosInstance.post
        // Ini akan mengirim POST request, yang akan diinterpretasikan Laravel sebagai PATCH
        const response = await axiosInstance.post('/profil/instruktur', formData, { 
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        console.log("Instructor profile updated:", response.data);
        setSuccessMessage("Profil instruktur berhasil diperbarui!");
        await fetchProfile(); 
        setIsEditing(false); 
      } catch (err) {
        console.error("Failed to update instructor profile:", err);
        if (err instanceof AxiosError && err.response && err.response.data && err.response.data.message) {
          setError(err.response.data.message);
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Terjadi kesalahan saat menyimpan profil instruktur.");
        }
      } finally {
        setLoading(false); 
      }
    } else {
      setIsEditing(true);
      setSuccessMessage(null);
      setError(null);
    }
  };

  const inputStyles =
    'w-full mt-1 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100';

  if (loading) {
    return <div className="text-gray-600 text-center py-8">Memuat profil instruktur...</div>;
  }

  // Tampilkan error jika loading selesai tapi ada error dan tidak ada data profil
  if (!loading && error && !profileData.fullName) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-md mt-4 text-center">
        <p>{error}</p>
        <button
          onClick={fetchProfile} 
          className="mt-2 ml-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto p-6 rounded-lg bg-white mt-4">
        {/* Header Profil */}
        <div className="flex justify-between items-start pb-6 border-b border-gray-200">
          <div className="flex items-start gap-4">
            {/* FOTO PROFIL */}
            <div className="m-4 rounded-full border-[3px] border-gray-300 p-2 shadow-md">
              <div className="rounded-full border-[1px] border-black p-2">
                <div className="w-32 h-32 rounded-full overflow-hidden relative group">
                  <img
                    src={photoPreview || "https://ui-avatars.com/api/?name=Instruktur+Profile&background=random"}
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

            {/* Informasi Profil di Header */}
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
            disabled={loading} 
          >
            {loading ? 'Memproses...' : (isEditing ? "Simpan" : "Edit")}
            {!isEditing && !loading && <FaEdit className="w-4 h-4" />}
          </button>
        </div>

        {/* Success/Error Message */}
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mt-4" role="alert">
            {successMessage}
          </div>
        )}
        {error && !successMessage && ( 
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4" role="alert">
            <p>{error}</p>
            {(error.includes("waktu habis") || error.includes("Tidak dapat terhubung") || error.includes("Terjadi kesalahan")) && (
              <button
                onClick={fetchProfile} 
                className="mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
              >
                Coba Lagi
              </button>
            )}
          </div>
        )}

        {/* Form Input Detail Profil */}
        <div className="pt-6 space-y-4">
          <div>
            <label className="block font-semibold mb-1">Nama Lengkap</label>
            <input
              name="fullName"
              placeholder="Masukkan nama lengkap"
              value={profileData.fullName}
              onChange={handleChange}
              disabled={!isEditing || loading} 
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
              disabled={!isEditing || loading}
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
              disabled={!isEditing || loading}
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
              disabled={!isEditing || loading}
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
              disabled={!isEditing || loading}
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
              disabled={!isEditing || loading}
              className={inputStyles}
            />
          </div>

          {/* Ketersediaan dan Keahlian */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ketersediaan Column */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Ketersediaan</label>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Tanggal</label>
                <button
                  type="button"
                  onClick={() => isEditing && !loading && setIsCalendarOpen(true)}
                  disabled={!isEditing || loading}
                  className={`${inputStyles} text-left flex justify-between items-center`}
                >
                  {selectedDate ? format(selectedDate, 'dd/MM/yyyy') : 'Pilih tanggal'}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5" />
                  </svg>
                </button>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Waktu</label>
                <select
                  name="waktu"
                  value={profileData.waktu}
                  onChange={handleChange}
                  disabled={!isEditing || loading}
                  className={inputStyles}
                >
                  <option value="">Pilih Waktu</option>
                  <option value="08.00-16.00">08.00-16.00</option>
                  <option value="09.00-17.00">09.00-17.00</option>
                  <option value="10.00-18.00">10.00-18.00</option>
                </select>
              </div>
            </div>

            {/* Keahlian Column */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Keahlian</label>
              <div>
                <label className="block text-sm text-gray-600 mb-1 invisible">Keahlian</label>
                <select
                  name="keahlian"
                  value={profileData.keahlian}
                  onChange={handleChange}
                  disabled={!isEditing || loading}
                  className={inputStyles}
                >
                  <option value="">Pilih Keahlian</option>
                  <option value="Structure">Structure</option>
                  <option value="Listening">Listening</option>
                  <option value="Reading">Reading</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isCalendarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-4">
            <h3 className="text-lg font-medium text-center mb-4">Pilih Tanggal</h3>
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
            />
            <button
              onClick={() => setIsCalendarOpen(false)}
              className="w-full mt-4 px-4 py-2 bg-yellow-400 text-gray-800 font-semibold rounded-md hover:bg-yellow-500"
            >
              Selesai
            </button>
          </div>
        </div>
      )}
    </>
  );
}
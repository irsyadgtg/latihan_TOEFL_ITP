import { useState, useEffect } from "react";
import { FaEdit } from "react-icons/fa";
import { format } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { useDashboardLayoutContext } from '../../layouts/DashboardLayout'; // Import context DashboardLayout

export default function Profil() {
  const [isEditing, setIsEditing] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(
    new Date('2025-04-18') // Inisialisasi tanggal default seperti di gambar (18/04/2025)
  );
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    fullName: "Khrsima", // Pastikan nilai ini ada saat inisialisasi
    username: "khrsimamanang",
    email: "khrsimamanang@gmail.com", // Menambahkan email dan idNumber
    idNumber: "12077139102019",
    address: "",
    phone: "",
    waktu: '08.00-16.00',
    keahlian: 'Structure',
  });

  // Ambil setter dari context DashboardLayout
  const { setTitle, setSubtitle } = useDashboardLayoutContext();

  useEffect(() => {
    // Inisialisasi photoPreview jika belum ada foto yang di-upload
    if (!photoPreview) {
      setPhotoPreview("https://ui-avatars.com/api/?name=Khrsima&background=random");
    }

    // Mengatur judul dan subjudul header global saat komponen dimuat
    setTitle("Profil Saya");
    setSubtitle("Isikan profil pengguna Anda");

    // Opsional: Cleanup function jika Anda ingin mengatur ulang judul saat komponen unmount
    // return () => {
    //   setTitle(""); 
    //   setSubtitle("");
    // };

  }, [photoPreview, setTitle, setSubtitle]); // Pastikan dependensi dimasukkan, termasuk setTitle dan setSubtitle

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    setIsCalendarOpen(false);
  };

  const handleEditToggle = () => {
    if (isEditing) {
      console.log("Data disimpan:", {
        ...form,
        tanggal: date ? format(date, 'dd/MM/yyyy') : '',
        foto: photo,
      });
      // TODO: Lakukan API call untuk menyimpan data ke backend
    }
    setIsEditing(!isEditing);
  };

  const inputStyles =
    'w-full mt-1 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100';

  return (
    <>
      <div className="mx-auto p-6 rounded-lg bg-white mt-4">
        <div className="flex justify-between items-start pb-6 border-b border-gray-200">
          <div className="flex items-start gap-4">
            {/* BAGIAN FOTO PROFIL: Styling berlapis seperti di gambar */}
            <div className="m-4 rounded-full border-[3px] border-gray-300 p-2 shadow-md"> {/* Outer: Border abu-abu tipis, padding, shadow */}
              <div className="rounded-full border-[1px] border-black p-2"> {/* Inner: Border hitam tipis, padding */}
                <div className="w-32 h-32 rounded-full overflow-hidden relative group"> {/* Ukuran w-32 h-32 */}
                  <img
                    src={photoPreview || "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400"}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                  {isEditing && ( // Overlay edit hanya saat isEditing
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
              <h2 className="text-xl font-semibold">{form.fullName}</h2>
              <p className="text-sm text-gray-600">{form.email}</p>
              <p className="text-sm text-gray-500">{form.idNumber}</p>
            </div>
          </div>

          {/* Tombol Edit/Simpan: Warna border dan teks ungu */}
          <button
            onClick={handleEditToggle}
            className="px-4 py-2 border border-[#6B46C1] text-[#6B46C1] rounded-lg hover:bg-[#6B46C1]/10 transition text-sm font-medium flex items-center gap-2"
          >
            {isEditing ? "Simpan" : "Edit"}
            {!isEditing && <FaEdit className="w-4 h-4" />}
          </button>
        </div>

        <div className="pt-6 space-y-4">
          <div>
            <label className="block font-semibold mb-1">Nama Lengkap</label>
            <input
              name="fullName"
              placeholder="Masukkan nama lengkap"
              value={form.fullName}
              onChange={handleChange}
              disabled={!isEditing}
              className={inputStyles}
            />
          </div>
          <div> {/* Nama Pengguna di bawah Nama Lengkap */}
            <label className="block font-semibold mb-1">Nama Pengguna</label>
            <input
              name="username"
              placeholder="Masukkan nama pengguna"
              value={form.username}
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
              value={form.address}
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
              value={form.phone}
              onChange={handleChange}
              disabled={!isEditing}
              className={inputStyles}
            />
          </div>

          {/* Ketersediaan dan Keahlian - tetap dalam 2 kolom */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ketersediaan Column */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Ketersediaan</label>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Tanggal</label>
                <button
                  type="button"
                  onClick={() => isEditing && setIsCalendarOpen(true)}
                  disabled={!isEditing}
                  className={`${inputStyles} text-left flex justify-between items-center`}
                >
                  {date ? format(date, 'dd/MM/yyyy') : 'Pilih tanggal'}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5" />
                  </svg>
                </button>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Waktu</label>
                <select
                  name="waktu"
                  value={form.waktu}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={inputStyles}
                >
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
                  value={form.keahlian}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={inputStyles}
                >
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
              selected={date}
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
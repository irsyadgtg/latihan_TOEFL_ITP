import React, { useEffect, useState } from "react";
import { useDashboardLayoutContext } from "../../layouts/DashboardLayout";
import { FaEdit } from "react-icons/fa";

const ProfilePage: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    fullName: "Khrsima", // Memberikan nilai awal agar ditampilkan
    username: "khrsimanaam",
    email: "khrsimamanang@gmail.com", // Tambahkan email ke state
    idNumber: "12077139102019", // Tambahkan idNumber ke state
    address: "",
    phone: "",
    coursePackage: "", // Tambahkan untuk paket kursus
    duration: "", // Tambahkan untuk masa berlaku
  });

  const { setTitle, setSubtitle } = useDashboardLayoutContext();

  useEffect(() => {
    setTitle("Profil Saya");
    setSubtitle("Isikan Profil Pengguna Anda Disini");
  }, [setTitle, setSubtitle]); // Tambahkan setTitle, setSubtitle sebagai dependensi

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEditToggle = () => {
    if (isEditing) {
      console.log("Data disimpan:", form);
      // TODO: Lakukan API call untuk menyimpan data ke backend
    }
    setIsEditing(!isEditing);
  };

  // Gaya input yang konsisten
  const inputStyles =
    "w-full border border-gray-300 rounded-md px-4 py-2 text-sm disabled:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500";

  return (
    <div className="mx-auto p-6 rounded-lg bg-white mt-4">
      {/* Header Profil (Foto, Nama, Email, ID, Tombol Edit) */}
      <div className="flex items-end justify-between pb-6 border-b border-gray-200">
        <div className="flex items-start gap-4">
          <div className="m-4 rounded-full border-[3px] border-gray-300 p-2 shadow-md">
            <div className="rounded-full border-[1px] border-black p-2">
              <div className="w-32 h-32 rounded-full overflow-hidden">
                <img
                  src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400"
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-start space-y-1 mt-2">
            {/* Menggunakan data dari state 'form' */}
            <h2 className="text-xl font-semibold">{form.fullName}</h2>
            <p className="text-sm text-gray-600">{form.email}</p>
            <p className="text-sm text-gray-500">{form.idNumber}</p>
          </div>
        </div>
        <button
          onClick={handleEditToggle}
          className="px-4 py-2 border border-[#6B46C1] text-[#6B46C1] rounded-lg hover:bg-[#6B46C1]/10 transition text-sm font-medium flex items-center gap-2"
        >
          {isEditing ? "Simpan" : "Edit"}
          {!isEditing && <FaEdit className="w-4 h-4" />}
        </button>
      </div>

      {/* Form Input */}
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
        <div>
          <label className="block font-semibold mb-1">Username</label>
          <input
            name="username"
            placeholder="Masukkan username"
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
        <div>
          <label className="block font-semibold mb-1">Paket Kursus</label>
          <input
            name="coursePackage" // Nama ini harus konsisten dengan state 'form'
            placeholder="Masukkan paket kursus yang dipilih"
            value={form.coursePackage} // Mengambil dari form.coursePackage
            onChange={handleChange}
            disabled={!isEditing}
            className={inputStyles}
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">
            Masa Berlaku Paket Kursus
          </label>
          <input
            name="duration"
            placeholder="Masukkan masa berlaku paket kursus"
            value={form.duration}
            onChange={handleChange}
            disabled={!isEditing}
            className={inputStyles}
          />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
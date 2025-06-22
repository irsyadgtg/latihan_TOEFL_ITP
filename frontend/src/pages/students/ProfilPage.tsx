import React, { useEffect, useState } from "react";
import { useStudentLayoutContext } from "../../layouts/StudentLayout";
import { FaEdit } from "react-icons/fa";

const ProfilePage: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    address: "",
    phone: "",
    duration: "",
  });

  const { setTitle, setSubtitle } = useStudentLayoutContext();

  useEffect(() => {
    setTitle("Profil Saya");
    setSubtitle("Isikan Profil Pengguna Anda Disini");
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  return (
    <div className="mx-auto p-6 rounded-lg bg-white mt-4">
      {/* Header */}
      <div className="flex items-end justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="m-4 rounded-full border-3 border-black p-2 shadow-md">
            <div className="rounded-full border-2 border-black p-2">
              <div className="w-32 h-32 rounded-full overflow-hidden">
                <img
                  src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400"
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold">Khrsima</h2>
            <p className="text-sm text-gray-600">khrsimamanang@gmail.com</p>
            <p className="text-sm text-gray-500">12077139102019</p>
          </div>
        </div>
        <button
          onClick={handleEditToggle}
          className="text-sm border border-[#6B46C1] text-[#6B46C1] px-4 py-1 rounded-md hover:bg-[#6B46C1]/10 transition"
        >
          <div className="flex gap-2 items-center">
            {isEditing ? "Simpan" : "Edit"}
            {isEditing ? <></> : <FaEdit />}
          </div>
        </button>
      </div>

      {/* Form */}
      <div className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">Nama Lengkap</label>
          <input
            name="fullName"
            placeholder="Masukkan nama lengkap"
            value={form.fullName}
            onChange={handleChange}
            disabled={!isEditing}
            className="w-full border rounded-md px-4 py-2 text-sm disabled:bg-gray-100"
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
            className="w-full border rounded-md px-4 py-2 text-sm disabled:bg-gray-100"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Alamat Lengkap</label>
          <input
            name="address"
            placeholder="Masukkan Alamat lengkap (nama jalan, kota, provinsi, kode pos)"
            value={form.address}
            onChange={handleChange}
            disabled={!isEditing}
            className="w-full border rounded-md px-4 py-2 text-sm disabled:bg-gray-100"
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
            className="w-full border rounded-md px-4 py-2 text-sm disabled:bg-gray-100"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Paket Kursus</label>
          <input
            name="course"
            placeholder="Masukkan paket kursus yang dipilih"
            value={form.phone}
            onChange={handleChange}
            disabled={!isEditing}
            className="w-full border rounded-md px-4 py-2 text-sm disabled:bg-gray-100"
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
            className="w-full border rounded-md px-4 py-2 text-sm disabled:bg-gray-100"
          />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

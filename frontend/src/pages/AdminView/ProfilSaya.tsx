import { useState } from "react";
import { FaEdit } from "react-icons/fa"; // Pastikan Anda sudah menginstal react-icons
import Layout from "../../layouts/AdminView"; // Sesuaikan path ini jika berbeda

export default function Dashboard() {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    fullName: "Khrsima", // Pastikan nilai ini ada saat inisialisasi
    username: "khrsimanaam",
    email: "khrsimanaam@gmail.com",
    idNumber: "12077139102019",
    address: "",
    phone: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleEditToggle = () => {
    if (isEditing) {
      console.log("Data disimpan:", form);
      // TODO: Lakukan API call untuk menyimpan data ke backend
    }
    setIsEditing(!isEditing);
  };

  return (
    <Layout
      title="Profil Saya"
      note="Isikan profil pengguna Anda disini"
    >
      {/* Konten utama profil di dalam Layout */}
      <div className="mx-auto p-6 rounded-lg bg-white mt-4">
        {/* Header */}
        <div className="flex items-end justify-between mb-6">
          <div className="flex items-center gap-4">
            {/* Bagian Foto Profil */}
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

            {/* Informasi Profil */}
            <div>
              <h2 className="text-lg font-semibold">{form.fullName}</h2> {/* Menggunakan form.fullName */}
              <p className="text-sm text-gray-600">{form.email}</p> {/* Menggunakan form.email */}
              <p className="text-sm text-gray-500">{form.idNumber}</p> {/* Menggunakan form.idNumber */}
            </div>
          </div>

          {/* Tombol Edit/Simpan */}
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

        {/* Form Input */}
        <div className="space-y-4">
          <div>
            <label className="block font-semibold mb-1">Nama Lengkap</label>
            <input
              name="fullName"
              placeholder="Masukkan nama lengkap"
              value={form.fullName} // Pastikan ini mengambil dari state 'form.fullName'
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
              value={form.username} // Mengambil dari state 'form.username'
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
              value={form.address} // Mengambil dari state 'form.address'
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
              value={form.phone} // Mengambil dari state 'form.phone'
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full border rounded-md px-4 py-2 text-sm disabled:bg-gray-100"
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}
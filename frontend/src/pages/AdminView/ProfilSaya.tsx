import { useState } from "react";
import Layout from "../../layouts/AdminView";

export default function Dashboard() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    nama: "",
    username: "",
    alamat: "",
    telepon: "",
  });

  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const toggleEdit = () => {
    if (isEditMode) {
      console.log("Data disimpan:", formData);
      console.log("Foto baru:", photo);
      // Kirim data ke server di sini jika diperlukan
    }
    setIsEditMode(!isEditMode);
  };

  return (
    <Layout
      title="Profil Saya"
      note="Admin dapat memantau statistik sistem saat ini"
    >
      <div className=" w-full max-w-2xl mx-auto">
        {/* Header dan Foto */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center space-x-6 mb-6">
            {/* Foto Profil */}
            <div className="relative">
              <img
                src={
                  photoPreview ||
                  "https://ui-avatars.com/api/?name=Khrsima&background=random"
                }
                alt="Foto Profil"
                className="w-24 h-24 rounded-full object-cover border border-borderColor"
              />
            </div>

            {/* Informasi & Upload */}
            <div className="flex flex-col justify-center space-y-2">
              <div>
                <p className="text-lg font-semibold">Khrsima</p>
                <p className="text-sm text-gray-500">khrsimanaam@gmail.com</p>
                <p className="text-sm text-gray-500">12077139102019</p>
              </div>

              {isEditMode && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Ganti Foto
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Tombol Edit/Simpan */}
          <button
            onClick={toggleEdit}
            className="px-4 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50"
          >
            {isEditMode ? "Simpan" : "Edit"}
          </button>
        </div>

        {/* Form Input */}
        <div className="space-y-4">
          <div>
            <label className="font-semibold">Nama Lengkap</label>
            <input
              name="nama"
              type="text"
              value={formData.nama}
              onChange={handleChange}
              disabled={!isEditMode}
              placeholder="Masukkan nama lengkap"
              className={`w-full mt-1 px-4 py-2 border border-borderColor rounded ${
                !isEditMode ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
            />
          </div>

          <div>
            <label className="font-semibold">Username</label>
            <input
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              disabled={!isEditMode}
              placeholder="Masukkan username"
              className={`w-full mt-1 px-4 py-2 border border-borderColor rounded ${
                !isEditMode ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
            />
          </div>

          <div>
            <label className="font-semibold">Alamat Lengkap</label>
            <input
              name="alamat"
              type="text"
              value={formData.alamat}
              onChange={handleChange}
              disabled={!isEditMode}
              placeholder="Masukkan alamat lengkap"
              className={`w-full mt-1 px-4 py-2 border border-borderColor rounded ${
                !isEditMode ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
            />
          </div>

          <div>
            <label className="font-semibold">Nomor Telepon</label>
            <input
              name="telepon"
              type="text"
              value={formData.telepon}
              onChange={handleChange}
              disabled={!isEditMode}
              placeholder="Masukkan nomor telepon"
              className={`w-full mt-1 px-4 py-2 border border-borderColor rounded ${
                !isEditMode ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}

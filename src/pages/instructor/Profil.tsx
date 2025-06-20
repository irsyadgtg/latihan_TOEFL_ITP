import { useState } from 'react';
import { format } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import Layout from '../../layouts/InstructorLayout';

export default function Profil() {
  // Start in edit mode if profile is empty
  const [isEditMode, setIsEditMode] = useState(true);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>();
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    namaLengkap: '',
    namaPengguna: '',
    alamatLengkap: '',
    nomorTelepon: '',
    waktu: '08.00-16.00',
    keahlian: 'Structure',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  const toggleEdit = () => {
    if (isEditMode) {
      console.log('Data Disimpan:', {
        ...formData,
        tanggal: date ? format(date, 'dd/MM/yyyy') : '',
        foto: photo,
      });
    }
    setIsEditMode(!isEditMode);
  };

  const inputStyles =
    'w-full mt-1 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100';

  return (
    <Layout title="Profil Saya" note="Isikan profil pengguna Anda disini">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-start pb-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src={
                  photoPreview ||
                  "https://ui-avatars.com/api/?name=Khrsima&background=random"
                }
                alt="Foto Profil"
                className="w-20 h-20 rounded-full object-cover bg-gray-200"
              />
            </div>
            <div>
              <p className="text-xl font-semibold text-gray-800">
                {formData.namaLengkap || 'Khrsima'}
              </p>
              <p className="text-sm text-gray-500">khrsimanaam@gmail.com</p>
              <p className="text-sm text-gray-500">12077139102019</p>
              {isEditMode && (
                <div className="mt-2">
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="text-sm text-slate-500 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-violet-100 file:text-violet-700 hover:file:bg-violet-200"
                  />
                </div>
              )}
            </div>
          </div>
          <button
            onClick={toggleEdit}
            className="px-8 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium"
          >
            {isEditMode ? 'Simpan' : 'Edit'}
          </button>
        </div>

        <div className="pt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-700">Nama Lengkap</label>
              <input
                type="text"
                name="namaLengkap"
                value={formData.namaLengkap}
                onChange={handleInputChange}
                disabled={!isEditMode}
                className={inputStyles}
                placeholder="Masukkan nama lengkap"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Nama Pengguna</label>
              <input
                type="text"
                name="namaPengguna"
                value={formData.namaPengguna}
                onChange={handleInputChange}
                disabled={!isEditMode}
                className={inputStyles}
                placeholder="Masukkan nama pengguna"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Alamat Lengkap</label>
            <input
              type="text"
              name="alamatLengkap"
              value={formData.alamatLengkap}
              onChange={handleInputChange}
              disabled={!isEditMode}
              className={inputStyles}
              placeholder="Masukkan Alamat lengkap (nama jalan, kota, provinsi, kode pos)"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Nomor Telepon</label>
            <input
              type="text"
              name="nomorTelepon"
              value={formData.nomorTelepon}
              onChange={handleInputChange}
              disabled={!isEditMode}
              className={inputStyles}
              placeholder="Masukkan nomor telepon"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ketersediaan Column */}
            <div className="space-y-4">
              <label className="text-sm font-medium text-gray-700">Ketersediaan</label>
              <div>
                <label className="text-sm text-gray-600">Tanggal</label>
                <button
                  type="button"
                  onClick={() => isEditMode && setIsCalendarOpen(true)}
                  disabled={!isEditMode}
                  className={`${inputStyles} text-left`}
                >
                  {date ? format(date, 'dd/MM/yyyy') : 'Pilih tanggal'}
                </button>
              </div>
              <div>
                <label className="text-sm text-gray-600">Waktu</label>
                <select
                  name="waktu"
                  value={formData.waktu}
                  onChange={handleInputChange}
                  disabled={!isEditMode}
                  className={inputStyles}
                >
                  <option>08.00-16.00</option>
                  <option>09.00-17.00</option>
                </select>
              </div>
            </div>

            {/* Keahlian Column */}
            <div className="space-y-4">
              <label className="text-sm font-medium text-gray-700">Keahlian</label>
              <div>
                <label className="text-sm text-gray-600 invisible">Keahlian</label>
                <select
                  name="keahlian"
                  value={formData.keahlian}
                  onChange={handleInputChange}
                  disabled={!isEditMode}
                  className={inputStyles}
                >
                  <option>Structure</option>
                  <option>Listening</option>
                  <option>Reading</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isCalendarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-4">
            <h3 className="text-lg font-medium text-center mb-4">Tanggal</h3>
            <DayPicker
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              initialFocus
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
    </Layout>
  );
}



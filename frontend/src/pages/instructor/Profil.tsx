import { useState, useEffect, ChangeEvent } from "react";
import { FaEdit } from "react-icons/fa";
import { format } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { id as idLocale } from 'date-fns/locale'; // Impor jika ingin locale Bahasa Indonesia untuk DayPicker

import { useDashboardLayoutContext } from '../../layouts/DashboardLayout';
import axiosInstance from "../../services/axios";
import axios, { AxiosError } from "axios"; // Import axios untuk isAxiosError
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
    waktuMulai: string; // Dari relasi instruktur (misal: "08:00:00")
    waktuBerakhir: string; // Dari relasi instruktur (misal: "16:00:00")
    tglKetersediaan: string; // Dari relasi instruktur (misal: "YYYY-MM-DD")
    urlFotoProfil?: string | null; // URL gambar profil dari API, opsional
}

export default function ProfilInstruktur() { // Ubah nama fungsi komponen agar unik
    const { setTitle, setSubtitle } = useDashboardLayoutContext();
    const navigate = useNavigate();

    const [isEditing, setIsEditing] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined); // Untuk tglKetersediaan

    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const [profileData, setProfileData] = useState({
        fullName: "",
        username: "",
        email: "",
        idNumber: "", // untuk NIK/NIP
        address: "",
        phone: "",
        waktuMulai: "", // Waktu mulai ketersediaan
        waktuBerakhir: "", // Waktu berakhir ketersediaan
        keahlian: "",
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        setTitle("Profil Saya");
        setSubtitle("Isikan profil instruktur Anda");
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
                keahlian: data.keahlian || '',
                waktuMulai: data.waktuMulai ? data.waktuMulai.substring(0, 5) : '', // Ambil HH:MM
                waktuBerakhir: data.waktuBerakhir ? data.waktuBerakhir.substring(0, 5) : '', // Ambil HH:MM
            });

            if (data.tglKetersediaan) {
                setSelectedDate(new Date(data.tglKetersediaan));
            } else {
                setSelectedDate(undefined);
            }

            setPhotoPreview(data.urlFotoProfil || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.namaLengkap || 'Instruktur')}&background=random`);

        } catch (err) {
            console.error("Failed to fetch instructor profile:", err);
            if (axios.isAxiosError(err)) {
                if (err.response) {
                    if (err.response.status === 401) {
                        setError("Sesi Anda telah berakhir atau tidak valid. Silakan login kembali.");
                        localStorage.removeItem('AuthToken');
                        localStorage.removeItem('userData');
                        navigate('/instruktur/login'); // Sesuaikan path login instruktur
                    } else if (err.response.status === 403) {
                        setError("Anda tidak memiliki izin untuk melihat profil ini.");
                    } else if (err.response.data && typeof err.response.data === 'object' && 'message' in err.response.data) {
                        setError(err.response.data.message as string);
                    } else {
                        setError(`Terjadi kesalahan: ${err.response.status} ${err.response.statusText || 'Error'}`);
                    }
                } else if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
                    setError("Permintaan ke server gagal karena waktu habis. Mohon coba lagi, atau periksa koneksi Anda.");
                    console.error("Timeout error:", err);
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
            
            // Perhatikan field untuk waktu dan keahlian di backend Anda (sesuai 'updateProfilInstruktur')
            // Misalnya, jika backend mengharapkan 'waktu_mulai', 'waktu_berakhir', 'keahlian', dan 'tgl_ketersediaan'
            if (profileData.waktuMulai) formData.append("waktu_mulai", profileData.waktuMulai + ':00'); // Tambah ':00' jika backend butuh format HH:MM:SS
            if (profileData.waktuBerakhir) formData.append("waktu_berakhir", profileData.waktuBerakhir + ':00'); // Tambah ':00'
            if (profileData.keahlian) formData.append("keahlian", profileData.keahlian);
            if (selectedDate) {
                formData.append("tgl_ketersediaan", format(selectedDate, 'yyyy-MM-dd'));
            }

            if (photoFile) {
                formData.append("foto", photoFile); // Konfirmasi nama field 'foto' dengan backend
            }


            try {
                
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
                if (axios.isAxiosError(err)) {
                    if (err.response) {
                        if (err.response.status === 401) {
                            setError("Sesi Anda telah berakhir atau tidak valid. Silakan login kembali.");
                            localStorage.removeItem('AuthToken');
                            localStorage.removeItem('userData');
                            navigate('/instruktur/login');
                        } else if (err.response.status === 403) {
                            setError("Anda tidak memiliki izin untuk memperbarui profil ini.");
                        } else if (err.response.data && typeof err.response.data === 'object' && 'message' in err.response.data) {
                            setError(err.response.data.message as string);
                        } else {
                            setError(`Gagal menyimpan: ${err.response.status} ${err.response.statusText || 'Error'}`);
                        }
                    } else if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
                        setError("Pengiriman data ke server gagal karena waktu habis. Mohon coba lagi.");
                        console.error("Timeout on update:", err);
                    } else if (err.request) {
                        setError("Tidak dapat terhubung ke server untuk menyimpan data.");
                    } else {
                        setError("Terjadi kesalahan saat menyiapkan data untuk disimpan.");
                    }
                } else {
                    setError("Terjadi kesalahan tidak terduga saat menyimpan.");
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
                <div className="flex justify-between items-start pb-6 border-b border-gray-200">
                    <div className="flex items-start gap-4">
                        <div className="m-4 rounded-full border-[3px] border-gray-300 p-2 shadow-md">
                            <div className="rounded-full border-[1px] border-black p-2">
                                <div className="w-32 h-32 rounded-full overflow-hidden relative group">
                                    <img
                                        src={photoPreview || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.fullName || 'Instruktur')}&background=random`}
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

                        <div className="flex flex-col justify-start space-y-1 mt-2">
                            <h2 className="text-xl font-semibold">{profileData.fullName}</h2>
                            <p className="text-sm text-gray-600">{profileData.email}</p>
                            <p className="text-sm text-gray-500">{profileData.idNumber}</p>
                        </div>
                    </div>

                    <button
                        onClick={handleEditToggle}
                        className={`px-4 py-2 border border-[#6B46C1] text-[#6B46C1] rounded-lg transition text-sm font-medium flex items-center gap-2
              ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#6B46C1]/10'}`}
                        disabled={loading}
                    >
                        {loading ? 'Memproses...' : (isEditing ? "Simpan" : "Edit")}
                        {!isEditing && !loading && <FaEdit className="w-4 h-4" />}
                    </button>
                </div>

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
                            disabled={!isEditing || loading} // Biarkan disabled jika email tidak bisa diubah dari sini
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
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Ketersediaan</label>
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Tanggal Ketersediaan</label>
                                <button
                                    type="button"
                                    onClick={() => isEditing && !loading && setIsCalendarOpen(true)}
                                    disabled={!isEditing || loading}
                                    className={`${inputStyles} text-left flex justify-between items-center`}
                                >
                                    {selectedDate ? format(selectedDate, 'dd/MM/yyyy', { locale: idLocale }) : 'Pilih tanggal'}
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5" />
                                    </svg>
                                </button>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Waktu Mulai</label>
                                <select
                                    name="waktuMulai" // Ubah name sesuai field di state
                                    value={profileData.waktuMulai}
                                    onChange={handleChange}
                                    disabled={!isEditing || loading}
                                    className={inputStyles}
                                >
                                    <option value="">Pilih Waktu Mulai</option>
                                    {[...Array(17)].map((_, i) => { // Dari jam 08:00 sampai 23:00
                                        const hour = 8 + i;
                                        if (hour < 24) { // Pastikan jam tidak lebih dari 23
                                            const time = `${String(hour).padStart(2, '0')}:00`;
                                            return <option key={time} value={time}>{time}</option>;
                                        }
                                        return null;
                                    })}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Waktu Berakhir</label>
                                <select
                                    name="waktuBerakhir" // Ubah name sesuai field di state
                                    value={profileData.waktuBerakhir}
                                    onChange={handleChange}
                                    disabled={!isEditing || loading}
                                    className={inputStyles}
                                >
                                    <option value="">Pilih Waktu Berakhir</option>
                                    {[...Array(17)].map((_, i) => { // Dari jam 08:00 sampai 23:00
                                        const hour = 8 + i;
                                        if (hour < 24) { // Pastikan jam tidak lebih dari 23
                                            const time = `${String(hour).padStart(2, '0')}:00`;
                                            return <option key={time} value={time}>{time}</option>;
                                        }
                                        return null;
                                    })}
                                </select>
                            </div>
                        </div>

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
                            initialFocus
                            locale={idLocale} // Gunakan locale Bahasa Indonesia
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
// src/pages/student/ProfilPage.tsx (Saya mengasumsikan nama file ini adalah ProfilPage.tsx dari AppRouter Anda)
import React, { useState, useEffect, ChangeEvent } from "react";
import { FaEdit } from "react-icons/fa";

import { useDashboardLayoutContext } from '../../layouts/DashboardLayout';
import axiosInstance from "../../services/axios";
import axios, { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";

// --- Definisikan interface untuk struktur data profil PESERTA dari API (SESUAI BACKEND) ---
// Pastikan nama properti di sini cocok persis dengan NAMA FIELD JSON yang dikembalikan backend.
// Jika backend menggunakan camelCase di model tapi mengembalikan snake_case di JSON,
// maka sesuaikan interface ini (misal: nama_lengkap, nomor_telepon, url_foto_profil, paket_kursus, sisa_masa_berlaku)
interface StudentProfileAPIResponse {
    username: string;
    email: string;
    namaLengkap: string; 
    nik: string;
    nomorTelepon: string | null; 
    alamat: string | null;
    urlFotoProfil?: string | null; 

    // Properti ini sekarang akan aman dari null berkat perbaikan di backend
    paketKursus: string | null; 
    sisaMasaBerlaku: number | null;
}

export default function ProfilPeserta() { 
    const { setTitle, setSubtitle } = useDashboardLayoutContext();
    const navigate = useNavigate();

    const [isEditing, setIsEditing] = useState(false);

    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const [profileData, setProfileData] = useState({
        fullName: "",
        username: "",
        email: "",
        nik: "",
        address: "",
        phone: "",
    });

    const [displayPaketKursus, setDisplayPaketKursus] = useState<string>("Belum ada");
    const [displaySisaMasaBerlaku, setDisplaySisaMasaBerlaku] = useState<string>("-");

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
            const response = await axiosInstance.get<StudentProfileAPIResponse>('/profil/peserta');
            const data = response.data;
            console.log("Data profil diterima dari backend:", data); // LOG PENTING UNTUK DEBUGGING

            setProfileData({
                fullName: data.namaLengkap || '',
                username: data.username || '',
                email: data.email || '',
                nik: data.nik || '',
                address: data.alamat || '',
                phone: data.nomorTelepon || '', 
            });

            // Penanganan paketKursus dan sisaMasaBerlaku yang sudah lebih aman karena backend diperbaiki
            if (data.paketKursus) {
                setDisplayPaketKursus(data.paketKursus);
                if (typeof data.sisaMasaBerlaku === 'number' && data.sisaMasaBerlaku >= 0) {
                    setDisplaySisaMasaBerlaku(`${data.sisaMasaBerlaku} hari`);
                } else if (typeof data.sisaMasaBerlaku === 'number' && data.sisaMasaBerlaku < 0) {
                    setDisplaySisaMasaBerlaku("Telah berakhir");
                } else {
                    setDisplaySisaMasaBerlaku("-"); 
                }
            } else {
                setDisplayPaketKursus("Belum ada");
                setDisplaySisaMasaBerlaku("-");
            }

            setPhotoPreview(data.urlFotoProfil || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.namaLengkap || 'Peserta')}&background=random`);

        } catch (err) {
            console.error("Gagal mengambil profil peserta:", err);
            if (axios.isAxiosError(err)) {
                if (err.response) {
                    console.error("Respons error Axios:", err.response.status, err.response.data); 
                    if (err.response.status === 401) {
                        setError("Sesi Anda telah berakhir atau tidak valid. Silakan login kembali.");
                        localStorage.removeItem('AuthToken');
                        localStorage.removeItem('userData');
                        navigate('/login'); 
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

    const handleEditToggle = async () => {
        if (isEditing) {
            setLoading(true);
            setError(null);
            setSuccessMessage(null);

            const formData = new FormData();
            formData.append("namaLengkap", profileData.fullName);
            formData.append("username", profileData.username);
            formData.append("nik", profileData.nik);
            formData.append("alamat", profileData.address);
            formData.append("nomorTelepon", profileData.phone);

            if (photoFile) {
                formData.append("foto", photoFile); 
            }

            try {
                const response = await axiosInstance.post('/profil/peserta', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                console.log("Profil peserta berhasil diperbarui:", response.data);
                setSuccessMessage("Profil berhasil diperbarui!");
                await fetchProfile(); 
                setIsEditing(false);
            } catch (err) {
                console.error("Gagal memperbarui profil peserta:", err);
                if (axios.isAxiosError(err)) {
                    if (err.response) {
                        console.error("Respons error Axios saat update:", err.response.status, err.response.data);
                        if (err.response.status === 401) {
                            setError("Sesi Anda telah berakhir atau tidak valid. Silakan login kembali.");
                            localStorage.removeItem('AuthToken');
                            localStorage.removeItem('userData');
                            navigate('/login');
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
        return <div className="text-gray-600 text-center py-8">Memuat profil...</div>;
    }
    
    if (error) {
        return (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-md mt-4 text-center">
                <p>{error}</p>
                {(error.includes("waktu habis") || error.includes("Tidak dapat terhubung") || error.includes("Terjadi kesalahan saat mengatur permintaan")) && (
                    <button
                        onClick={fetchProfile}
                        className="mt-2 ml-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    >
                        Coba Lagi
                    </button>
                )}
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
                                        src={photoPreview || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.fullName || 'Peserta')}&background=random`}
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
                            <p className="text-sm text-gray-500">{profileData.nik}</p>
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
                {error && ( 
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4" role="alert">
                        <p>{error}</p>
                        {(error.includes("waktu habis") || error.includes("Tidak dapat terhubung") || error.includes("Terjadi kesalahan saat mengatur permintaan")) && (
                            <button
                                onClick={fetchProfile}
                                className="mt-2 ml-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                            >
                                Coba Lagi
                            </button>
                        )}
                    </div>
                )}

                <div className="pt-6 border-b border-gray-200 pb-6 mb-6">
                    <h3 className="text-lg font-semibold mb-3 text-gray-800">Informasi Paket Kursus</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="font-semibold text-gray-700 mb-1">Paket Aktif Saat Ini</p>
                            <p className="text-gray-900">{displayPaketKursus}</p>
                        </div>
                        <div>
                            <p className="font-semibold text-gray-700 mb-1">Sisa Masa Berlaku</p>
                            <p className="text-gray-900">{displaySisaMasaBerlaku}</p>
                        </div>
                    </div>
                </div>

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
                            disabled={true} 
                            className={inputStyles}
                        />
                    </div>
                    <div>
                        <label className="block font-semibold mb-1">NIK</label>
                        <input
                            name="nik"
                            placeholder="Masukkan NIK"
                            value={profileData.nik}
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
                </div>
            </div>
        </>
    );
}
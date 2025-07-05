import React, { useState, useEffect } from "react";
import AuthLayout from "../../layouts/AuthLayout";
import axios from "axios"; // Import axios untuk type checking AxiosError
import axiosInstance from "../../services/axios"; // Pastikan path ini benar!

const VerificationLinkPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null); // State untuk menyimpan email pengguna

  // Ambil email pengguna dari localStorage saat komponen dimuat
  useEffect(() => {
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        // Asumsi email pengguna tersimpan di userData.email
        if (userData.email) {
          setUserEmail(userData.email);
        } else {
          // Jika email tidak ditemukan di data lokal, tampilkan error
          setError("Email pengguna tidak ditemukan di data lokal. Silakan login atau daftar ulang.");
        }
      } catch (e) {
        console.error("Gagal mem-parsing data pengguna dari localStorage:", e);
        setError("Terjadi kesalahan saat memuat data pengguna. Silakan coba lagi.");
      }
    } else {
      // Jika tidak ada data pengguna di localStorage
      setError("Data pengguna tidak ditemukan di penyimpanan lokal. Silakan login atau daftar.");
    }
  }, []);

  // Fungsi untuk menangani klik tombol "Kirim Link Verifikasi"
  const handleClickVerification = async () => {
    setIsLoading(true);
    setMessage(null);
    setError(null);

    // Jika email pengguna tidak ditemukan di localStorage, tidak bisa melanjutkan
    if (!userEmail) {
      setError("Email pengguna tidak tersedia untuk memicu verifikasi.");
      setIsLoading(false);
      return;
    }

    try {
      // *** PENTING: Memanggil GET /email/verify. Ini mungkin tidak memberikan hasil yang diinginkan ***
      // Endpoint ini memerlukan ID pengguna di path (misal: /email/verify/123) dan signed URL parameters.
      // Memanggilnya tanpa itu kemungkinan besar akan menghasilkan 404 Not Found atau 403 Forbidden.
      // Endpoint yang benar untuk MENGIRIM ULANG link adalah POST /email/resend.
      // Di sini, kita hanya mencoba memicu verifikasi ulang jika backend diatur untuk menangani GET tanpa parameter lengkap atau merespons secara spesifik.

      // Asumsi: Laravel akan mengenali ini sebagai permintaan verifikasi dan mungkin merespons dengan pesan.
      // Perhatikan bahwa Anda TIDAK mengirim email di sini, hanya mencoba memicu endpoint verifikasi.
      const response = await axiosInstance.get('/email/verify', { params: { email: userEmail } }); // Mengirim email sebagai query param

      setMessage(response.data.message || "Permintaan verifikasi telah diproses. Silakan cek email Anda.");
      setError(null); // Hapus error jika sukses
      
    } catch (err) {
      console.error('Gagal memicu verifikasi ulang:', err);
      if (axios.isAxiosError(err) && err.response) {
        // Jika backend mengirim pesan error
        // Misalnya, 404 (jika rute /email/verify tanpa ID tidak ada) atau 403 (validasi signature gagal)
        setError(err.response.data.message || `Terjadi kesalahan: ${err.response.status}. Pastikan URL verifikasi valid atau minta link baru.`);
        if (err.response.status === 422 && err.response.data.errors) {
            const validationErrors = Object.values(err.response.data.errors).flat().join(' ');
            setError(`Validasi Gagal: ${validationErrors}`);
        }
      } else {
        setError("Tidak dapat terhubung ke server. Silakan coba lagi nanti.");
      }
      setMessage(null); // Hapus pesan sukses jika ada error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="mt-4 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">
          Verifikasi Email Anda
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Link verifikasi Anda mungkin sudah kadaluarsa atau Anda belum memverifikasi email Anda.
          Klik tombol di bawah untuk memicu proses verifikasi (jika email Anda dikenali).
        </p>
        {userEmail && (
          <p className="mt-1 text-sm text-gray-500">
            (Email terdaftar: {userEmail})
          </p>
        )}
      </div>

      <div className="mt-8">
        <button
          type="button" 
          onClick={handleClickVerification} // Mengganti nama fungsi
          disabled={isLoading || !userEmail} 
          className="flex w-full justify-center rounded-md border border-transparent bg-[#E5A923] py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
        >
          {isLoading ? "Memproses..." : "Kirim Link Verifikasi"} {/* Mengganti teks tombol */}
        </button>

        {message && (
          <p className="mt-4 text-sm text-center text-green-600 bg-green-100 p-3 rounded-md">
            {message}
          </p>
        )}

        {error && (
          <p className="mt-4 text-sm text-center text-red-600 bg-red-100 p-3 rounded-md">
            {error}
          </p>
        )}
      </div>
    </AuthLayout>
  );
};

export default VerificationLinkPage;

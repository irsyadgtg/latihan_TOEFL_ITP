import React, { useState, useEffect } from "react";
import AuthLayout from "../../layouts/AuthLayout";
import axios, { AxiosError } from "axios";
import axiosInstance from "../../services/axios";
import { useNavigate, useParams } from "react-router-dom"; // Import useParams

const VerificationLinkPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const navigate = useNavigate();
  const { id, hash } = useParams<{ id?: string; hash?: string }>(); // Ambil ID dan Hash dari URL

  // Ambil email pengguna dari localStorage saat komponen dimuat
  useEffect(() => {
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        if (userData.email) {
          setUserEmail(userData.email);
        } else {
          setError("Email pengguna tidak ditemukan di data lokal. Silakan login atau daftar ulang.");
        }
      } catch (e) {
        console.error("Gagal mem-parsing data pengguna dari localStorage:", e);
        setError("Terjadi kesalahan saat memuat data pengguna. Silakan coba lagi.");
      }
    } else {
      setError("Data pengguna tidak ditemukan di penyimpanan lokal. Silakan login atau daftar.");
      // Optional: Redirect to login page if no user data
      // navigate('/login'); 
    }
  }, []);

  // Efek untuk menangani verifikasi email jika ID dan Hash ada di URL
  useEffect(() => {
    if (id && hash) {
      handleVerifyEmailFromLink(id, hash);
    }
  }, [id, hash]); // Jalankan efek ini ketika ID atau Hash berubah di URL

  // Fungsi untuk memproses verifikasi email dari link (GET request)
  const handleVerifyEmailFromLink = async (userId: string, userHash: string) => {
    setIsLoading(true);
    setMessage(null);
    setError(null);

    try {
      // Memanggil endpoint verifikasi Laravel dengan ID dan Hash dari URL
      // Penting: Laravel secara default menggunakan middleware 'signed' untuk rute ini.
      // Pastikan URL yang diakses oleh frontend memiliki parameter signature yang valid
      // jika Anda memang mengarahkan link email langsung ke halaman frontend ini.
      // Jika tidak, Laravel akan mengembalikan 403 Forbidden.
      const response = await axiosInstance.get(`/email/verify/${userId}/${userHash}`);

      setMessage(response.data.message || "Email Anda berhasil diverifikasi! Anda akan diarahkan ke halaman login.");
      setError(null);
      // Optional: Redirect ke halaman login setelah verifikasi sukses
      setTimeout(() => {
        navigate('/login');
      }, 3000); // Redirect setelah 3 detik

    } catch (err) {
      console.error('Gagal memverifikasi email dari link:', err);
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 403) {
          setError("Link verifikasi tidak valid atau sudah kadaluarsa. Silakan minta link baru.");
        } else if (err.response.data && err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError(`Terjadi kesalahan: ${err.response.status} ${err.response.statusText || 'Error'}.`);
        }
      } else {
        setError("Tidak dapat terhubung ke server. Silakan coba lagi nanti.");
      }
      setMessage(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi untuk menangani klik tombol "Kirim Ulang Link Verifikasi" (POST request)
  const handleResendVerificationLink = async () => {
    setIsLoading(true);
    setMessage(null);
    setError(null);

    if (!userEmail) {
      setError("Email pengguna tidak tersedia untuk mengirim ulang verifikasi.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.post('/email/resend', { email: userEmail });

      setMessage(response.data.message || "Link verifikasi baru telah dikirim ke email Anda. Silakan cek kotak masuk.");
      setError(null);

    } catch (err) {
      console.error('Gagal mengirim ulang link verifikasi:', err);
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 429) {
          setError("Terlalu banyak percobaan. Harap tunggu sebentar sebelum mencoba lagi.");
        } else if (err.response.data && err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError(`Terjadi kesalahan: ${err.response.status} ${err.response.statusText || 'Error'}.`);
        }
      } else {
        setError("Tidak dapat terhubung ke server. Silakan coba lagi nanti.");
      }
      setMessage(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi untuk mengarahkan ke halaman login
  const handleGoToLogin = () => {
    navigate('/login');
  };

  // Fungsi untuk mengarahkan ke halaman pendaftaran
  const handleGoToRegister = () => {
    navigate('/register');
  };

  return (
    <AuthLayout>
      <div className="mt-4 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">
          Verifikasi Email Anda
        </h2>
        {/* Tampilkan pesan sesuai skenario */}
        {id && hash ? (
          <p className="mt-2 text-sm text-gray-600">
            Memverifikasi email Anda... Mohon tunggu.
          </p>
        ) : (
          <p className="mt-2 text-sm text-gray-600">
            Link verifikasi Anda mungkin sudah kadaluarsa atau Anda belum memverifikasi email Anda.
            Klik tombol di bawah untuk meminta pengiriman ulang link verifikasi.
          </p>
        )}
        
        {userEmail && !id && !hash && ( // Tampilkan email terdaftar hanya jika bukan dari link verifikasi
          <p className="mt-1 text-sm text-gray-500">
            (Email Anda: <span className="font-semibold">{userEmail}</span>)
          </p>
        )}
      </div>

      <div className="mt-8 space-y-4">
        {/* Tampilkan tombol kirim ulang hanya jika tidak ada ID dan Hash di URL */}
        {!id && !hash && (
          <button
            type="button"
            onClick={handleResendVerificationLink}
            disabled={isLoading || !userEmail}
            className="flex w-full justify-center rounded-md border border-transparent bg-[#E5A923] py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
          >
            {isLoading ? "Mengirim Ulang Link..." : "Kirim Ulang Link Verifikasi"}
          </button>
        )}

        {message && (
          <p className="text-sm text-center text-green-600 bg-green-100 p-3 rounded-md">
            {message}
          </p>
        )}

        {error && (
          <p className="text-sm text-center text-red-600 bg-red-100 p-3 rounded-md">
            {error}
          </p>
        )}
      </div>
    </AuthLayout>
  );
};

export default VerificationLinkPage;

import React, { useState, useEffect } from "react";
import AuthLayout from "../../layouts/AuthLayout";
import axios, { AxiosError } from "axios";
import axiosInstance from "../../services/axios";
import { useNavigate, useLocation, useParams } from "react-router-dom"; // Import useParams dan useLocation

const EmailVerificationPage: React.FC = () => { // Nama komponen diubah
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation(); // Untuk membaca query parameters dari URL
  const { id } = useParams<{ id?: string }>(); // Hanya ambil 'id' dari URL path

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
      // Jika tidak ada data user, mungkin arahkan ke login atau register
      // navigate('/login'); 
    }
  }, []);

  // Efek untuk menangani verifikasi email jika ID ada di URL (saat user mengklik link email)
  useEffect(() => {
    // Hanya proses ini jika ID ada di path URL saat halaman ini dimuat
    // dan belum ada error atau message dari query params lain
    const queryParams = new URLSearchParams(location.search);
    const existingMessage = queryParams.get('message');
    const existingStatus = queryParams.get('status');

    if (id && !existingMessage) { // Hanya panggil jika ada ID di path dan belum ada pesan dari redirect Laravel
      handleVerifyEmailFromLink(id);
    } else if (existingMessage && existingStatus === 'error') {
      setError(existingMessage); // Set error dari Laravel redirect
    } else if (existingMessage && existingStatus === 'warning') {
      setMessage(existingMessage); // Set warning/info dari Laravel redirect
    }
    // Jika statusnya 'success', Laravel seharusnya sudah redirect ke /reset-password
  }, [id, location.search]); // Jalankan efek ini ketika ID atau query params berubah

  // Fungsi untuk memproses verifikasi email dari link (GET request)
  // Ini akan dipicu jika pengguna langsung mengakses URL seperti /verifikasi-email/123
  const handleVerifyEmailFromLink = async (userId: string) => {
    setIsLoading(true);
    setMessage(null);
    setError(null);

    try {
      // Memanggil endpoint verifikasi Laravel dengan ID dari URL.
      // Laravel akan memvalidasi signature dari query params (expires, signature)
      const response = await axiosInstance.get(`/email/verify/${userId}`);

      // Ini bagian yang jarang terjadi: Laravel biasanya akan REDIRECT
      // Tapi jika Laravel somehow mengirimkan JSON (mungkin karena interceptor atau header accept)
      // maka tangani respon di sini.
      setMessage(response.data.message || "Email Anda berhasil diverifikasi! Anda akan diarahkan.");
      setError(null); 
      // Jika berhasil, redirect ke login atau reset-password, sesuai alur
      setTimeout(() => {
        // Asumsi Laravel sudah melakukan redirect ke /reset-password atau /login
        // Jika tidak, Anda bisa tambahkan redirect manual di sini:
        // navigate('/login?message=Verifikasi berhasil. Silakan login.');
      }, 3000); 

    } catch (err) {
      console.error('Gagal memverifikasi email dari link:', err);
      if (axios.isAxiosError(err) && err.response) {
        // Pesan error langsung dari Laravel API jika Laravel tidak redirect
        // Ini mungkin terjadi jika ada error validasi CORS atau error lain yang mencegah redirect
        setError(err.response.data.message || `Terjadi kesalahan: ${err.response.status} ${err.response.statusText || 'Error'}.`);
        if (err.response.status === 422 && err.response.data.errors) {
            const validationErrors = Object.values(err.response.data.errors).flat().join(' ');
            setError(`Validasi Gagal: ${validationErrors}`);
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

      // Gunakan pesan dan status dari Laravel
      setMessage(response.data.message || "Link verifikasi baru telah dikirim ke email Anda. Silakan cek kotak masuk.");
      setError(null); // Hapus error jika sukses
      // Tambahkan efek visual (misal: tombol disable sementara)

    } catch (err) {
      console.error('Gagal mengirim ulang link verifikasi:', err);
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || `Terjadi kesalahan: ${err.response.status} ${err.response.statusText || 'Error'}.`);
        if (err.response.status === 422 && err.response.data.errors) {
            const validationErrors = Object.values(err.response.data.errors).flat().join(' ');
            setError(`Validasi Gagal: ${validationErrors}`);
        } else if (err.response.status === 403) { // Contoh: jika user tidak valid
            setError("Akses ditolak. Pastikan email Anda terdaftar.");
        } else if (err.response.status === 404) { // Contoh: jika endpoint salah
            setError("Endpoint pengiriman ulang tidak ditemukan. Silakan hubungi admin.");
        }
      } else {
        setError("Tidak dapat terhubung ke server. Silakan coba lagi nanti.");
      }
      setMessage(null);
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
        {/* Tampilkan pesan sesuai skenario dari query params atau default */}
        {message && (
          <p className="mt-2 text-sm text-green-600 bg-green-100 p-3 rounded-md">
            {message}
          </p>
        )}
        {error && (
          <p className="mt-2 text-sm text-red-600 bg-red-100 p-3 rounded-md">
            {error}
          </p>
        )}
        
        {!message && !error && ( // Tampilkan pesan default jika tidak ada pesan dari Laravel
          <p className="mt-2 text-sm text-gray-600">
            {id ? 
              "Memverifikasi email Anda... Mohon tunggu." : 
              "Link verifikasi Anda mungkin sudah kadaluarsa atau Anda belum memverifikasi email Anda. Klik tombol di bawah untuk meminta pengiriman ulang link verifikasi."
            }
          </p>
        )}
        
        {userEmail && ( 
          <p className="mt-1 text-sm text-gray-500">
            (Email Anda: <span className="font-semibold">{userEmail}</span>)
          </p>
        )}
      </div>

      <div className="mt-8 space-y-4">
        {/* Tombol kirim ulang hanya ditampilkan jika tidak dalam proses verifikasi awal dari link */}
        {!id && (
          <button
            type="button"
            onClick={handleResendVerificationLink}
            disabled={isLoading || !userEmail}
            className="flex w-full justify-center rounded-md border border-transparent bg-[#E5A923] py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
          >
            {isLoading ? "Mengirim Ulang Link..." : "Kirim Ulang Link Verifikasi"}
          </button>
        )}

        {/* Tambahkan tombol untuk kembali ke Login jika verifikasi gagal atau user tidak ada */}
        {error && (
            <button
                type="button"
                onClick={() => navigate('/login')}
                className="flex w-full justify-center rounded-md border border-transparent bg-gray-500 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
                Kembali ke Login
            </button>
        )}
      </div>
    </AuthLayout>
  );
};

export default EmailVerificationPage;

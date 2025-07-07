import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom"; // Import useLocation
import AuthLayout from "../../layouts/AuthLayout";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios"; // Import axios untuk type checking AxiosError
import axiosInstance from "../../services/axios"; // Pastikan path ini benar!

const ResetPassword: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState<string>("");
  const [passwordConfirmation, setPasswordConfirmation] = useState<string>("");
  const [email, setEmail] = useState<string>(""); // Untuk menyimpan email dari URL
  const [token, setToken] = useState<string>(""); // Untuk menyimpan token dari URL
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation(); // Hook untuk mengakses objek lokasi URL

  // useEffect untuk mengambil email dan token dari URL saat komponen dimuat
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get('email');
    const tokenParam = params.get('token');

    if (emailParam) {
      setEmail(emailParam);
    }
    if (tokenParam) {
      setToken(tokenParam);
    }

    // Opsional: Jika tidak ada email atau token, mungkin redirect atau tampilkan pesan error
    if (!emailParam || !tokenParam) {
      setError("Link reset password tidak valid atau tidak lengkap. Silakan minta link baru.");
    }
  }, [location.search]); // Bergantung pada perubahan query string URL

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Mencegah refresh halaman default
    setLoading(true);
    setMessage(null);
    setError(null);

    // Validasi sederhana di sisi klien
    if (!email || !token) {
      setError("Email atau token tidak ditemukan. Silakan minta link reset password baru.");
      setLoading(false);
      return;
    }

    if (password !== passwordConfirmation) {
      setError("Password baru dan konfirmasi password tidak cocok.");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password minimal harus 8 karakter.");
      setLoading(false);
      return;
    }

    try {
      // Mengirim permintaan POST ke endpoint /reset-password
      const response = await axiosInstance.post('/reset-password', {
        email: email,
        password: password,
        password_confirmation: passwordConfirmation,
        token: token,
      });

      // Asumsi respons sukses memiliki pesan
      setMessage(response.data.message || 'Password Anda berhasil direset. Silakan login.');
      setError(null); // Hapus error jika ada
      
      // Redirect ke halaman login setelah beberapa detik atau langsung
      setTimeout(() => {
        navigate('/login');
      }, 3000); // Redirect setelah 3 detik

    } catch (err) {
      console.error('Gagal mereset password:', err);
      if (axios.isAxiosError(err) && err.response) {
        // Jika backend mengirim pesan error, tampilkan itu
        // Laravel akan mengirim error validasi (422) atau error token (410)
        setError(err.response.data.message || 'Terjadi kesalahan saat mereset password Anda. Silakan coba lagi.');
        // Jika ada error validasi dari Laravel, tampilkan detailnya
        if (err.response.status === 422 && err.response.data.errors) {
          const validationErrors = Object.values(err.response.data.errors).flat().join(' ');
          setError(`Validasi Gagal: ${validationErrors}`);
        }
      } else {
        setError('Tidak dapat terhubung ke server. Silakan coba lagi.');
      }
      setMessage(null); // Hapus pesan sukses jika ada
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div>
        <p className="text-sm text-gray-600 text-center mb-5">
          Silakan atur ulang password Anda
        </p>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 ">
          Reset Password
        </h2>
      </div>

      <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
        {/* Input Email (Hidden, diambil dari URL) */}
        {/* Anda bisa menampilkannya jika ingin, tapi biasanya disembunyikan */}
        {/* <input type="hidden" name="email" value={email} /> */}
        {/* <input type="hidden" name="token" value={token} /> */}

        {/* Password Baru */}
        <div>
          <label htmlFor="password" className="sr-only">
            Password Baru
          </label>
          <div className="mt-1 relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password Baru"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Konfirmasi Password */}
        <div>
          <label htmlFor="password_confirmation" className="sr-only">
            Konfirmasi Password
          </label>
          <div className="mt-1 relative">
            <input
              id="password_confirmation"
              name="password_confirmation"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Konfirmasi Password"
              required
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Pesan Sukses */}
        {message && (
          <div className="text-sm text-green-600 bg-green-100 p-3 rounded-md">
            {message}
          </div>
        )}

        {/* Pesan Error */}
        {error && (
          <div className="text-sm text-red-600 bg-red-100 p-3 rounded-md">
            {error}
          </div>
        )}

        <div>
          <button
            type="submit"
            className="flex w-full justify-center rounded-md border border-transparent bg-[#E5A923] py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
            disabled={loading} // Nonaktifkan tombol saat loading
          >
            {loading ? 'Menyimpan...' : 'Perbarui Password'}
          </button>
        </div>
      </form>

      <div className="mt-6">
        <p className="text-center text-sm text-gray-600">
          Sudah punya akun?{" "}
          <Link
            to="/login"
            className="font-medium text-red-700 hover:text-red-600"
          >
            Masuk
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default ResetPassword;

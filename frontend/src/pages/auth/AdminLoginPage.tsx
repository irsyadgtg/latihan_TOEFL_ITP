// src/pages/auth/AdminLoginPage.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout"; // Pastikan path ini benar
import { Eye, EyeOff } from "lucide-react";
import axios, { AxiosError } from "axios";
import axiosInstance from "../../services/axios"; // Pastikan path ke axiosInstance Anda benar

const AdminLoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Endpoint login yang sama, backend akan menentukan role
      const response = await axiosInstance.post('/login', {
        login: identifier,
        password: password,
      });

      const authToken = response.data.token;
      const userData = response.data.user; 

      // --- BAGIAN PENTING YANG DIKOREKSI: PASTIKAN ROLE ADALAH 'admin' ---
      if (userData.role === 'admin') {
        localStorage.setItem('AuthToken', authToken); // Gunakan kunci 'AuthToken'
        localStorage.setItem('userData', JSON.stringify(userData)); 
        console.log('Login admin berhasil:', response.data.message);
        navigate('/admin/dashboard'); // Arahkan ke dashboard admin
      } else {
        // Jika login berhasil tapi role BUKAN admin, tolak login dari sini
        setError("Akun Anda bukan Admin. Silakan login melalui halaman yang sesuai.");
        console.warn("Login berhasil, namun role bukan admin:", userData.role);
        // Penting: Jangan simpan token jika role tidak sesuai
      }

    } catch (err: unknown) { // 'unknown' adalah praktik terbaik untuk tipe error
      console.error('Login admin gagal:', err); 

      if (axios.isAxiosError(err)) { 
        const responseData = err.response?.data; // Ambil data respons, bisa undefined

        // Tangani 401 (Unauthorized) atau 403 (Forbidden)
        if (err.response?.status === 401 || err.response?.status === 403) {
          setError(responseData?.message || 'Login gagal. Periksa kembali email/username dan password Anda.');
        } else if (responseData && responseData.errors) { // Tangani error validasi dari Laravel
          const validationErrors = Object.keys(responseData.errors)
            .map(key => `${key}: ${responseData.errors[key].join(', ')}`)
            .join('; '); 
          setError(`Validasi Gagal: ${validationErrors}`);
        } else if (responseData && responseData.message) { // Tangani pesan error umum dari backend
          setError(responseData.message);
        } else { // Error HTTP lain yang tidak spesifik
          setError(`Error: ${err.response?.status} - ${err.response?.statusText}`);
        }
      } else if (err instanceof Error) { // Tangani error JavaScript standar
        setError(`Terjadi kesalahan: ${err.message}`);
      } else { // Tangani error yang tidak teridentifikasi
        setError('Terjadi kesalahan tidak dikenal.');
      }
    } finally {
      setLoading(false); // Selesai loading
    }
  };

  return (
    <AuthLayout>
      <div className="mt-4">
        <p className="text-sm text-gray-600 text-center">
          Silakan masuk sebagai Admin.
        </p>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 ">
          Masuk Admin
        </h2>
      </div>

      <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">
            Masukkan (E-mail/Username)
          </label>
          <div className="mt-1">
            <input
              id="identifier"
              name="identifier"
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <div className="mt-1 relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
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
              {showPassword ? ( <EyeOff className="h-5 w-5 text-gray-400" /> ) : ( <Eye className="h-5 w-5 text-gray-400" /> )}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-2 text-red-700 bg-red-100 rounded text-center text-sm">
            {error}
          </div>
        )}

        <div>
          <button
            type="submit"
            className="flex w-full justify-center rounded-md border border-transparent bg-[#E5A923] py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
            disabled={loading}
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </div>
      </form>

      <div className="mt-6">
        <p className="text-center text-sm text-gray-600">
          Tidak punya akses Admin?{" "}
          <Link to="/login" className="font-medium text-blue-700 hover:text-blue-600"> {/* Ganti link ke halaman login umum */}
            Login Peserta
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default AdminLoginPage;
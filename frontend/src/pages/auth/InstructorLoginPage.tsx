import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout';
import { Eye, EyeOff } from 'lucide-react';
import axiosInstance from '../../services/axios';
import { AxiosError } from 'axios';

const InstructorLoginPage: React.FC = () => {
  const [login, setLogin] = useState(''); // <--- PERBAIKAN: Ubah kembali 'email' menjadi 'login'
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Mengirim payload dengan key 'login'
      const response = await axiosInstance.post('/login', {
        login, // <--- PERBAIKAN: Kirim payload dengan key 'login'
        password,
      });

      console.log('Login successful response data:', response.data);
      
      // Mengambil token dari properti 'token' seperti yang dikonfirmasi di AuthController
      const authToken = response.data.token; 

      if (authToken && typeof authToken === 'string') {
        localStorage.setItem('AuthToken', authToken); 
        console.log('Token disimpan di localStorage dengan key AuthToken:', authToken);
        // Jika backend Anda juga mengirim data user, Anda bisa menyimpannya juga:
        // if (response.data.user) {
        //   localStorage.setItem('userData', JSON.stringify(response.data.user));
        // }
      } else {
        console.warn('Login berhasil, tapi token tidak ditemukan atau formatnya salah di respons:', response.data);
        setError('Login berhasil, tapi gagal mengamankan sesi. Token tidak ditemukan atau tidak valid.');
        setLoading(false);
        return;
      }

      navigate('/instructor/profil'); 

    } catch (err) {
      console.error('Login failed:', err);
      if (err instanceof AxiosError) {
        if (err.response) {
          // Tangani status 401
          if (err.response.status === 401) {
            setError('Email atau password salah. Silakan coba lagi.');
          } 
          // Tangani status 422 untuk error validasi, jika backend mengembalikannya dengan 422
          else if (err.response.status === 422 && err.response.data && typeof err.response.data === 'object' && 'errors' in err.response.data) {
             const validationErrors = (err.response.data as any).errors;
             let errorMessages = '';
             for (const key in validationErrors) {
                 errorMessages += validationErrors[key].join(', ') + '\n';
             }
             setError(`Validasi gagal:\n${errorMessages}`);
          }
          // Perbaikan: Tangani status 500 yang berisi pesan 'Unauthenticated.' atau pesan validasi
          else if (err.response.status === 500 && err.response.data && typeof err.response.data === 'object' && 'message' in err.response.data) {
             const backendMessage = (err.response.data as any).message as string;
             // Jika pesan adalah "Unauthenticated." atau pesan validasi seperti "The login field is required."
             setError(`Server Error: ${backendMessage}`);
             if (backendMessage === 'Unauthenticated.') {
                 // Sesi tidak valid, arahkan ke login
                 localStorage.removeItem('AuthToken');
                 localStorage.removeItem('userData');
                 navigate('/instructor/login'); 
             }
          }
          // Tangani error lain dengan pesan spesifik dari backend (misal: 403 Forbidden)
          else if (err.response.data && typeof err.response.data === 'object' && 'message' in err.response.data) {
            setError(err.response.data.message as string);
          } else {
            setError(`Terjadi kesalahan: ${err.response.status} ${err.response.statusText || 'Error'}`);
          }
        } else if (err.request) {
          setError('Tidak dapat terhubung ke server. Pastikan server aktif dan koneksi internet stabil.');
        } else {
          setError('Terjadi kesalahan saat mengatur permintaan login. Mohon coba lagi.');
        }
      } else {
        setError('Terjadi kesalahan tidak terduga saat login.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Selamat datang di LMS LaC TOEFL ITP">
      <div className="mt-4">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">
          Masuk Instruktur
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Silakan masuk untuk mengakses dashboard Anda.
        </p>
      </div>

      <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm" role="alert">
            {error}
          </div>
        )}

        <div>
          <label
            htmlFor="email" // Label tetap 'Email' untuk tampilan UI
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <div className="mt-1">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={login} // <--- Menggunakan state 'login'
              onChange={(e) => setLogin(e.target.value)} // <--- Menggunakan setLogin
              disabled={loading}
              className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <div className="mt-1 relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3"
              disabled={loading}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <div className="text-sm">
            <Link
              to="/lupa-password"
              className="font-medium text-gray-600 hover:text-red-700"
            >
              Lupa password?
            </Link>
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="flex w-full justify-center rounded-md border border-transparent bg-[#eec429] py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default InstructorLoginPage;
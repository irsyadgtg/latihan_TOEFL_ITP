// src/pages/auth/ForgotPasswordPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout';
import axios from 'axios'; // Tetap import axios untuk AxiosError type checking
import axiosInstance from '../../services/axios'; // Pastikan path ini benar!

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      // Menggunakan axiosInstance.post
      // Karena axiosInstance sudah memiliki baseURL 'http://127.0.0.1:8000/api',
      // maka URL endpoint di sini cukup '/forgot-password'
      const response = await axiosInstance.post('/forgot-password', { email });

      setMessage(response.data.message || 'Instruksi reset password telah dikirim ke email Anda.');

    } catch (err) {
      console.error('Gagal mengirim permintaan lupa password:', err);
      if (axios.isAxiosError(err) && err.response) {
        // Pesan dari PHP: 'Gagal mengirim link reset password. Pastikan email yang Anda masukkan sudah terdaftar dan coba lagi.'
        setError(err.response.data.message || 'Terjadi kesalahan saat memproses permintaan Anda.');
      } else {
        setError('Tidak dapat terhubung ke server. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Lupa Password</h2>
        <p className="mt-2 text-sm text-gray-600">
          Silakan masukkan alamat email Anda untuk menerima instruksi reset password.
        </p>
      </div>

      <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Alamat email
          </label>
          <div className="mt-1">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
            />
          </div>
        </div>

        {message && (
          <div className="text-sm text-green-600 bg-green-100 p-3 rounded-md">
            {message}
          </div>
        )}

        {error && (
          <div className="text-sm text-red-600 bg-red-100 p-3 rounded-md">
            {error}
          </div>
        )}

        <div>
          <button
            type="submit"
            className="flex w-full justify-center rounded-md border border-transparent bg-[#E5A923] py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
            disabled={loading}
          >
            {loading ? 'Mengirim...' : 'Verifikasi'}
          </button>
        </div>
      </form>
      
    </AuthLayout>
  );
};

export default ForgotPasswordPage;

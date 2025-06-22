// src/pages/auth/ForgotPasswordPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout';

const ForgotPasswordPage: React.FC = () => {

  const navigate = useNavigate()

  return (
    <AuthLayout>
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Lupa Password</h2>
        <p className="mt-2 text-sm text-gray-600">
          Silakan ikuti langkah berikut untuk melakukan reset password akun Anda.
        </p>
      </div>

      <form className="mt-6 space-y-6">
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
              className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <button onClick={() => navigate('/reset-password')}
            type="submit"
            className="flex w-full justify-center rounded-md border border-transparent bg-[#E5A923] py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
          >
            Verifikasi
          </button>
        </div>
      </form>

    </AuthLayout>
  );
};

export default ForgotPasswordPage;
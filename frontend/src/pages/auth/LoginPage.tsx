// src/pages/auth/LoginPage.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import { Eye, EyeOff } from "lucide-react";

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = ()=>{
    navigate('/student/rencana')
  }

  return (
    <AuthLayout>
      <div className="mt-4">
        <p className="text-sm text-gray-600 text-center">
          Silahkan masuk dengan E-mail Anda.
        </p>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 ">
          Masuk
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Masuk untuk mengakses akun Anda
        </p>
      </div>

      <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="identifier"
            className="block text-sm font-medium text-gray-700"
          >
            Masukkan (E-mail/Username)
          </label>
          <div className="mt-1">
            <input
              id="identifier"
              name="identifier"
              type="text"
              required
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
              type={showPassword ? "text" : "password"}
              required
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
            className="flex w-full justify-center rounded-md border border-transparent bg-[#E5A923] py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
          >
            Masuk
          </button>
        </div>
      </form>

      <div className="mt-6">
        <p className="text-center text-sm text-gray-600">
          Belum punya akun?{" "}
          <Link
            to="/registrasi"
            className="font-medium text-red-700 hover:text-red-600"
          >
            Registrasi
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import { Eye, EyeOff } from "lucide-react";

const ResetPassword: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

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

      <form className="mt-6 space-y-6">
        {/* Password Baru */}
        <div>
          <label htmlFor="newPassword" className="sr-only">
            Password Baru
          </label>
          <div className="mt-1 relative">
            <input
              id="newPassword"
              name="newPassword"
              type={showPassword ? "text" : "password"}
              placeholder="Password Baru"
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

        {/* Konfirmasi Password */}
        <div>
          <label htmlFor="confirmPassword" className="sr-only">
            Konfirmasi Password
          </label>
          <div className="mt-1 relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Konfirmasi Password"
              required
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

        <div>
          <button onClick={() => navigate('/verifikasi-link')}
            type="submit"
            className="flex w-full justify-center rounded-md border border-transparent bg-[#E5A923] py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
          >
            Simpan Password Baru
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

export default ResetPassword;

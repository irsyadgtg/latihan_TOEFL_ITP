// src/pages/auth/RegistrationPage.tsx

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import { Eye, EyeOff } from "lucide-react";
import axiosInstance from "../../axios";
// 'isAxiosError' dan 'ValidationErrors' bisa dihapus jika tidak dipakai
// import { isAxiosError } from "axios";

// interface ValidationErrors {
//   [key: string]: string[];
// }

const RegistrationPage: React.FC = () => {
  const navigate = useNavigate();

  // State
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [nikNip, setNikNip] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Fungsi handleRegister dengan catch yang minimalis
  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setGeneralError(null);

    if (password !== passwordConfirmation) {
      setGeneralError("Konfirmasi kata sandi tidak cocok.");
      setIsLoading(false);
      return;
    }

    try {
      await axiosInstance.post('/register', {
        name,
        username,
        email,
        password,
        password_confirmation: passwordConfirmation,
        nik_nip: nikNip,
      });

      navigate("/login");

    } catch (error) {
      setGeneralError("Pendaftaran gagal. Perbaiki pada bagian yang masih invalid.");
      console.error("Registration Error:", error); 

    } finally {
      setIsLoading(false);

    }
  };

  return (
    <AuthLayout>
      <div>
        <p className="text-sm text-gray-600 text-center">
          Silahkan buat akun Anda
        </p>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 ">
          Registrasi
        </h2>
        <h4 className="text-sm text-gray-600 text-center">
          Silakan ikuti langkah berikut untuk mendaftarkan akun Anda.
        </h4>
      </div>
      
      <div>
        <form className="mt-6 space-y-4" onSubmit={handleRegister}>
          {/* Tampilkan error umum */}
          {generalError && <p className="text-sm text-red-600 bg-red-100 p-2 rounded-md text-center">{generalError}</p>}
          
          {/* Input Nama Lengkap */}
          <div>
            <input type="text" placeholder="Masukkan Nama Lengkap" value={name} onChange={(e) => setName(e.target.value)} required className="w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm" />
          </div>
          {/* Input Username */}
          <div>
            <input type="text" placeholder="Masukkan Username" value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm" />
          </div>
          {/* Input Email */}
          <div>
            <input type="email" placeholder="Masukkan Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm" />
          </div>
           {/* Input Password */}
          <div className="relative">
            <input type={showPassword ? "text" : "password"} placeholder="Masukkan Kata Sandi" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3">
              {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
            </button>
          </div>
           {/* Input Konfirmasi Password */}
          <div className="relative">
            <input type={showConfirmPassword ? "text" : "password"} placeholder="Masukkan Konfirmasi Kata Sandi" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} required className="w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm" />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3">
              {showConfirmPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
            </button>
          </div>
           {/* Input NIK/NIP */}
          <div>
            <input type="text" placeholder="Masukkan NIK / NIP" value={nikNip} onChange={(e) => setNikNip(e.target.value)} required className="w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm" />
          </div>
          
          {/* Tombol Submit */}
          <div>
            <button type="submit" disabled={isLoading} className="flex w-full justify-center rounded-md border border-transparent bg-[#E5A923] py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50">
              {isLoading ? 'Mendaftarkan...' : 'Daftar'}
            </button>
          </div>
          {/* Link ke Login */}
          <div className="text-sm text-center">
            <span className="text-gray-600">Sudah punya akun? </span>
            <Link to="/login" className="font-medium text-red-600 hover:underline">
              Masuk di sini
            </Link>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};

export default RegistrationPage;
// src/pages/auth/LoginPage.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import { Eye, EyeOff } from "lucide-react";
import axios, { AxiosError } from "axios";
import axiosInstance from "../../services/axios";

const LoginPage: React.FC = () => {
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
      const response = await axiosInstance.post("/login", {
        login: identifier,
        password: password,
      });

      const authToken = response.data.token;
      const userData = response.data.user;

      if (userData.role === "peserta") {
        localStorage.setItem("AuthToken", authToken);
        localStorage.setItem("userData", JSON.stringify(userData));

        //CEK ROLE
        localStorage.setItem("role", userData.role);
        console.log("Role disimpan di localStorage:", userData.role);

        console.log("Login peserta berhasil:", response.data.message);
        navigate("/student"); // Arahkan ke dashboard peserta
      } else {
        setError("Role Anda tidak diizinkan login melalui halaman ini.");
        console.warn(
          "Login berhasil, namun role bukan peserta:",
          userData.role
        );
      }
    } catch (err: unknown) {
      // <-- Perbaikan di sini: eksplisitkan 'unknown'
      console.error("Login gagal:", err); // Error akan tetap di sini karena 'err' masih 'unknown'

      // Perbaikan di sini: Tambahkan type assertion atau cek tambahan
      if (axios.isAxiosError(err)) {
        // Cek apakah ini AxiosError
        const responseData = err.response?.data; // responseData bisa undefined, jadi gunakan optional chaining

        if (err.response?.status === 401 || err.response?.status === 403) {
          // Gunakan optional chaining
          setError(
            responseData?.message ||
              "Login gagal. Periksa kembali email/username dan password Anda."
          );
        } else if (responseData && responseData.errors) {
          const validationErrors = Object.keys(responseData.errors)
            .map((key) => `${key}: ${responseData.errors[key].join(", ")}`)
            .join("; ");
          setError(`Validasi Gagal: ${validationErrors}`);
        } else if (responseData && responseData.message) {
          setError(responseData.message);
        } else {
          setError(
            `Error: ${err.response?.status} - ${err.response?.statusText}`
          ); // Gunakan optional chaining
        }
      } else if (err instanceof Error) {
        // Jika ini adalah Error standar JavaScript
        setError(`Terjadi kesalahan: ${err.message}`);
      } else {
        // Jika tipe error lain yang tidak teridentifikasi
        setError("Terjadi kesalahan tidak dikenal.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="mt-4">
        <p className="text-sm text-gray-600 text-center">
          Silahkan masuk dengan E-mail atau Username Anda.
        </p>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 ">
          Masuk
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Masuk untuk mengakses akun Anda
        </p>
      </div>

      <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
        {/* Input E-mail/Username */}
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
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Input Password */}
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

        {/* Pesan Error */}
        {error && (
          <div className="p-2 text-red-700 bg-red-100 rounded text-center text-sm">
            {error}
          </div>
        )}

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
            disabled={loading}
          >
            {loading ? "Memproses..." : "Masuk"}
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

// src/pages/auth/VerificationLinkPage.tsx
import React, { useState } from "react";
import AuthLayout from "../../layouts/AuthLayout";

const VerificationLinkPage: React.FC = () => {
  // State untuk mengelola status loading dan pesan umpan balik
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Fungsi untuk menangani permintaan pengiriman ulang link
  const handleResendLink = async () => {
    setIsLoading(true);
    setMessage(null);

    // TODO: Ganti bagian ini dengan logika API call Anda yang sebenarnya
    try {
      // Simulasi panggilan jaringan selama 1.5 detik
      await new Promise(resolve => setTimeout(resolve, 1500));
      setMessage("Link verifikasi baru telah berhasil dikirim. Silakan periksa email Anda.");
    } catch (error) {
      setMessage("Gagal mengirim link. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
    <div className="mt-4">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 ">
          Masuk
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Link verifikasi Anda sudah kadaluarsa, silahkan untuk meminta link verifikasi baru.
        </p>
      </div>

      <div className="mt-8">
        <button
          type="button"
          onClick={handleResendLink}
          disabled={isLoading}
            className="flex w-full justify-center rounded-md border border-transparent bg-[#E5A923] py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2">
          {isLoading ? "Mengirim..." : "Kirim Link Verifikasi"}
        </button>
      </div>

    </AuthLayout>
  );
};

export default VerificationLinkPage;
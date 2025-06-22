// src/layouts/AdminAuthLayout.tsx
import React from 'react';

// Ganti dengan path logo Telkom University Anda di folder public
const logoUrl = 'Logo-LAC-TELU.png'; 

type AdminAuthLayoutProps = {
  children: React.ReactNode;
};

const AdminAuthLayout: React.FC<AdminAuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex">
      {/* Kolom Kiri (Konten Form) */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Bagian Header Form */}
          <div>
            <img className="h-12 w-auto" src={logoUrl} alt="Telkom University" />
            <p className="mt-6 text-sm text-gray-600">
              Selamat datang di LMS LaC TCeL ITP
            </p>
          </div>

          {/* Children akan menjadi isi form (login atau lupa password) */}
          <div className="mt-8">
            {children}
          </div>
        </div>
      </div>

      {/* Kolom Kanan (Panel Warna) */}
      <div className="hidden lg:block relative w-0 flex-1 bg-[#A41D23]">
        {/* Anda bisa menambahkan gambar atau elemen dekoratif di sini jika perlu */}
      </div>
    </div>
  );
};

export default AdminAuthLayout;
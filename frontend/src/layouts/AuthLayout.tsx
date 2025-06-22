import React from "react";

// Ganti dengan path logo Telkom University Anda di folder public
const logoUrl = "Logo.png";

type AuthLayoutProps = {
  children: React.ReactNode;
  title?: string; // optional
};

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title = "Selamat datang di LMS LaC TOEFL ITP",
}) => {
  return (
    <div className="min-h-screen flex">
      {/* Kolom Kiri (50%) */}
      <div className="w-1/2 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 bg-white">
        <div className="mx-auto w-full max-w-sm">
          {/* Header Form */}
          <div className="flex flex-col items-center">
            <img
              className="h-32 w-auto"
              src={logoUrl}
              alt="Telkom University"
            />
            <p className="text-sm font-bold text-center text-black">
              {title}
            </p>
          </div>
          {/* Isi form */}
          <div >{children}</div>
        </div>
      </div>

      {/* Kolom Kanan (50%) */}
      <div className="w-1/2 bg-[#A41D23] hidden lg:flex items-center justify-center">
        {/* Tambahkan elemen dekoratif di sini jika diperlukan */}
      </div>
    </div>
  );
};

export default AuthLayout;

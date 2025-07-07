import React from "react";

const logoUrl = "/Logo.png";

type AuthLayoutProps = {
  children: React.ReactNode;
  title?: string;
};

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title = "Selamat datang di LMS LaC TOEFL ITP",
}) => {
  return (
    <div className="min-h-screen flex">
      <div className="w-1/2 flex flex-col justify-center bg-white px-12">
        <img src={logoUrl} alt="Logo" className="h-32 mx-auto" />
        <p className="text-xl text-center mt-4 font-semibold">{title}</p>
        <div className="mt-6">{children}</div>
      </div>
      <div className="w-1/2 bg-[#A41D23] hidden lg:flex items-center justify-center" />
    </div>
  );
};

export default AuthLayout;

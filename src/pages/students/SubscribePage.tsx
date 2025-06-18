// src/pages/student/StudentDashboard.tsx
import React, { useEffect } from "react";
import { useStudentLayoutContext } from "../../layouts/StudentLayout";

import image from "/package.png";
import PackageCard from "../../components/PackageCard";
import { useNavigate } from "react-router-dom";

const SubscribePage: React.FC = () => {
  const { setTitle, setSubtitle } = useStudentLayoutContext();

  useEffect(() => {
    setTitle("Berlangganan Paket Kursus");
    setSubtitle(
      "Melihat paket kursus yang tersedia untuk berlangganan belajar TOEFL ITP.  Anda harus memiliki pengajuan skor awal yang telah disetujui, masih berlaku, dan mendapatkan feedback rencana belajar terlebih dahulu"
    );
  }, []);

  const navigate = useNavigate();

  const cardData = [
    {
      image: image,
      title: "TOEFL ITP® Preparation",
      price: "Free",
      description: "Hanya tersedia modul belajar dengan keterbatasan akses",
      date: "20-09-2025",
      isBeli: true,
      label: "Free",
      onClick: () => navigate("form"),
    },
    {
      image: image,
      title: "TOEFL ITP® Preparation",
      price: "Free",
      description: "Hanya tersedia modul belajar dengan keterbatasan akses",
      date: "20-09-2025",
      label: "Free",
      isBeli: true,

      onClick: () => navigate("form"),
    },
    {
      image: image,
      title: "TOEFL ITP® Preparation",
      price: "Rp250.000",
      description: "Hanya tersedia modul belajar dengan keterbatasan akses",
      date: "20-09-2025",
      label: "6 Bulan",
      isBeli: true,

      onClick: () => navigate("form"),
    },
    {
      image: image,
      title: "TOEFL ITP® Preparation",
      price: "Rp250.000",
      description: "Hanya tersedia modul belajar dengan keterbatasan akses",
      date: "20-09-2025",
      label: "6 Bulan",
      isBeli: false,

      onClick: () => navigate("form"),
    },
    {
      image: image,
      title: "TOEFL ITP® Preparation",
      price: "Rp475.000",
      description: "Hanya tersedia modul belajar dengan keterbatasan akses",
      date: "20-09-2025",
      label: "1 Tahun",
      isBeli: true,

      onClick: () => navigate("form"),
    },
    {
      image: image,
      title: "TOEFL ITP® Preparation",
      price: "Rp475.000",
      description: "Hanya tersedia modul belajar dengan keterbatasan akses",
      date: "20-09-2025",
      label: "1 Tahun",
      isBeli: true,

      onClick: () => navigate("form"),
    },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-5">
        {cardData.map((card, index) => (
          <PackageCard key={index} {...card} />
        ))}
      </div>
    </div>
  );
};

export default SubscribePage;

// src/pages/student/InitialScore.tsx
import React, { useEffect } from "react";
import { useDashboardLayoutContext } from "../../layouts/DashboardLayout";
import Score from "../../components/Score";
import { useNavigate } from "react-router-dom";

const InitialScore: React.FC = () => {
  const { setTitle, setSubtitle } = useDashboardLayoutContext();

  const navigate = useNavigate();

  useEffect(() => {
    setTitle("Pengajuan Skor Awal");
    setSubtitle("");
  }, []);

  const scoreList = [
    {
      name: "TOEFL ITP Preparation-Free",
      score: "90",
      status: "Pending",
      masa_berlaku: "18-04-2025",
      timestamp: "08:00 - 10/04/2025",
      keterangan: "-",
    },
    {
      name: "EPRT",
      score: "85",
      status: "Disetujui",
      masa_berlaku: "10-01-2026",
      timestamp: "09:30 - 01/01/2025",
      keterangan: "Nilai valid dan diterima",
    },
    {
      name: "TOEFL Prediction",
      score: "88",
      status: "Ditolak",
      masa_berlaku: "-",
      timestamp: "11:15 - 20/02/2025",
      keterangan: "Scan dokumen tidak jelas",
    },
    {
      name: "TOEFL ITP",
      score: "92",
      status: "Disetujui",
      masa_berlaku: "15-03-2026",
      timestamp: "10:00 - 15/03/2025",
      keterangan: "Nilai tinggi dan diterima",
    },
    {
      name: "IELTS Simulation",
      score: "78",
      status: "Pending",
      masa_berlaku: "01-06-2025",
      timestamp: "14:00 - 01/06/2025",
      keterangan: "Menunggu verifikasi",
    },
    {
      name: "EPRT",
      score: "80",
      status: "Disetujui",
      masa_berlaku: "20-07-2026",
      timestamp: "09:00 - 20/07/2025",
      keterangan: "Disetujui oleh admin",
    },
    {
      name: "TOEFL Prediction",
      score: "70",
      status: "Ditolak",
      masa_berlaku: "-",
      timestamp: "13:30 - 22/08/2025",
      keterangan: "Nilai di bawah standar",
    },
    {
      name: "IELTS Preparation",
      score: "83",
      status: "Pending",
      masa_berlaku: "05-09-2025",
      timestamp: "10:45 - 05/09/2025",
      keterangan: "Dokumen masih diproses",
    },
    {
      name: "TOEFL ITP Preparation-Free",
      score: "87",
      status: "Disetujui",
      masa_berlaku: "12-10-2026",
      timestamp: "08:15 - 12/10/2025",
      keterangan: "Semua data valid",
    },
    {
      name: "TOEFL Prediction",
      score: "75",
      status: "Ditolak",
      masa_berlaku: "-",
      timestamp: "15:00 - 30/11/2025",
      keterangan: "Foto buram dan tidak terbaca",
    },
  ];

  return (
    <div className="mt-4">
      <div className="flex justify-between items-start gap-4 flex-wrap">
        <p className="text-gray-600 text-sm leading-relaxed max-w-3xl">
          Silakan mengajukan skor tes bahasa Inggris terbaru kalian (EPRT, TOEFL
          ITP, dan sejenisnya). Belum punya skor tes acuan? Ikut EPRT dulu yuk
          supaya tahu kemampuanmu saat ini.
          <span className="text-[#493BC0] underline ml-1 cursor-pointer">
            <a href="https://smb.telkomuniversity.ac.id/daftar-toefl/?_gl=1*1ijiy9c*_gcl_au*MTE1NTc5ODk5NS4xNzUwMTY0MTkz*_ga*MTYxMDM2ODY4MC4xNzUwMTY0MDc2*_ga_0VSYWXVH4F*czE3NTAxNjQwODIkbzEkZzEkdDE3NTAxNjQyNDQkajgkbDAkaDAkZDdqdTFLOHE2T1NnUGpjaFNBUldGRllLSDhXZENuSU5RMmc.*_ga_43N69PWNNS*czE3NTAxNjQwODIkbzEkZzEkdDE3NTAxNjQyNDQkajgkbDAkaDAkZFFaQ2Q1NjJIbl9BQmYwb1Z6X1E2RFpnd2JXOHg1dUZVRkE.*_ga_4SWXWE0S8K*czE3NTAxNjQwODMkbzEkZzEkdDE3NTAxNjQyNDQkajM5JGwwJGgwJGQzU1NmTTNrdmo5bnMtdFJ6emFWd2x6dW8zSC1LeTJNYzJB" target="_blank" rel="noopener noreferrer">[link pendaftaran EPRT di LaC]</a>.
          </span>
        </p>
        <button
          onClick={() => navigate("create")}
          className="border border-[#493BC0] text-[#493BC0] font-medium px-4 py-2 rounded hover:bg-[#493BC0]/10 transition whitespace-nowrap"
        >
          Ajukan Skor Awal
        </button>
      </div>

      <div className="mt-6 space-y-4">
        {scoreList.map((item, index) => (
          <Score key={index} data={item} />
        ))}
      </div>
    </div>
  );
};

export default InitialScore;

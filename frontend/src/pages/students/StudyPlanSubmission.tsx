import React, { useEffect } from "react";
import { useDashboardLayoutContext } from "../../layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import StudyPlan from "../../components/StudyPlan";

const StudyPlanSubmission: React.FC = () => {
  const { setTitle, setSubtitle } = useDashboardLayoutContext();

  const navigate = useNavigate();

  useEffect(() => {
    setTitle("Pengajuan Rencana Belajar");
    setSubtitle("Rencana Studi untuk belajar ");
  }, []);

  const scoreList = [
    {
      name: "TOEFL ITP Preparation-Free",
      score: "90",
      targetScore: "100",
      targetTime: "03-2025",
      status: "Pending",
      masa_berlaku: "18-04-2025",
      timestamp: "08:00 - 10/04/2025",
      keterangan: "-",
    },
    {
      name: "EPRT",
      score: "85",
      targetScore: "95",
      targetTime: "01-2026",
      status: "Disetujui",
      masa_berlaku: "10-01-2026",
      timestamp: "09:30 - 01/01/2025",
      keterangan: "Nilai valid dan diterima",
    },
    {
      name: "TOEFL Prediction",
      score: "88",
      targetScore: "95",
      targetTime: "02-2025",
      status: "Ditolak",
      masa_berlaku: "-",
      timestamp: "11:15 - 20/02/2025",
      keterangan: "Scan dokumen tidak jelas",
    },
    {
      name: "TOEFL ITP",
      score: "92",
      targetScore: "105",
      targetTime: "05-2025",
      status: "Disetujui",
      masa_berlaku: "15-03-2026",
      timestamp: "10:00 - 15/03/2025",
      keterangan: "Nilai tinggi dan diterima",
    },
    {
      name: "IELTS Simulation",
      score: "78",
      targetScore: "90",
      targetTime: "06-2025",
      status: "Pending",
      masa_berlaku: "01-06-2025",
      timestamp: "14:00 - 01/06/2025",
      keterangan: "Menunggu verifikasi",
    },
    {
      name: "EPRT",
      score: "80",
      targetScore: "90",
      targetTime: "07-2025",
      status: "Disetujui",
      masa_berlaku: "20-07-2026",
      timestamp: "09:00 - 20/07/2025",
      keterangan: "Disetujui oleh admin",
    },
    {
      name: "TOEFL Prediction",
      score: "70",
      targetScore: "85",
      targetTime: "08-2025",
      status: "Ditolak",
      masa_berlaku: "-",
      timestamp: "13:30 - 22/08/2025",
      keterangan: "Nilai di bawah standar",
    },
    {
      name: "IELTS Preparation",
      score: "83",
      targetScore: "90",
      targetTime: "09-2025",
      status: "Pending",
      masa_berlaku: "05-09-2025",
      timestamp: "10:45 - 05/09/2025",
      keterangan: "Dokumen masih diproses",
    },
    {
      name: "TOEFL ITP Preparation-Free",
      score: "87",
      targetScore: "100",
      targetTime: "10-2025",
      status: "Disetujui",
      masa_berlaku: "12-10-2026",
      timestamp: "08:15 - 12/10/2025",
      keterangan: "Semua data valid",
    },
    {
      name: "TOEFL Prediction",
      score: "75",
      targetScore: "90",
      targetTime: "11-2025",
      status: "Ditolak",
      masa_berlaku: "-",
      timestamp: "15:00 - 30/11/2025",
      keterangan: "Foto buram dan tidak terbaca",
    },
  ];

  return (
    <div className="mt-4">
      <div className="flex justify-end items-start gap-4 flex-wrap">
        <button
          onClick={() => navigate("create")}
          className="border border-[#493BC0] text-[#493BC0] font-medium px-4 py-2 rounded hover:bg-[#493BC0]/10 transition whitespace-nowrap"
        >
          Ajukan Rencana Belajar
        </button>
      </div>

      <div className="mt-6 space-y-4">
        {scoreList.map((item, index) => (
          <StudyPlan key={index} data={item} />
        ))}
      </div>
    </div>
  );
};

export default StudyPlanSubmission;

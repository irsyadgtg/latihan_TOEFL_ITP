// src/pages/student/StudyPlanSubmissionDetail.tsx
import React, { useEffect } from "react";
import { useStudentLayoutContext } from "../../layouts/StudentLayout";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

const StudyPlanSubmissionDetail: React.FC = () => {
  const { setTitle, setSubtitle } = useStudentLayoutContext();

  const navigate = useNavigate();

  useEffect(() => {
    setTitle("");
    setSubtitle("");
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm mx-auto relative">
      <div className="flex gap-2">
        <button onClick={() => navigate(-1)}>
          <IoArrowBackCircleOutline size={25} color="red" />
        </button>
        <div>
          <h3 className="text-[#A80532] font-bold text-lg">
            Form Detail Pengajuan Rencana Belajar
          </h3>
          <p className="text-[#8E8E8E] text-sm">
            Hasil detail pengajuan rencana belajar yang telah diajukan.
          </p>
        </div>
      </div>

      <div className=" mt-5 flex justify-end">
        <button
          onClick={() => navigate("feedback")}
          className="text-[#493BC0] font-medium border border-[#493BC0] px-4 py-2 rounded-lg hover:bg-[#493BC0]/10 transition"
        >
          Lihat Hasil Feedback
        </button>
      </div>

      {/* Form Inputs */}
      <div className="flex flex-col gap-5 mt-12">
        {/* Target Waktu */}
        <div>
          <label className="block font-semibold mb-1">Target Waktu</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#493BC0]"
            placeholder="Contoh: 2 minggu"
            value={"2 minggu"}
          />
        </div>

        {/* Frekuensi Waktu */}
        <div>
          <label className="block font-semibold mb-1">Frekuensi Waktu</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#493BC0]"
            placeholder="Contoh: 3 jam"
            value={"2 jam"}

          />
        </div>

        {/* Target Skor */}
        <div>
          <label className="block font-semibold mb-1">Target Skor</label>
          <input
            type="number"
            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#493BC0]"
            placeholder="140"
            value={"149"}

          />
        </div>

        {/* Berapa Waktu yang Diluangkan per-hari */}
        <div>
          <label className="block font-semibold mb-1">
            Berapa Waktu yang diluangkan per-hari
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#493BC0]"
            placeholder="Contoh: 3 hari"
            value={"3 hari"}
          />
        </div>
      </div>
    </div>
  );
};

export default StudyPlanSubmissionDetail;

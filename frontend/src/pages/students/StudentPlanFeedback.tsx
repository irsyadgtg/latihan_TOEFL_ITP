import React, { useEffect } from "react";
import { useStudentLayoutContext } from "../../layouts/StudentLayout";
import { useNavigate } from "react-router-dom";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import TabSkillCard from "../../components/TabSkillCard";

const StudentFeedback: React.FC = () => {
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
            Detail Pengajuan Rencana Belajar
          </h3>
          <p className="text-[#8E8E8E] text-sm">
            Peserta dapat melihat detail hasil feedback yang telah ditinjau oleh
            instruktur
          </p>
        </div>
      </div>
      <div className="mt-4">
        <TabSkillCard />
      </div>
    </div>
  );
};

export default StudentFeedback;

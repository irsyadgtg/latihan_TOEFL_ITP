import { useNavigate } from "react-router-dom";

type StudyPlanData = {
  name: string;
  score: string;
  targetScore: string;
  targetTime: string;
  status: string;
  masa_berlaku: string;
  timestamp: string;
  keterangan: string;
};

type StudyPlanProps = {
  data: StudyPlanData;
};

const StudyPlan = ({ data }: StudyPlanProps) => {
  const navigate = useNavigate();
  const { name, score, targetScore, targetTime, status } = data;

  return (
    <div className="border border-gray-300 px-3 py-2 rounded">
      <div className="flex justify-between flex-wrap font-medium gap-4">
        <div className="flex-1 min-w-[170px]">
          <p className="text-gray-500 text-sm">Nama Tes</p>
          <p>{name}</p>
        </div>
        <div className="flex-1 min-w-[120px]">
          <p className="text-gray-500 text-sm">Skor Awal</p>
          <p>{score}</p>
        </div>
        <div className="flex-1 min-w-[120px]">
          <p className="text-gray-500 text-sm">Target Score</p>
          <p>{targetScore}</p>
        </div>
        <div className="flex-1 min-w-[120px]">
          <p className="text-gray-500 text-sm">Target Waktu</p>
          <p>{targetTime}</p>
        </div>
        <div className="flex-1 min-w-[150px]">
          <p className="text-gray-500 text-sm">Status Pengajuan</p>
          <p>{status}</p>
        </div>
        <div className="flex-1 min-w-[120px]">
          <button
            onClick={() => navigate("detail/id-studyplan")} 
            className="border border-[#493BC0] text-[#493BC0] font-medium px-4 py-2 rounded-lg hover:bg-[#493BC0]/10 transition whitespace-nowrap"
          >
            Lihat Detail
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudyPlan;

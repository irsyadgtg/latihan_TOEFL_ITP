import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import InstructorLayout from '../../layouts/InstructorLayout';
import SkillFeedback from '../../components/instructor/SkillFeedback';
import { useStudyPlan } from '../../contexts/StudyPlanContext';

const DetailRencanaBelajar: React.FC = () => {
  const [isFeedbackMode, setIsFeedbackMode] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getRequestById, updateRequestStatus } = useStudyPlan();

  // Find the specific study plan request by its ID
  const studyPlanDetails = id ? getRequestById(id) : undefined;

  const handleSaveFeedback = (selections: any) => {
    if (!id) return;

    console.log('Feedback Disimpan:', selections);
    // Update the status in the central state
    updateRequestStatus(id, 'Sudah ada feedback');

    // Show confirmation and navigate back
    alert('Feedback berhasil disimpan!');
    navigate('/instructor/tinjau-rencana-belajar');
  };

  if (!studyPlanDetails) {
    return (
      <InstructorLayout title="Error" note="">
        <div className="text-center p-8">Pengajuan tidak ditemukan.</div>
      </InstructorLayout>
    );
  }

  return (
    <InstructorLayout
      title="Detail Rencana Belajar"
      note="Tinjau detail pengajuan rencana belajar dari siswa."
    >
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <div className="flex justify-end items-center mb-8">
          <button 
            onClick={() => window.history.back()} 
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Kembali
          </button>
        </div>

        {isFeedbackMode ? (
          <SkillFeedback onSave={handleSaveFeedback} />
        ) : (
          <div className="max-w-3xl mx-auto">
            <div className="space-y-6 mb-10">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Skor Awal</label>
                <input type="text" readOnly value={studyPlanDetails.skorAwal} className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Waktu</label>
                <input type="text" readOnly value={studyPlanDetails.targetWaktu} className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Skor</label>
                <input type="text" readOnly value={studyPlanDetails.targetSkor} className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Berapa Waktu yang diluangkan per-hari</label>
                <input type="text" readOnly value={studyPlanDetails.waktuLuang} className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Frekuensi Waktu</label>
                <input type="text" readOnly value={studyPlanDetails.frekuensi} className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100" />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setIsFeedbackMode(true)}
                className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors duration-300"
              >
                Beri Feedback
              </button>
            </div>
          </div>
        )}
      </div>
    </InstructorLayout>
  );
};

export default DetailRencanaBelajar;

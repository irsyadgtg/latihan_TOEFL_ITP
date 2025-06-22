import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import InstructorLayout from '../../layouts/InstructorLayout';
import { useStudyPlan } from '../../contexts/StudyPlanContext';

// DATA SIMULASI: Digunakan untuk pengembangan UI jika data dari context belum tersedia
const MOCK_DATA = {
  id: '1',
  studentName: 'Jane Doe',
  skills: {
    'Structure Written': {
      wantsToUnderstand: [
        "I can answer questions related to the most frequently asked noun questions in TOEFL ITP",
        "I can answer questions related to the most frequently asked verb questions in TOEFL ITP",
        "I can answer questions related to the most frequently asked SV agreement questions in TOEFL ITP",
        "I can answer questions related to the most frequently asked adjective and adverb questions in TOEFL ITP",
        "I can answer questions related to the most frequently asked pronoun questions in TOEFL ITP",
        "I can answer questions related to the most frequently asked parallel structure questions in TOEFL ITP",
        "I can answer questions related to the most frequently asked simple and compound sentence questions in TOEFL ITP",
        "I can answer questions related to the most frequently asked complex sentence questions in TOEFL ITP",
        "I can answer questions related to the most frequently asked reduce clause questions in TOEFL ITP",
        "I can answer questions related to the most frequently asked preposition and word-choice questions in TOEFL ITP",
      ],
      unitSkills: [
        "I can answer questions related to the most frequently asked noun questions in TOEFL ITP",
        "I can answer questions related to the most frequently asked verb questions in TOEFL ITP",
        "I can answer questions related to the most frequently asked SV agreement questions in TOEFL ITP",
        "I can answer questions related to the most frequently asked adjective and adverb questions in TOEFL ITP",
        "I can answer questions related to the most frequently asked pronoun questions in TOEFL ITP",
        "I can answer questions related to the most frequently asked parallel structure questions in TOEFL ITP",
        "I can answer questions related to the most frequently asked simple and compound sentence questions in TOEFL ITP",
        "I can answer questions related to the most frequently asked complex sentence questions in TOEFL ITP",
        "I can answer questions related to the most frequently asked reduce clause questions in TOEFL ITP",
        "I can answer questions related to the most frequently asked preposition and word-choice questions in TOEFL ITP",
      ],
    },
    Listening: {
      wantsToUnderstand: [
        "I can identify the gist/topic of short and longer conversations",
        "I can explain advice/suggestions given in short conversations.",
        "I can predict what the speaker will probably do next in short conversations.",
        "I can make use of context to understand meaning in short conversations.",
        "I can infer unstated details of short conversations.",
        "I can identify stated details in longer conversations.",
        "I can identify unstated details in longer conversations.",
        "I can identify the gist in lectures.",
        "I can identify stated details in lectures.",
        "I can identify unstated details in lectures.",
      ],
      unitSkills: [
        "I can identify the gist/topic of short and longer conversations",
        "I can explain advice/suggestions given in short conversations.",
        "I can predict what the speaker will probably do next in short conversations.",
        "I can make use of context to understand meaning in short conversations.",
        "I can infer unstated details of short conversations.",
        "I can identify stated details in longer conversations.",
        "I can identify unstated details in longer conversations.",
        "I can identify the gist in lectures.",
        "I can identify stated details in lectures.",
        "I can identify unstated details in lectures.",
      ],
    },
    Reading: {
      wantsToUnderstand: [
        "I can identify the topic of the passage and main idea of a paragraph.",
        "I can explain central information and details explicitly given in the passage.",
        "I can find the referential relationship questions.",
        "I can make use of context to understand literal equivalent of a word or phrase.",
        "I can explain central information and details implicitly given in the passage.",
        "I can analyze the organizational structure of a passage.",
      ],
      unitSkills: [

      ],
    },
  },
  skorAwal: '400',
  targetWaktu: '2 Minggu',
  targetSkor: '550',
  waktuLuang: '2 Jam',
  frekuensi: '5 kali seminggu',
};

// Komponen Pembantu untuk Tombol Tab
interface TabButtonProps {
  name: string;
  activeTab: string;
  setActiveTab: (name: string) => void;
}

const TabButton = ({ name, activeTab, setActiveTab }: TabButtonProps) => (
    <button
        onClick={() => setActiveTab(name)}
        className={`px-6 py-2 text-sm font-semibold focus:outline-none transition-colors duration-200 rounded-full ${
            activeTab === name
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
        }`}
    >
        {name}
    </button>
);

const DetailRencanaBelajar: React.FC = () => {
  const [isGivingFeedback, setIsGivingFeedback] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getRequestById, updateRequestStatus } = useStudyPlan();
  
  const studyPlanDetails = id ? (getRequestById(id) || MOCK_DATA) : MOCK_DATA;

  const [activeTab, setActiveTab] = useState('Structure Written');
  const [selectedSkills, setSelectedSkills] = useState<Record<string, boolean>>({});
  const [feedbackData] = useState({
      skorAwal: studyPlanDetails?.skorAwal || '',
      targetWaktu: studyPlanDetails?.targetWaktu || '',
      targetSkor: studyPlanDetails?.targetSkor || '',
      waktuLuang: studyPlanDetails?.waktuLuang || '',
      frekuensi: studyPlanDetails?.frekuensi || '',
  });

  const handleSave = () => {
    if (!id) {
        alert("ID pengajuan tidak ditemukan!");
        return;
    }
    console.log('Menyimpan data:', { selectedSkills, feedbackData });
    updateRequestStatus(id, 'Sudah ada feedback');
    alert('Feedback berhasil disimpan!');
    navigate('/instructor/tinjau-rencana-belajar');
  };
  
  const handleSkillSelection = (skill: string) => {
    setSelectedSkills(prev => ({ ...prev, [skill]: !prev[skill] }));
  };


  if (!studyPlanDetails) {
    return <InstructorLayout title="Memuat..." note="Mohon tunggu..."><div className="p-8">Memuat detail rencana belajar...</div></InstructorLayout>;
  }

  // The data from the context might not have the 'skills' property.
  // We create a variable 'dataSource' that is guaranteed to have the structure of MOCK_DATA,
  // which prevents runtime errors and satisfies TypeScript.
  const dataSource: typeof MOCK_DATA =
    studyPlanDetails && 'skills' in (studyPlanDetails as any) && (studyPlanDetails as any).skills
      ? (studyPlanDetails as typeof MOCK_DATA)
      : MOCK_DATA;

  const currentSkills = dataSource.skills[activeTab as keyof typeof dataSource.skills];

  return (
    <InstructorLayout title="Detail Rencana Belajar" note="Instruktur dapat memverifikasi rencana belajar dari peserta">
      <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      {!isGivingFeedback ? (
        // STATE 1: Tampilan Detail Pengajuan
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(-1)} className="group">
                <div className="flex items-center justify-center h-9 w-9 rounded-full border-2 border-red-600 text-red-600 group-hover:bg-red-50 transition-colors">
                  <ArrowLeft size={20} />
                </div>
              </button>
              <div>
                <h1 className="text-[22px] font-semibold text-primary">Detail Pengajuan</h1>
                <p className="text-sm text-gray-500 mt-1">Data pengajuan dari calon peserta.</p>
              </div>
            </div>
            <button
              onClick={() => setIsGivingFeedback(true)}
              className="px-5 py-2 border border-violet-500 text-violet-500 rounded-lg hover:bg-violet-50 text-sm font-semibold transition-colors"
            >
              Beri Feedback
            </button>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm max-w-3xl mx-auto">
            <div className="space-y-5">
              <div>
                  <label className="block font-semibold mb-1">Skor Awal</label>
                <input type="text" value={feedbackData.skorAwal} className="w-full p-3 bg-gray-100 border border-gray-200 rounded-lg text-sm" disabled />
              </div>
              <div>
                  <label className="block font-semibold mb-1">Target Waktu</label>
                <input type="text" value={feedbackData.targetWaktu} className="w-full p-3 bg-gray-100 border border-gray-200 rounded-lg text-sm" disabled />
              </div>
              <div>
                  <label className="block font-semibold mb-1">Target Skor</label>
                <input type="text" value={feedbackData.targetSkor} className="w-full p-3 bg-gray-100 border border-gray-200 rounded-lg text-sm" disabled />
              </div>
              <div>
                  <label className="block font-semibold mb-1">Berapa Waktu yang diluangkan per-hari</label>
                <input type="text" value={feedbackData.waktuLuang} className="w-full p-3 bg-gray-100 border border-gray-200 rounded-lg text-sm" disabled />
              </div>
              <div>
                  <label className="block font-semibold mb-1">Frekuensi Waktu</label>
                <input type="text" value={feedbackData.frekuensi} className="w-full p-3 bg-gray-100 border border-gray-200 rounded-lg text-sm" disabled />
              </div>
            </div>
            
          </div>
        </div>
      ) : (
        // STATE 2: Tampilan Pemberian Feedback
        <div>
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => setIsGivingFeedback(false)} className="group">
              <div className="flex items-center justify-center h-9 w-9 rounded-full border-2 border-red-600 text-red-600 group-hover:bg-red-50 transition-colors">
                <ArrowLeft size={20} />
              </div>
            </button>
            <div>
              <h1 className="text-[22px] font-semibold text-primary">Pemberian Feedback</h1>
              <p className="text-sm text-gray-500 mt-1">Pilih unit skill yang direkomendasikan untuk peserta.</p>
            </div>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm">
            <div className="mb-6">
              <div className="flex space-x-2">
                {['Structure Written', 'Listening', 'Reading'].map((tab) => (
                  <TabButton key={tab} name={tab} activeTab={activeTab} setActiveTab={setActiveTab} />
                ))}
              </div>
            </div>

            <div className="space-y-8">
              {/* Hal Ingin Dipahami */}
              <div className="p-6 border border-gray-200 rounded-lg">
                <h3 className="text-base font-bold mb-4 text-gray-800">Hal Ingin Yang Dipahami Student - Bagian {activeTab}</h3>
                <ul className="space-y-4">
                  {currentSkills.wantsToUnderstand.map((item: string, index: number) => (
                    <li key={`wants-${index}`} className="flex items-center gap-3">
                      <div className="relative flex items-center justify-center">
                        <input
                          type="checkbox"
                          className="appearance-none h-5 w-5 rounded-full border-2 border-gray-800"
                          checked
                          disabled
                        />
                        <div className="absolute h-[9px] w-[9px] rounded-full bg-gray-800 pointer-events-none"></div>
                      </div>
                      <span className="text-sm text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Unit Skill */}
              <div className="p-6 border border-gray-200 rounded-lg">
                <h3 className="text-base font-bold mb-4 text-gray-800">Unit Skill - Bagian {activeTab}</h3>
                <ul className="space-y-4">
                  {currentSkills.unitSkills.map((item: string, index: number) => (
                    <li key={`skill-${index}`} className="flex items-center gap-3">
                      <div className="relative flex items-center justify-center">
                        <input
                          type="checkbox"
                          id={`skill-${index}`}
                          className="peer appearance-none h-5 w-5 rounded-full border-2 border-gray-400 checked:border-gray-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 transition-colors"
                          checked={selectedSkills[item] || false}
                          onChange={() => handleSkillSelection(item)}
                        />
                        <div className="absolute h-[9px] w-[9px] rounded-full bg-gray-800 opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"></div>
                      </div>
                      <label htmlFor={`skill-${index}`} className="text-sm text-gray-700 cursor-pointer">{item}</label>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-8 pt-6 flex justify-end">
              <button
                onClick={handleSave}
                  className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-bold transition-colors shadow">
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </InstructorLayout>
  );
};

export default DetailRencanaBelajar;

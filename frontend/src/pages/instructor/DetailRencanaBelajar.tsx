import React, { useState, useEffect } from 'react'; // Tambahkan useEffect
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react'; // Pastikan lucide-react terinstal
import axiosInstance from '../../services/axios'; // Import axiosInstance
import axios, { AxiosError } from 'axios'; // <--- PERBAIKAN: Import axios dan AxiosError
import { format } from 'date-fns'; // Untuk format tanggal

// --- INTERFACE DATA API (Sesuai output TinjauRencanaBelajarController@show) ---
interface ApiSkillItem {
  id: number;
  kategori: string;
  skill: string;
  deskripsi: string;
}

interface StudentRequestedSkill {
  id_detail_pengajuan: number;
  kategori: string;
  skill: {
    id: number;
    deskripsi: string;
  };
}

interface InstructorStudyPlanDetailResponse {
  id: number;
  nama_rencana: string;
  target_skor: number;
  target_waktu: string;
  frekuensi_mingguan: number;
  durasi_harian: string;
  status: string;
  peserta: {
    nama: string;
    email: string;
  };
  detail_pengajuan: StudentRequestedSkill[];
  daftar_skill: ApiSkillItem[];
}

interface TabButtonProps {
  name: string;
  activeTab: string;
  setActiveTab: (name: string) => void;
  skillCount: number;
}

const TabButton = ({ name, activeTab, setActiveTab, skillCount }: TabButtonProps) => (
  <button
    onClick={() => setActiveTab(name)}
    className={`px-4 py-2 text-sm font-semibold focus:outline-none transition-colors duration-200 rounded-full flex items-center gap-2
            ${activeTab === name
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
          }`}
  >
    {name} <span className="text-xs px-2 py-0.5 bg-white bg-opacity-30 rounded-full">{skillCount}</span>
  </button>
);


const DetailRencanaBelajar: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  const [detailData, setDetailData] = useState<InstructorStudyPlanDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [activeTab, setActiveTab] = useState('Structure and Written Expression');
  const [selectedRecommendedSkills, setSelectedRecommendedSkills] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const fetchDetailData = async () => {
      if (!id) {
        setError("ID pengajuan tidak ditemukan.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.get<InstructorStudyPlanDetailResponse>(`/pengajuan-rencana-belajar/${id}`);
        setDetailData(response.data);

        setSelectedRecommendedSkills({});

      } catch (err: unknown) { // <--- type 'unknown' ditangani di sini
        console.error("Failed to fetch study plan detail:", err);
        if (axios.isAxiosError(err)) { // <--- Pastikan axios diimpor
          if (err.response?.status === 401) {
            setError("Sesi Anda telah berakhir. Silakan login kembali.");
            localStorage.removeItem('AuthToken');
            navigate('/instructor/login');
          } else if (err.response?.data && typeof err.response.data === 'object' && 'message' in err.response.data) {
            setError(err.response.data.message as string);
          } else {
            setError(`Terjadi kesalahan: ${err.response?.status} ${err.response?.statusText || 'Error'}`);
          }
        } else {
          setError("Terjadi kesalahan tidak terduga.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDetailData();
  }, [id, navigate]);

  const handleSkillSelection = (skillId: number) => {
    setSelectedRecommendedSkills(prev => ({ ...prev, [skillId]: !prev[skillId] }));
  };

  const handleSaveFeedback = async () => {
    if (!id) {
      alert("ID pengajuan tidak ditemukan!");
      return;
    }

    const selectedSkillIds = Object.keys(selectedRecommendedSkills)
                                 .filter(key => selectedRecommendedSkills[Number(key)])
                                 .map(Number);

    if (selectedSkillIds.length === 0) {
      setError("Anda harus memilih setidaknya satu Unit Skill untuk rekomendasi.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    const payload = {
      detail: selectedSkillIds.map(skill_id => ({ skill_id }))
    };

    try {
      const response = await axiosInstance.post(`/pengajuan-rencana-belajar/${id}/feedback`, payload);
      setSuccessMessage(response.data.message || 'Feedback berhasil disimpan!');
      console.log("Feedback submitted successfully:", response.data);

      navigate('/instructor/tinjau-rencana-belajar', { 
        state: { refreshList: true } 
      });

    } catch (err: unknown) { // <--- type 'unknown' ditangani di sini
      console.error("Failed to submit feedback:", err);
      if (axios.isAxiosError(err)) { // <--- Pastikan axios diimpor
        if (err.response?.status === 400 && err.response.data && typeof err.response.data === 'object' && 'message' in err.response.data) {
            setError(err.response.data.message as string);
        } else if (err.response?.data && typeof err.response.data === 'object' && 'message' in err.response.data) {
          setError(err.response.data.message as string);
        } else {
          setError(`Gagal menyimpan feedback: ${err.response?.status} ${err.response?.statusText || 'Error'}`);
        }
      } else {
        setError("Terjadi kesalahan tidak terduga saat menyimpan feedback.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDaftarSkills = detailData?.daftar_skill?.filter(skill => 
    skill.kategori === activeTab
  ) || [];

  const studentWantsToUnderstandSkills = detailData?.detail_pengajuan?.filter(skill =>
    skill.kategori === activeTab
  ) || [];

  const uniqueCategories = Array.from(new Set(detailData?.daftar_skill?.map(skill => skill.kategori) || []));


  if (loading) {
    return <div className="p-8 text-center text-gray-600">Memuat detail rencana belajar...</div>;
  }

  if (error && !detailData) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-md mt-4 text-center">
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="mt-2 text-blue-700 underline">
          Coba Lagi
        </button>
      </div>
    );
  }

  if (!detailData) {
    return <div className="p-8 text-center text-gray-600">Detail rencana belajar tidak ditemukan.</div>;
  }


  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
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
        {detailData.status === 'pending' && (
          <button
            onClick={handleSaveFeedback}
            disabled={isSubmitting}
            className="px-5 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan Feedback'}
          </button>
        )}
        {detailData.status !== 'pending' && (
             <span className="px-3 py-1 text-sm font-semibold rounded-full bg-gray-200 text-gray-700">
               Status: {detailData.status === "sudah ada feedback" ? "Berjalan" : detailData.status}
             </span>
        )}
      </div>

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mt-4 mb-4" role="alert">
          {successMessage}
        </div>
      )}
      {error && !successMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4 mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white p-8 rounded-xl shadow-sm max-w-3xl mx-auto mb-6">
        <div className="space-y-5">
          <div>
            <label className="block font-semibold mb-1">Nama Peserta</label>
            <input type="text" value={detailData.peserta.nama} className="w-full p-3 bg-gray-100 border border-gray-200 rounded-lg text-sm" disabled />
          </div>
          <div>
            <label className="block font-semibold mb-1">Email Peserta</label>
            <input type="text" value={detailData.peserta.email} className="w-full p-3 bg-gray-100 border border-gray-200 rounded-lg text-sm" disabled />
          </div>
          <div>
            <label className="block font-semibold mb-1">Nama Rencana</label>
            <input type="text" value={detailData.nama_rencana} className="w-full p-3 bg-gray-100 border border-gray-200 rounded-lg text-sm" disabled />
          </div>
          <div>
            <label className="block font-semibold mb-1">Target Skor</label>
            <input type="text" value={String(detailData.target_skor)} className="w-full p-3 bg-gray-100 border border-gray-200 rounded-lg text-sm" disabled />
          </div>
          <div>
            <label className="block font-semibold mb-1">Target Waktu</label>
            <input type="text" value={detailData.target_waktu} className="w-full p-3 bg-gray-100 border border-gray-200 rounded-lg text-sm" disabled />
          </div>
          <div>
            <label className="block font-semibold mb-1">Frekuensi Mingguan</label>
            <input type="text" value={String(detailData.frekuensi_mingguan)} className="w-full p-3 bg-gray-100 border border-gray-200 rounded-lg text-sm" disabled />
          </div>
          <div>
            <label className="block font-semibold mb-1">Durasi Harian</label>
            <input type="text" value={detailData.durasi_harian} className="w-full p-3 bg-gray-100 border border-gray-200 rounded-lg text-sm" disabled />
          </div>
        </div>
      </div>
      
      {/* Bagian Pemberian Feedback (Hanya tampil jika status pending) */}
      {detailData.status === 'pending' && (
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm">
          <div className="mb-6">
            <div className="flex space-x-2 overflow-x-auto pb-2"> {/* overflow-x-auto untuk tab jika terlalu banyak */}
              {uniqueCategories.map((tab) => (
                <TabButton 
                  key={tab} 
                  name={tab} 
                  activeTab={activeTab} 
                  setActiveTab={setActiveTab} 
                  skillCount={detailData.daftar_skill.filter(s => s.kategori === tab).length}
                />
              ))}
            </div>
          </div>

          <div className="space-y-8">
            {/* Hal Ingin Dipahami Student */}
            <div className="p-6 border border-gray-200 rounded-lg">
              <h3 className="text-base font-bold mb-4 text-gray-800">Hal Ingin Yang Dipahami Student - Bagian {activeTab}</h3>
              <ul className="space-y-4">
                {studentWantsToUnderstandSkills.length > 0 ? (
                  studentWantsToUnderstandSkills.map((item) => (
                    <li key={`wants-${item.skill.id}`} className="flex items-center gap-3">
                      <div className="relative flex items-center justify-center">
                        <input
                          type="checkbox"
                          className="appearance-none h-5 w-5 rounded-full border-2 border-gray-800"
                          checked
                          disabled
                        />
                        <div className="absolute h-[9px] w-[9px] rounded-full bg-gray-800 pointer-events-none"></div>
                      </div>
                      <span className="text-sm text-gray-700">{item.skill.deskripsi}</span>
                    </li>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">Tidak ada skill yang diajukan di bagian ini.</p>
                )}
              </ul>
            </div>

            {/* Unit Skill (untuk direkomendasikan) */}
            <div className="p-6 border border-gray-200 rounded-lg">
              <h3 className="text-base font-bold mb-4 text-gray-800">Unit Skill (Rekomendasi Instruktur) - Bagian {activeTab}</h3>
              <ul className="space-y-4">
                {filteredDaftarSkills.length > 0 ? (
                  filteredDaftarSkills.map((item) => (
                    <li key={`skill-${item.id}`} className="flex items-center gap-3">
                      <div className="relative flex items-center justify-center">
                        <input
                          type="checkbox"
                          id={`skill-${item.id}`}
                          className="peer appearance-none h-5 w-5 rounded-full border-2 border-gray-400 checked:border-gray-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 transition-colors"
                          checked={selectedRecommendedSkills[item.id] || false}
                          onChange={() => handleSkillSelection(item.id)}
                        />
                        <div className="absolute h-[9px] w-[9px] rounded-full bg-gray-800 opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"></div>
                      </div>
                      <label htmlFor={`skill-${item.id}`} className="text-sm text-gray-700 cursor-pointer">{item.deskripsi}</label>
                    </li>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">Tidak ada unit skill yang tersedia di bagian ini.</p>
                )}
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-6 flex justify-end">
            <button
              onClick={handleSaveFeedback}
              disabled={isSubmitting}
              className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-bold transition-colors shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Feedback'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailRencanaBelajar;
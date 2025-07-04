import React, { useState, useEffect, useCallback } from 'react'; // Tambahkan useCallback
import StudyPlanRequestItem from '../../components/instructor/StudyPlanRequestItem';
import { useDashboardLayoutContext } from '../../layouts/DashboardLayout';
import axiosInstance from '../../services/axios';
import axios, { AxiosError } from 'axios'; // Import AxiosError
import { useNavigate, useLocation } from 'react-router-dom';

// --- INTERFACE DATA ---
// Pastikan interface ini sama persis dengan yang ada di StudyPlanRequestItem.tsx
interface InstructorStudyPlanRequestItem {
  id: number;
  tglPengajuan: string;
  nama_peserta: string;
  email_peserta: string;
  status: string;
}

interface TinjauRencanaBelajarApiResponse {
  pengajuan: InstructorStudyPlanRequestItem[];
}

interface StudyPlanRequestItemProps {
  request: InstructorStudyPlanRequestItem;
  onProvideFeedback: (id: number) => void;
}

const TinjauRencanaBelajar: React.FC = () => {
  const [studyPlanRequests, setStudyPlanRequests] = useState<InstructorStudyPlanRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { setTitle, setSubtitle } = useDashboardLayoutContext();
  const navigate = useNavigate();
  const location = useLocation();

  // Fungsi fetchStudyPlanRequests dibungkus useCallback agar stabil sebagai dependency
  const fetchStudyPlanRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get<TinjauRencanaBelajarApiResponse>('/pengajuan-rencana-belajar');
      const data = response.data.pengajuan;

      if (Array.isArray(data)) {
        setStudyPlanRequests(data);
        console.log("Pengajuan rencana belajar dimuat:", data);
      } else {
        setError("Format data 'pengajuan' dari server tidak sesuai (bukan array).");
        console.error("API response for /pengajuan-rencana-belajar is not an array in 'pengajuan' property:", response.data);
      }
    } catch (err: unknown) { // <--- type 'unknown' ditangani di sini
      console.error("Gagal memuat pengajuan rencana belajar:", err);
      if (axios.isAxiosError(err)) { // <--- Pastikan axios diimpor untuk ini
        if (err.response) {
          if (err.response.status === 401) {
            setError("Sesi Anda telah berakhir atau tidak valid. Silakan login kembali.");
            localStorage.removeItem('AuthToken');
            localStorage.removeItem('userData');
            navigate('/instructor/login');
          } else if (err.response.data && typeof err.response.data === 'object' && 'message' in err.response.data) {
            setError(err.response.data.message as string);
          } else {
            setError(`Terjadi kesalahan: ${err.response.status} ${err.response.statusText || 'Error'}`);
          }
        } else if (err.request) {
          setError("Tidak dapat terhubung ke server. Periksa koneksi internet Anda.");
        } else {
          setError("Terjadi kesalahan saat mengatur permintaan. Mohon coba lagi.");
        }
      } else {
        setError("Terjadi kesalahan tidak terduga.");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]); // navigate sebagai dependency useCallback

  useEffect(() => {
    setTitle("Tinjau Rencana Belajar");
    setSubtitle("Lihat dan berikan feedback pada pengajuan rencana belajar.");
    fetchStudyPlanRequests();
  }, [setTitle, setSubtitle, fetchStudyPlanRequests, refreshTrigger]);

  useEffect(() => {
    if (location.state && (location.state as any).refreshList) {
      setRefreshTrigger(prev => prev + 1);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  const handleProvideFeedback = (id: number) => {
    navigate(`/instructor/rencana-belajar/${id}`, { 
      state: { refreshList: true } 
    }); 
  };

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-lg mt-4 text-center text-gray-600">
        Memuat pengajuan rencana belajar...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mt-4 text-center">
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="mt-2 text-blue-700 underline">
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg mt-4">
      <div className="space-y-4">
        {studyPlanRequests.length > 0 ? (
          studyPlanRequests.map(request => (
            <StudyPlanRequestItem
              key={request.id}
              request={request}
              onProvideFeedback={handleProvideFeedback}
            />
          ))
        ) : (
          <p className="text-center text-gray-500 py-10">Tidak ada pengajuan untuk ditinjau.</p>
        )}
      </div>
    </div>
  );
};

export default TinjauRencanaBelajar;
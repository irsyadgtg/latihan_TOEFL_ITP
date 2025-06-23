import React, { useState, useEffect } from 'react'; // Pastikan useEffect diimport
import StudyPlanRequestItem from '../../components/instructor/StudyPlanRequestItem';
import { useStudyPlan, type StudyPlanStatus } from '../../contexts/StudyPlanContext';
import { useDashboardLayoutContext } from '../../layouts/DashboardLayout'; // Import context DashboardLayout

const TinjauRencanaBelajar: React.FC = () => {
  const { requests } = useStudyPlan();

  // Ambil setter dari context DashboardLayout
  const { setTitle, setSubtitle } = useDashboardLayoutContext();

  // Gunakan useEffect untuk mengatur judul saat komponen dimuat
  useEffect(() => {
    setTitle("Tinjau Rencana Belajar");
    setSubtitle("Lihat dan berikan feedback pada pengajuan rencana belajar.");
    
    // Opsional: Cleanup function jika Anda ingin mengatur ulang judul saat komponen unmount
    // return () => {
    //   setTitle(""); 
    //   setSubtitle("");
    // };
  }, [setTitle, setSubtitle]); // Pastikan dependensi dimasukkan

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg mt-4"> {/* Tambahkan mt-4 jika perlu margin atas */}
      {/* Seluruh bagian navigasi tab dihapus */}

      {/* Bagian judul dan subjudul lokal dihapus karena sudah diatur via context */}

      <div className="space-y-4">
        {requests.length > 0 ? ( // Langsung menggunakan requests
          requests.map(request => (
            <StudyPlanRequestItem
              key={request.id}
              request={request}
            />
          ))
        ) : (
          <p className="text-center text-gray-500 py-10">Tidak ada pengajuan untuk kategori ini.</p>
        )}
      </div>
    </div>
  );
};

export default TinjauRencanaBelajar;
// src/components/instructor/StudyPlanRequestItem.tsx
import React from 'react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

// Interface ini HARUS SAMA PERSIS dengan InstructorStudyPlanRequestItem dari TinjauRencanaBelajar.tsx
// Ini adalah struktur data yang datang dari API untuk satu request
interface InstructorStudyPlanRequestItem {
  id: number;
  tglPengajuan: string;
  nama_peserta: string; // Proper name from API
  email_peserta: string; // Proper name from API
  status: string;
}

// Interface props untuk komponen StudyPlanRequestItem
interface StudyPlanRequestItemProps {
  request: InstructorStudyPlanRequestItem; // Pastikan ini cocok dengan data API
  onProvideFeedback: (id: number) => void;
}

const StudyPlanRequestItem: React.FC<StudyPlanRequestItemProps> = ({ request, onProvideFeedback }) => {
  const formattedDate = request.tglPengajuan ? format(new Date(request.tglPengajuan), 'dd MMMM yyyy HH:mm', { locale: idLocale }) : '-';

  let statusColorClass = "bg-gray-100 text-gray-800";
  if (request.status === "pending") {
    statusColorClass = "bg-yellow-100 text-yellow-800";
  } else if (request.status === "Disetujui" || request.status === "sudah ada feedback") {
    statusColorClass = "bg-green-100 text-green-800";
  } else if (request.status === "Ditolak") {
    statusColorClass = "bg-red-100 text-red-800";
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-4 shadow-sm flex justify-between items-center">
      <div>
        <h4 className="text-lg font-semibold text-gray-800">
          Pengajuan Rencana Belajar - {request.nama_peserta} {/* <--- GUNAKAN nama_peserta */}
        </h4>
        <p className="text-sm text-gray-600">
          Email: {request.email_peserta} {/* <--- GUNAKAN email_peserta */}
        </p>
        <p className="text-sm text-gray-600">
          Tanggal Pengajuan: {formattedDate}
        </p>
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColorClass} mt-2 inline-block`}>
          Status: {request.status}
        </span>
      </div>
      <button
        onClick={() => onProvideFeedback(request.id)}
        className="px-4 py-2 bg-[#493BC0] text-white rounded-md hover:bg-[#3A2C9B] transition-colors"
      >
        Lihat Detail & Beri Feedback
      </button>
    </div>
  );
};

export default StudyPlanRequestItem;
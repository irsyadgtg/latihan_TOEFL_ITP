import React from "react";
import { IoEyeOutline } from "react-icons/io5"; // Hanya import IoEyeOutline, IoCreateOutline tidak perlu
import { format } from 'date-fns'; // Untuk format tanggal

// Interface ini harus sama persis dengan StudyPlanListItem di StudyPlanSubmission.tsx
interface StudyPlanListItem {
  idPengajuanRencanaBelajar: number;
  namaRencana: string;
  targetSkor: number;
  targetWaktu: string;
  hariPerMinggu: number;
  jamPerHari: string;
  tglPengajuan: string; // ISO string
  status: "pending" | "Disetujui" | "Ditolak" | "sudah ada feedback" | "selesai";
  tanggalMulai: string; // ISO string
  selesaiPada: string; // ISO string
  detail_pengajuan_rencana_belajar: { skill: { idSkill: number; namaSkill: string; deskripsi: string; } }[];
}

interface StudyPlanProps {
  data: StudyPlanListItem;
  // onEdit: (id: number) => void; // <--- DIHAPUS: Prop onEdit tidak lagi diperlukan
  onViewDetail: (id: number) => void;
  initialScore?: number; // Skor awal dari API level atas (skor_awal)
}

const StudyPlan: React.FC<StudyPlanProps> = ({ data, onViewDetail, initialScore }) => { // onEdit dihapus dari destructuring
  const formattedTglPengajuan = data.tglPengajuan ? format(new Date(data.tglPengajuan), 'dd/MM/yyyy HH:mm') : '-';
  const formattedSelesaiPada = data.selesaiPada ? format(new Date(data.selesaiPada), 'dd/MM/yyyy') : '-';

  // Penentuan kelas CSS dan teks untuk status
  let statusColorClass = "bg-gray-100 text-gray-800";
  let statusText: string = data.status;
  if (data.status === "pending") {
    statusColorClass = "bg-yellow-100 text-yellow-800";
  } else if (data.status === "Disetujui" || data.status === "sudah ada feedback") {
    statusColorClass = "bg-green-100 text-green-800";
    statusText = data.status === "sudah ada feedback" ? "Berjalan" : "Disetujui";
  } else if (data.status === "Ditolak") {
    statusColorClass = "bg-red-100 text-red-800";
  } else if (data.status === "selesai") {
    statusColorClass = "bg-blue-100 text-blue-800";
    statusText = "Selesai";
  }

  const displayKeterangan = "-"; // Ganti ini jika Anda memiliki sumber keterangan yang jelas

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
      <div className="flex justify-between items-start mb-3">
        <h4 className="text-lg font-semibold text-gray-900">{data.namaRencana}</h4>
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColorClass}`}>
          {statusText}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm text-gray-700 mb-4">
        <div>
          <span className="font-medium">Skor Awal: </span>
          <span>{initialScore !== undefined ? initialScore : 'N/A'}</span>
        </div>
        <div>
          <span className="font-medium">Target Skor: </span>
          <span>{data.targetSkor}</span>
        </div>
        <div>
          <span className="font-medium">Target Waktu: </span>
          <span>{data.targetWaktu}</span>
        </div>
        <div>
          <span className="font-medium">Durasi Belajar: </span>
          <span>{`${data.jamPerHari} (${data.hariPerMinggu} hari/minggu)`}</span>
        </div>
        <div>
          <span className="font-medium">Diajukan Pada: </span>
          <span>{formattedTglPengajuan}</span>
        </div>
        <div>
          <span className="font-medium">Selesai Pada: </span>
          <span>{formattedSelesaiPada}</span>
        </div>
        <div className="col-span-2">
          <span className="font-medium">Keterangan: </span>
          <span>{displayKeterangan}</span>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        {/* <--- DIHAPUS: Tombol Edit tidak lagi dirender --->
        {data.status === "pending" && (
          <button
            onClick={() => onEdit(data.idPengajuanRencanaBelajar)}
            className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <IoCreateOutline size={18} /> Edit
          </button>
        )}
        */}
        <button
          onClick={() => onViewDetail(data.idPengajuanRencanaBelajar)}
          className="flex items-center gap-1 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <IoEyeOutline size={18} /> Lihat Detail
        </button>
      </div>
    </div>
  );
};

export default StudyPlan;
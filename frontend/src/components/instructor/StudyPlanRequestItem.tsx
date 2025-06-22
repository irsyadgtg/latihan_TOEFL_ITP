import React from 'react';
import { Link } from 'react-router-dom';
import type { StudyPlanRequest } from '../../contexts/StudyPlanContext';

interface StudyPlanRequestItemProps {
  request: StudyPlanRequest;
}

const StudyPlanRequestItem: React.FC<StudyPlanRequestItemProps> = ({ request }) => {
  return (
    <div className="flex justify-between items-center p-4 border border-gray-200 rounded-xl shadow-sm bg-white">
      <div className="flex items-center space-x-12">
        <div>
          <p className="text-xs text-gray-500">Nama Lengkap</p>
          <p className="font-semibold text-gray-800">{request.name}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Email</p>
          <p className="font-semibold text-gray-800">{request.email}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Status Pengajuan</p>
          <p className="font-semibold text-gray-800">{request.status}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Timestamp</p>
          <p className="font-semibold text-gray-800">{request.timestamp}</p>
        </div>
      </div>
      <Link
        to={`/instructor/rencana-belajar/${request.id}`}
        className="border border-indigo-300 text-indigo-600 font-semibold py-2 px-6 rounded-lg hover:bg-indigo-50 transition-colors duration-300 text-sm whitespace-nowrap"
      >
        Tinjau
      </Link>
    </div>
  );
};

export default StudyPlanRequestItem;

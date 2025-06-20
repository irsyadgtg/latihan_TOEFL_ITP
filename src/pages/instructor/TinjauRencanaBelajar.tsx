import React, { useState, useMemo } from 'react';
import InstructorLayout from '../../layouts/InstructorLayout';
import StudyPlanRequestItem from '../../components/instructor/StudyPlanRequestItem';
import { useStudyPlan, type StudyPlanStatus } from '../../contexts/StudyPlanContext';

type Tab = 'Semua' | StudyPlanStatus;

const TinjauRencanaBelajar: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('Semua');
  const { requests } = useStudyPlan();

  const tabs: Tab[] = ['Semua', 'Pending', 'Sudah ada feedback'];

  const filteredRequests = useMemo(() => {
    if (activeTab === 'Semua') {
      return requests;
    }
    return requests.filter(request => request.status === activeTab);
  }, [activeTab, requests]);

  return (
    <InstructorLayout
      title="Pengajuan Rencana Belajar"
      note="Instruktur dapat memverifikasi rencana belajar dari peserta"
    >
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`${activeTab === tab
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        <div className="space-y-4">
          {filteredRequests.length > 0 ? (
            filteredRequests.map(request => (
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
    </InstructorLayout>
  );
};

export default TinjauRencanaBelajar;

import { createContext, useState, useContext, type ReactNode } from 'react';

// Define the shape of a request
export type StudyPlanStatus = 'Pending' | 'Sudah ada feedback';
export interface StudyPlanRequest {
  id: string;
  name: string;
  email: string;
  avatar: string;
  status: StudyPlanStatus;
  timestamp: string;
  skorAwal: string;
  targetWaktu: string;
  targetSkor: string;
  waktuLuang: string;
  frekuensi: string;
}

// Initial mock data
const mockRequests: StudyPlanRequest[] = new Array(7).fill(null).map((_, index) => ({
  id: `${index + 1}`,
  name: 'Tharra Zebadiah',
  email: 'tharra20@gmail.com',
  avatar: `https://i.pravatar.cc/150?u=a042581f4e29026704d${index}`,
  status: 'Pending',
  timestamp: '08:00 - 10/04/2025',
  skorAwal: '450',
  targetWaktu: '2 Bulan',
  targetSkor: '550',
  waktuLuang: '2 jam/hari',
  frekuensi: '5 kali/minggu',
}));

// Define the context shape
interface StudyPlanContextType {
  requests: StudyPlanRequest[];
  getRequestById: (id: string) => StudyPlanRequest | undefined;
  updateRequestStatus: (id: string, status: StudyPlanStatus) => void;
}

// Create the context
const StudyPlanContext = createContext<StudyPlanContextType | undefined>(undefined);

// Create the provider component
export const StudyPlanProvider = ({ children }: { children: ReactNode }) => {
  const [requests, setRequests] = useState<StudyPlanRequest[]>(mockRequests);

  const getRequestById = (id: string) => {
    return requests.find(req => req.id === id);
  };

  const updateRequestStatus = (id: string, status: StudyPlanStatus) => {
    setRequests(prevRequests =>
      prevRequests.map(req =>
        req.id === id ? { ...req, status } : req
      )
    );
  };

  const value = { requests, getRequestById, updateRequestStatus };

  return (
    <StudyPlanContext.Provider value={value}>
      {children}
    </StudyPlanContext.Provider>
  );
};

// Create a custom hook for easy consumption
export const useStudyPlan = () => {
  const context = useContext(StudyPlanContext);
  if (context === undefined) {
    throw new Error('useStudyPlan must be used within a StudyPlanProvider');
  }
  return context;
};

// src/components/TabSkillCard.tsx
import React from 'react';

export interface TabSkillCardProps {
  feedbackData: {
    Structure: string | null;
    Listening: string | null;
    Reading: string | null;
  };
}

const TabSkillCard: React.FC<TabSkillCardProps> = ({ feedbackData }) => {
  const [activeTab, setActiveTab] = React.useState('Structure'); 

  const getCurrentFeedback = (): string | null => {
    switch (activeTab) {
      case 'Structure':
        return feedbackData.Structure;
      case 'Listening':
        return feedbackData.Listening;
      case 'Reading':
        return feedbackData.Reading;
      default:
        return null;
    }
  };

  const currentFeedbackContent = getCurrentFeedback();

  return (
    <div className="mx-auto px-4 py-6">
      <div className="flex border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('Structure')}
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'Structure' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Structure
        </button>
        <button 
          onClick={() => setActiveTab('Listening')}
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'Listening' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Listening
        </button>
        <button 
          onClick={() => setActiveTab('Reading')}
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'Reading' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Reading
        </button>
      </div>

      <div className="mt-4 p-4 border rounded-lg bg-gray-50">
        <h3 className="font-bold text-lg mb-2">
          Feedback untuk Bagian {activeTab}
        </h3>
        {currentFeedbackContent ? (
          <p className="text-sm whitespace-pre-line text-gray-800">{currentFeedbackContent}</p>
        ) : (
          <p className="text-sm text-gray-500">Belum ada feedback dari instruktur untuk bagian ini.</p>
        )}
      </div>
    </div>
  );
};

export default TabSkillCard;
import React, { useState } from 'react';

// Mock data for demonstration
const skillData = {
  'Structure Written': {
    dipahami: [
      'I can answer questions related to the most frequently asked noun questions in TOEFL ITP',
      'I can answer questions related to the most frequently asked verb questions in TOEFL ITP',
      'I can answer questions related to the most frequently asked SV agreement questions in TOEFL ITP',
    ],
    unitSkill: [
      'I can answer questions related to the most frequently asked noun questions in TOEFL ITP',
      'I can answer questions related to the most frequently asked verb questions in TOEFL ITP',
      'I can answer questions related to the most frequently asked SV agreement questions in TOEFL ITP',
      'I can answer questions related to the most frequently asked adjective and adverb questions in TOEFL ITP',
      'I can answer questions related to the most frequently asked pronoun questions in TOEFL ITP',
      'I can answer questions related to the most frequently asked parallel structure questions in TOEFL ITP',
    ],
  },
  'Listening': {
    dipahami: [
        'I can identify the gist/topic of short and longer conversations',
        'I can explain advice/suggestions given in short conversations.',
    ],
    unitSkill: [
        'I can identify the gist/topic of short and longer conversations',
        'I can explain advice/suggestions given in short conversations.',
        'I can predict what the speaker will probably do next in short conversations.',
        'I can make use of context to understand meaning in short conversations.',
        'I can infer unstated details of short conversations.',
    ],
  },
  'Reading': {
    dipahami: [
        'I can identify the topic of the passage and main idea of a paragraph.',
        'I can identify central information and details explicitly given in the passage.',
    ],
    unitSkill: [
        'I can identify the topic of the passage and main idea of a paragraph.',
        'I can identify central information and details explicitly given in the passage.',
        'I can find the referential relationship questions.',
        'I can make use of context to understand literal equivalent of a word or phrase.',
    ],
  },
};

type Skill = 'Structure Written' | 'Listening' | 'Reading';

interface SkillFeedbackProps {
  // For now, we assume the student selections are the same as the 'dipahami' list for demonstration.
  // In a real scenario, this would come from the specific student's request.
  onSave: (selections: Record<Skill, string[]>) => void;
}

const SkillFeedback: React.FC<SkillFeedbackProps> = ({ onSave }) => {
  const [activeTab, setActiveTab] = useState<Skill>('Structure Written');
  const [instructorSelections, setInstructorSelections] = useState<Record<Skill, string[]>>({
    'Structure Written': [],
    'Listening': [],
    'Reading': [],
  });

  const tabs: Skill[] = ['Structure Written', 'Listening', 'Reading'];

  const handleUnitSkillChange = (skill: string) => {
    const currentSelections = instructorSelections[activeTab];
    const newSelections = currentSelections.includes(skill)
      ? currentSelections.filter(s => s !== skill)
      : [...currentSelections, skill];

    setInstructorSelections({
      ...instructorSelections,
      [activeTab]: newSelections,
    });
  };

  const handleSave = () => {
    console.log('Feedback Disimpan:', instructorSelections);
    onSave(instructorSelections);
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg">
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap py-3 px-4 font-semibold text-sm rounded-t-lg transition-colors duration-200 focus:outline-none ${
                activeTab === tab
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-primary'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      <div className="space-y-8">
        {/* Student's Choices */}
        <div className="p-6 border border-gray-200 rounded-lg bg-gray-50">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Hal yang Ingin Dipahami Student</h3>
          <ul className="space-y-3">
            {skillData[activeTab].dipahami.map((item, index) => (
              <li key={index} className="flex items-center">
                <input
                  type="checkbox"
                  id={`student-${activeTab}-${index}`}
                  checked
                  disabled
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary disabled:opacity-75"
                />
                <label htmlFor={`student-${activeTab}-${index}`} className="ml-3 text-gray-600">{item}</label>
              </li>
            ))}
          </ul>
        </div>

        {/* Instructor's Recommendations */}
        <div className="p-6 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Unit Skill (Rekomendasi Instruktur)</h3>
          <ul className="space-y-3">
            {skillData[activeTab].unitSkill.map((item, index) => (
              <li key={index} className="flex items-center">
                <input
                  type="checkbox"
                  id={`instructor-${activeTab}-${index}`}
                  checked={instructorSelections[activeTab]?.includes(item)}
                  onChange={() => handleUnitSkillChange(item)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                />
                <label htmlFor={`instructor-${activeTab}-${index}`} className="ml-3 text-gray-700 cursor-pointer">{item}</label>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex justify-end mt-10">
        <button
          onClick={handleSave}
          className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg"
        >
          Simpan Feedback
        </button>
      </div>
    </div>
  );
};

export default SkillFeedback;

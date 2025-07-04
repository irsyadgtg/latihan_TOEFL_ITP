// src/components/SkillListView.tsx
import React from "react";

// PASTIKAN INTERFACE INI SAMA PERSIS DENGAN YANG ADA DI StudyPlanSubmissionCreate.tsx
interface SkillData {
  idSkill: number;
  kategori: string;
  skill: string;
  deskripsi: string; // Properti ini yang digunakan untuk teks skill
  created_at?: string;
  updated_at?: string;
}

// Interface props untuk komponen SkillListView
interface SkillListViewProps {
  label: string;
  activeTab: string; // Kategori yang sedang ditampilkan/dipilih (e.g., "Structure")
  skillOptions: Record<string, SkillData[]>; // Objek yang berisi skill per kategori
  skillStatus: Record<number, boolean>; // Status terpilih (true/false) untuk skillId di kategori yang sedang ditampilkan
  toggleSkill: (skillId: number) => void;
}

const SkillListView: React.FC<SkillListViewProps> = ({
  label,
  activeTab,
  skillOptions,
  skillStatus,
  toggleSkill,
}) => {
  // Mengambil daftar skill yang relevan berdasarkan activeTab dari skillOptions
  const currentSkills = skillOptions[activeTab] || [];

  return (
    <div>
      <h4 className="text-xl font-bold text-gray-700 mb-4">{label}</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentSkills.length > 0 ? (
          currentSkills.map((skill) => (
            <div
              key={skill.idSkill} // Menggunakan idSkill sebagai key
              className={`flex items-center p-3 rounded-md border cursor-pointer transition-colors duration-200 ${
                skillStatus[skill.idSkill]
                  ? "bg-[#A80532] text-white border-[#A80532]"
                  : "bg-white text-gray-800 border-gray-300 hover:bg-gray-50"
              }`}
              onClick={() => toggleSkill(skill.idSkill)} // Menggunakan idSkill untuk toggle
            >
              <input
                type="checkbox"
                checked={skillStatus[skill.idSkill] || false}
                onChange={() => toggleSkill(skill.idSkill)} // Menggunakan idSkill untuk onChange
                className="mr-3 h-5 w-5 text-[#A80532] focus:ring-[#A80532] border-gray-300 rounded"
              />
              <span className="text-sm">{skill.deskripsi}</span> {/* Menampilkan deskripsi skill */}
            </div>
          ))
        ) : (
          <p className="text-gray-500 col-span-full">Tidak ada skill yang tersedia untuk kategori ini.</p>
        )}
      </div>
    </div>
  );
};

export default SkillListView;
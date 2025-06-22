import React from "react";

interface SkillListViewProps {
  activeTab: string;
  skillOptions: Record<string, string[]>;
  skillStatus: Record<string, boolean>;
  label: string;
  toggleSkill: (index: number) => void;
}

const SkillListView: React.FC<SkillListViewProps> = ({
  activeTab,
  skillOptions,
  skillStatus,
  label,
  toggleSkill,
}) => {
  const skills = skillOptions[activeTab];

  return (
    <div className="">
      <h3 className="font-bold text-lg mb-4">
        Hal Ingin Yang Dipahami Student –{" "}
        <span className="text-[#5E5E5E]">{label}</span>
      </h3>
      {skills.map((skill, index) => {
        const key = `${activeTab}-${index}`;
        const isSelected = skillStatus[key] || false;

        return (
          <label
            key={key}
            className="flex items-center space-x-3 mb-2 cursor-pointer"
            onClick={() => toggleSkill(index)}
          >
            <span className="w-4 h-4 rounded-full border-2 flex items-center justify-center border-black">
              {isSelected && <div className="w-2 h-2 bg-black rounded-full" />}
            </span>
            <span className="text-sm">{skill}</span>
          </label>
        );
      })}
    </div>
  );
};

export default SkillListView;

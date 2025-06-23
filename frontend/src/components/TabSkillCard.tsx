import React, { useState } from "react";

const tabs = ["Reading", "Listening", "Structure Written"];

const skillOptions: Record<string, string[]> = {
  Reading: [
    "I can understand stated details in reading passages.",
    "I can identify the main idea of reading passages.",
    "I can make inferences based on reading passages.",
    "I can understand vocabulary in context in reading passages.",
    "I can determine the author's purpose in reading passages.",
    "I can identify tone and attitude of the author.",
    "I can answer questions about reference in reading passages.",
    "I can understand the organization of a reading passage.",
    "I can distinguish between fact and opinion in reading texts.",
    "I can evaluate arguments in reading passages.",
  ],
  Listening: [
    "I can identify the gist/topic of short and longer conversations",
    "I can explain advice/suggestions given in short conversations.",
    "I can predict what the speaker will probably do next in short conversations.",
    "I can make use of context to understand meaning in short conversations.",
    "I can infer unstated details of short conversations.",
    "I can identify stated details in longer conversations.",
    "I can identify unstated details in longer conversations.",
    "I can identify the gist in lectures.",
    "I can identify stated details in lectures.",
    "I can identify unstated details in lectures.",
  ],
  "Structure Written": [
    "I can answer questions related to the most frequently asked noun questions in TOEFL ITP",
    "I can answer questions related to the most frequently asked verb questions in TOEFL ITP",
    "I can answer questions related to the most frequently asked SV agreement questions in TOEFL ITP",
    "I can answer questions related to the most frequently asked adjective and adverb questions in TOEFL ITP",
    "I can answer questions related to the most frequently asked pronoun questions in TOEFL ITP",
    "I can answer questions related to the most frequently asked parallel structure questions in TOEFL ITP",
    "I can answer questions related to the most frequently asked simple and compound sentence questions in TOEFL ITP",
    "I can answer questions related to the most frequently asked complex sentence questions in TOEFL ITP",
    "I can answer questions related to the most frequently asked reduce clause questions in TOEFL ITP",
    "I can answer questions related to the most frequently asked preposition and word-choice questions in TOEFL ITP",
  ],
};

const TabSkillCard = () => {
  const [activeTab, setActiveTab] = useState("Reading");
  const [checkedSkills, setCheckedSkills] = useState<number[]>([]);

  const skills = skillOptions[activeTab];

  const toggleSkill = (index: number) => {
    if (checkedSkills.includes(index)) {
      setCheckedSkills(checkedSkills.filter((i) => i !== index));
    } else {
      setCheckedSkills([...checkedSkills, index]);
    }
  };

  return (
    <div className="mx-auto px-4 py-6">
      <div className="flex space-x-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setCheckedSkills([]);
            }}
            className={`px-4 py-2 rounded-full border transition ${
              activeTab === tab
                ? "bg-blue-600 text-white"
                : "bg-white border-gray-300 text-black"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Card 1 - Selected Items */}
      <div className="border border-black rounded-md p-4 mb-4">
        <h3 className="font-bold text-lg">
          Hal Ingin Yang Dipahami Student{" "}
          <span className="text-gray-500 font-normal">
            – Bagian {activeTab}
          </span>
        </h3>
        <ul className="mt-2 space-y-2">
          {skills.map((item, index) => (
            <li
              key={index}
              className="flex items-start gap-2 cursor-pointer"
              onClick={() => toggleSkill(index)}
            >
              <span
                className={`mt-1 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  checkedSkills.includes(index)
                    ? "border-blue-600"
                    : "border-gray-400"
                }`}
              >
                {checkedSkills.includes(index) && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full" />
                )}
              </span>
              <p className="text-sm">{item}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Card 2 - Unselected Items */}
      <div className="border rounded-md p-4">
        <h3 className="font-bold text-lg">
          Unit Skill{" "}
          <span className="text-gray-500 font-normal">
            – Bagian {activeTab}
          </span>
        </h3>
        <ul className="mt-2 space-y-2">
          {skills.map((item, index) => (
            <li key={index} className="flex items-start gap-2">
              <span
                className={`mt-1 w-4 h-4 rounded-full border-2 ${
                  checkedSkills.includes(index)
                    ? "border-gray-300"
                    : "border-gray-400"
                }`}
              />
              <p className="text-sm">{item}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TabSkillCard;

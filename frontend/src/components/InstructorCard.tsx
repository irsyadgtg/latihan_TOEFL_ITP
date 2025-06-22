import React from "react";

interface InstructorCardProps {
  image: string;
  name: string;
  skills: string;
  availability: string;
  selected: boolean;
  onClick: () => void;
}

const InstructorCard: React.FC<InstructorCardProps> = ({
  image,
  name,
  skills,
  availability,
  selected,
  onClick,
}) => {
  return (
    <div
      className={`box-border w-[231px] rounded-[10px] cursor-pointer transition-all duration-300 border p-3 ${
        selected
          ? "border-[#A80532] shadow-lg"
          : "border-black hover:shadow-md"
      }`}
      onClick={onClick}
    >
      <img
        src={image}
        alt={name}
        className="w-full h-auto rounded-md object-cover"
      />
      <div className="pt-4">
        <h3
          className={`font-semibold text-xl ${
            selected ? "text-[#A80532]" : "text-gray-900"
          }`}
        >
          {name}
        </h3>
        <p className="text-base text-gray-500 mt-2">{skills}</p>
        <p className="text-base text-gray-500 mt-1">{availability}</p>
      </div>
    </div>
  );
};

export default InstructorCard;

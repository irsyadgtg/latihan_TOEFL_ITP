import React from "react";

type InstructorCardProps = {
  image: string;
  name: string;
  skills: string;
  availability: string;
  selected?: boolean;
  onClick?: () => void;
};

const InstructorCard: React.FC<InstructorCardProps> = ({
  image,
  name,
  skills,
  availability,
  selected = false,
  onClick,
}) => {
  return (
    <div
      className={`rounded-lg border p-4 text-start shadow-sm transition duration-200 cursor-pointer ${
        selected ? "border-blue-500" : "border-gray-300 hover:border-blue-400"
      }`}
      onClick={onClick}
    >
      <div className="w-full h-auto mb-4">
        <img
          src={image}
          alt={name}
          className="w-full h-full rounded-lg object-cover"
        />
      </div>

      <h3 className="font-semibold text-lg">{name}</h3>
      <p className="text-sm text-gray-500">{skills}</p>
      <p className="text-sm text-gray-500">{availability}</p>
    </div>
  );
};

export default InstructorCard;

import React from 'react';

interface InstructorCardProps {
  avatarUrl: string;
  name: string;
  email: string;
  skills: string[];
}

const InstructorCard: React.FC<InstructorCardProps> = ({ avatarUrl, name, email, skills }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center text-center transition-transform transform hover:scale-105">
      <img 
        src={avatarUrl}
        alt={name}
        className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-gray-100"
      />
      <h3 className="text-xl font-bold text-gray-800">{name}</h3>
      <p className="text-gray-500 mb-4">{email}</p>
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {skills.map((skill) => (
          <span key={skill} className="bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded-full">
            {skill}
          </span>
        ))}
      </div>
      <button className="w-full bg-gray-800 text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-900 transition-colors duration-300">
        Lihat Detail
      </button>
    </div>
  );
};

export default InstructorCard;

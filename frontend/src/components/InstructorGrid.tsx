import React, { useState } from "react";
import InstructorCard from "./InstructorCard";

type Instructor = {
  image: string;
  name: string;
  skills: string;
  availability: string;
};

const dummyInstructors: Instructor[] = new Array(8).fill(null).map((_, i) => ({
  image: "/dumy.jpg",
  name: "Nama Instruktur",
  skills: "Keahlian",
  availability: "Waktu Ketersediaan",
}));

const InstructorGrid: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 ">
      {dummyInstructors.map((inst, index) => (
        <InstructorCard
          key={index}
          image={inst.image}
          name={inst.name}
          skills={inst.skills}
          availability={inst.availability}
          selected={index === selectedIndex}
          onClick={() => setSelectedIndex(index)}
        />
      ))}
    </div>
  );
};

export default InstructorGrid;

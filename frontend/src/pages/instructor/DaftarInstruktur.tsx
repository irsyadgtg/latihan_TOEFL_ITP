import React, { useState, useEffect } from 'react';
import InstructorCard from '../../components/InstructorCard';
import { useDashboardLayoutContext } from '../../layouts/DashboardLayout'; 
type Instructor = {
  image: string;
  name: string;
  skills: string;
  availability: string;
};

const dummyInstructors: Instructor[] = new Array(8).fill(null).map((_, i) => ({
  image: `/dumy.jpg`,
  name: `Nama Instruktur ${i + 1}`,
  skills: "Keahlian Utama",
  availability: "Waktu Ketersediaan",
}));

const DaftarInstruktur: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  
  const { setTitle, setSubtitle } = useDashboardLayoutContext();

  useEffect(() => {
    setTitle("Daftar Instruktur");
    setSubtitle("Pilih instruktur yang sesuai dengan kebutuhan Anda.");
  }, [setTitle, setSubtitle]);

  return (
    <div className="mt-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 ">
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
    </div>
  );
};

export default DaftarInstruktur;
import Layout from "../../layouts/AdminView";
import { useNavigate } from "react-router-dom";
import InstructorCard from "../../components/ui/card/InstructorCard";
import Card1 from "../../assets/image/card1.jpeg"; // ganti sesuai gambar kamu

// icons
import { Plus } from "lucide-react";


const instrukturList = [
    {
      name: "Instruktur A",
      image: Card1,
      skill: "Keahlian",
      waktu: "Selasa & Kamis, 13.00 - 17.00",
    },
    {
      name: "Instruktur A",
      image: Card1,
      skill: "Keahlian",
      waktu: "Selasa & Kamis, 13.00 - 17.00",
    },
    {
      name: "Instruktur A",
      image: Card1,
      skill: "Keahlian",
      waktu: "Selasa & Kamis, 13.00 - 17.00",
    },
    {
      name: "Instruktur A",
      image: Card1,
      skill: "Keahlian",
      waktu: "Selasa & Kamis, 13.00 - 17.00",
    },
    {
      name: "Instruktur A",
      image: Card1,
      skill: "Keahlian",
      waktu: "Selasa & Kamis, 13.00 - 17.00",
    },
    {
      name: "Instruktur A",
      image: Card1,
      skill: "Keahlian",
      waktu: "Selasa & Kamis, 13.00 - 17.00",
    },
    {
      name: "Instruktur A",
      image: Card1,
      skill: "Keahlian",
      waktu: "Selasa & Kamis, 13.00 - 17.00",
    },
    {
      name: "Instruktur A",
      image: Card1,
      skill: "Keahlian",
      waktu: "Selasa & Kamis, 13.00 - 17.00",
    }
  ];
export default function KelolaInstruktur() {
  

  const navigate = useNavigate();

  return (
    <Layout
      title="Kelola Instruktur"
      note="Melakukan mengelolaan data instruktur yang tersedia"
    >
      <div>
        <div className="flex justify-end">
          <button onClick={() => navigate("/tambahInstruktur")} className="flex p-2 items-center text-[18px] border border-blue-500 rounded-[10px] text-blue-500 hover:bg-blue-50">
            <Plus />
            <span>Tambah Instruktur</span>
          </button>
        </div>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {instrukturList.map((instruktur, index) => (
            <InstructorCard key={index} {...instruktur} />
          ))}
        </div>
      </div>
    </Layout>
  );
}

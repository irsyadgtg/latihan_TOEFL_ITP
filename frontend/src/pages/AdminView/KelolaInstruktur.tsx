import { useNavigate } from "react-router-dom";
import InstructorCard from "../../components/ui/card/InstructorCard";
import Card1 from "../../assets/image/card1.jpeg"; // ganti sesuai gambar kamu
import { useEffect } from "react"; // Import useEffect
import { useDashboardLayoutContext } from '../../layouts/DashboardLayout'; // Import context DashboardLayout

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

  // Ambil setter dari context DashboardLayout
  const { setTitle, setSubtitle } = useDashboardLayoutContext();

  // Gunakan useEffect untuk mengatur judul saat komponen dimuat
  useEffect(() => {
    setTitle("Kelola Instruktur"); // Judul untuk halaman Kelola Instruktur
    setSubtitle("Tambah dan kelola data instruktur."); // Subjudul yang relevan
    
    // Opsional: Cleanup function jika Anda ingin mengatur ulang judul saat komponen unmount
    // return () => {
    //   setTitle(""); 
    //   setSubtitle("");
    // };
  }, [setTitle, setSubtitle]); // Pastikan dependensi dimasukkan

  return (
    <div className="mt-4"> {/* Tambahkan mt-4 jika perlu margin atas */}
      <div className="flex justify-end mb-4"> {/* Tambahkan mb-4 untuk jarak dengan grid */}
        <button onClick={() => navigate("/admin/kelola-instruktur/tambah")} className="flex p-2 items-center text-[18px] border border-blue-500 rounded-[10px] text-blue-500 hover:bg-blue-50">
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
  );
}
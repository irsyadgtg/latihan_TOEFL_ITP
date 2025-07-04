import { useNavigate } from "react-router-dom"; // useNavigate mungkin tidak diperlukan lagi jika tidak ada navigasi dari card ini
// Hapus import useState, BadgeCheck, Trash2 karena tidak digunakan lagi
// import { useState } from "react";
// import { BadgeCheck, Trash2 } from "lucide-react"; 

// Hapus komponen DeleteConfirmationModal karena tombol hapus tidak ada lagi
// function DeleteConfirmationModal({ isOpen, onClose, onConfirm }: { isOpen: boolean; onClose: () => void; onConfirm: () => void; }) {
//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
//       <div className="bg-white rounded-xl shadow-lg p-20 text-center w-[30rem] h-[18rem] space-y-10">
//         <h2 className="text-[26px] text-gray-600 font-semibold -mt-6">
//           Apakah anda ingin menghapus data?
//         </h2>
//         <div className="flex justify-center gap-10">
//           <button
//             onClick={onClose}
//             className="px-10 py-2 text-[26px] rounded-xl text-gray-600 font-semibold hover:bg-gray-100"
//           >
//             Tidak
//           </button>
//           <button
//             onClick={onConfirm}
//             className="px-10 py-2 text-[26px] rounded-xl bg-secondary font-semibold hover:bg-secondary/80 duration-200 text-white "
//           >
//             Ya
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// PERBAIKAN: Ubah props 'waktu' menjadi 'availability' dan tambahkan 'selected' dan 'onClick'
export default function InstructorCard({
  image,
  name,
  skill,
  availability, // PERBAIKAN: Menggunakan prop 'availability'
  selected,     // Props untuk menandai kartu terpilih
  onClick       // Props untuk handle klik pada kartu
}: {
  image: string;
  name: string;
  skill: string;
  availability: string; // PERBAIKAN: Menggunakan prop 'availability'
  selected: boolean;
  onClick: () => void;
}) {
  // useNavigate tidak diperlukan jika tidak ada navigasi langsung dari card
  // const navigate = useNavigate(); 
  // showModal dan handleDelete tidak diperlukan karena tombol hapus dihapus
  // const [showModal, setShowModal] = useState(false);
  // const handleDelete = () => {
  //   console.log("Data dihapus!");
  //   setShowModal(false);
  // };

  return (
    <div 
      className={`w-full border rounded-xl shadow-sm p-4 flex flex-col items-stretch text-justify cursor-pointer transition-all duration-200 
                 ${selected ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-200 hover:border-gray-300'}`}
      onClick={onClick} // Tambahkan onClick handler
    >
      <img
        src={image}
        alt={name}
        className="w-full object-cover rounded-md mb-4 self-center" // Tambahkan rounded-md untuk gambar
      />

      <div className="text-justify flex-grow"> {/* flex-grow agar konten mengisi ruang */}
        <h2 className="text-[20px] font-semibold flex items-center gap-1">
          {name}
          {/* Hapus BadgeCheck (ikon verifikasi) */}
          {/* <BadgeCheck className="w-6 h-6 text-green-500" /> */}
        </h2>
        <p className="text-[16px] text-gray-500">{skill}</p>
        <p className="text-[16px] text-gray-500">{availability}</p> {/* PERBAIKAN: Menggunakan 'availability' */}
      </div>

      {/* Hapus button aksi (Ubah Ketersediaan dan Hapus) */}
      {/* <div className="mt-4 flex gap-2">
        <button
          onClick={() => navigate("/admin/kelola-instruktur/ubah-ketersediaan")}
          className="text-sm border border-blue-500 text-blue-500 px-3 py-1 rounded hover:bg-blue-50"
        >
          Ubah Ketersediaan
        </button>
        <button
          onClick={() => setShowModal(true)}
          className="text-sm text-center border border-red-500 text-red-500 px-3 py-1 rounded hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div> */}

      {/* Hapus popup konfirmasi */}
      {/* <DeleteConfirmationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleDelete}
      /> */}
    </div>
  );
}
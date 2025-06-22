import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { BadgeCheck, Trash2 } from "lucide-react"; // icons

// konfirmasi hapus
function DeleteConfirmationModal({ isOpen, onClose, onConfirm }: { isOpen: boolean; onClose: () => void; onConfirm: () => void; }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-20 text-center w-[30rem] h-[18rem] space-y-10">
        <h2 className="text-[26px] text-gray-600 font-semibold -mt-6">
          Apakah anda ingin menghapus data?
        </h2>
        <div className="flex justify-center gap-10">
          <button
            onClick={onClose}
            className="px-10 py-2 text-[26px] rounded-xl text-gray-600 font-semibold hover:bg-gray-100"
          >
            Tidak
          </button>
          <button
            onClick={onConfirm}
            className="px-10 py-2 text-[26px] rounded-xl bg-secondary font-semibold hover:bg-secondary/80 duration-200 text-white "
          >
            Ya
          </button>
        </div>
      </div>
    </div>
  );
}

export default function InstructorCard({ image, name, skill, waktu }: { image: string; name: string; skill: string; waktu: string; }) {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const handleDelete = () => {
    console.log("Data dihapus!");
    // logika delete
    setShowModal(false);
  };

  return (
    <div className="w-full border border-primary rounded-xl shadow-sm p-4 flex flex-col items-stretch text-justify">
      <img
        src={image}
        alt={name}
        className="w-full object-cover mb-4 self-center"
      />

      <div className="text-justify">
        <h2 className="text-[20px] font-semibold flex items-center gap-1">
          {name}
          <BadgeCheck className="w-6 h-6 text-green-500" />
        </h2>
        <p className="text-[16px] text-gray-500">{skill}</p>
        <p className="text-[16px] text-gray-500">{waktu}</p>
      </div>

      {/* button aksi */}
      <div className="mt-4 flex gap-2">
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
      </div>

      {/* popup konfirmasi */}
      <DeleteConfirmationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

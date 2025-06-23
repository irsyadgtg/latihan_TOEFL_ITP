import React, { useEffect, useState } from "react";
import { useDashboardLayoutContext } from "../../layouts/DashboardLayout";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import ConfirmationPaymentModal from "../../components/ConfirmPaymentModal"; 

const SubscribeForm: React.FC = () => {
  const { setTitle, setSubtitle } = useDashboardLayoutContext();
  const navigate = useNavigate();

  const [approvalStatus, setApprovalStatus] = useState<
    "pending" | "approved" | "rejected"
  >("approved");
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // --- Anda bisa menambahkan state untuk paket yang dipilih di sini jika dinamis ---
  // const [selectedPackage, setSelectedPackage] = useState({
  //   name: "TOEFL ITP Preparation",
  //   price: 250000,
  //   // ... data lain yang relevan untuk konfirmasi pembayaran
  // });

  useEffect(() => {
    setTitle("");
    setSubtitle("");
    // Simulasi ambil status dari API
    setApprovalStatus("approved");
  }, [setTitle, setSubtitle]); // Tambahkan setTitle, setSubtitle ke dependency array

  const isDisabled = approvalStatus !== "approved";

  return (
    <div>
      {/* Header */}
      <div className="flex gap-2">
        <button onClick={() => navigate(-1)}>
          <IoArrowBackCircleOutline size={25} color="red" />
        </button>
        <div>
          <h3 className="text-[#A80532] font-bold text-lg">
            Berlangganan Paket Kursus
          </h3>
          <p className="text-[#8E8E8E] text-sm">
            paket kursus untuk disediakan kepada peserta
          </p>
        </div>
      </div>

      {/* Form */}
      <form className="space-y-4 mt-4">
        <div>
          <label className="block font-semibold mb-1">Nama Paket</label>
          <input
            type="text"
            value="TOEFL ITP Preparation" 
            readOnly
            className="w-full border border-gray-400 rounded-md px-3 py-2 text-sm bg-transparent"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Harga</label>
          <input
            type="text"
            value="Rp250.000" 
            readOnly
            className="w-full border border-gray-400 rounded-md px-3 py-2 text-sm bg-transparent"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Fasilitas</label>
          <input
            type="text"
            value="Tersedia modul belajar, belajar per materi, dan bisa melakukan konsultasi dengan instruktur"
            readOnly
            className="w-full border border-gray-400 rounded-md px-3 py-2 text-sm bg-transparent"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">
            Ketentuan Paket Kursus (Masa Berlaku Paket Kursus)
          </label>
          <input
            type="text"
            value="20-09-2025" 
            readOnly
            className="w-full border border-gray-400 rounded-md px-3 py-2 text-sm bg-transparent"
          />
        </div>

        <div className="text-right">
          <button
            type="button"
            disabled={isDisabled}
            onClick={() => setShowPaymentModal(true)}
            className={`px-6 py-2 rounded-md font-semibold transition ${
              isDisabled
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-yellow-400 hover:bg-yellow-500 text-white" // Warna tombol beli
            }`}
          >
            Beli
          </button>
          {isDisabled && (
            <p className="text-xs text-red-500 mt-1 text-left">
              Anda belum mendapatkan persetujuan rencana belajar.
            </p>
          )}
        </div>
      </form>

      {/* Modal */}
      {showPaymentModal && (
        <ConfirmationPaymentModal
          onClose={() => setShowPaymentModal(false)}
          // --- Hapus prop 'onSelect' karena tidak digunakan oleh ConfirmationPaymentModal ---
          // --- Anda bisa meneruskan data paket ke modal di sini jika perlu ---
          // Misalnya:
          // packageName={selectedPackage.name}
          // amount={selectedPackage.price}
          // bankName="..."
          // accountNumber="..."
          // accountHolder="..."
        />
      )}
    </div>
  );
};

export default SubscribeForm;
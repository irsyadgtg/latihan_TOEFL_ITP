import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

interface ConfirmationPaymentModalProps {
  onClose: () => void;
  // ... props lainnya
}

const ConfirmationPaymentModal: React.FC<ConfirmationPaymentModalProps> = ({
  onClose,
}) => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleUploadButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = () => {
    console.log("Mengirim konfirmasi pembayaran...");
    console.log("File bukti pembayaran:", selectedFile);

    // TODO: Implementasi logika kirim data ke backend
    navigate("/student/langganan/riwayat");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-lg">
        <h2 className="text-lg font-bold text-center text-gray-800 mb-4">
          Konfirmasi Pembayaran
        </h2>

        <div className="space-y-4">
          {/* Informasi Pembayaran */}
          <div>
            <p className="text-md font-semibold text-red-600 mb-2">
              Informasi Pembayaran
            </p>
            <div className="text-sm text-gray-700 space-y-1">
              <p>
                <span className="font-medium">Nama Paket:</span> TOEFL ITP Preparation
              </p>
              <p>
                <span className="font-medium">Harga:</span> Rp. 250.000
              </p>
              <p>
                <span className="font-medium">Bank:</span> Mandiri
              </p>
              <p>
                <span className="font-medium">Nomor Rekening:</span> 1234567890
              </p>
              <p>
                <span className="font-medium">Nama Rekening:</span> TOEFL LaC
              </p>
            </div>
          </div>

          {/* Unggah Bukti Pembayaran */}
          <div className="mt-4">
            <p className="text-md font-semibold text-gray-800 mb-2">
              Unggah Bukti Pembayaran
            </p>
            {/* Input file tersembunyi */}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="hidden"
            />

            {/* Kontainer untuk tombol Unggah dan teks "No file chosen" */}
            <div className="flex items-center border border-gray-300 rounded-md py-2 px-3">
              <button
                type="button"
                onClick={handleUploadButtonClick}
                className="bg-[#0B6DFF] text-white rounded-full px-6 py-2 font-semibold text-sm mr-2"
              >
                Unggah
              </button>
              <span className="text-sm text-gray-700">
                {selectedFile ? selectedFile.name : "No file chosen"}
              </span>
            </div>
          </div>
        </div>

        {/* Tombol Submit */}
        <button
          onClick={handleSubmit}
          className="mt-6 w-full py-3 bg-yellow-400 text-white font-semibold rounded-md hover:bg-yellow-500 transition-colors"
        >
          submit
        </button>

        <button
          onClick={onClose}
          className="mt-4 w-full py-2 text-sm text-gray-500 hover:underline"
        >
          Batal
        </button>
      </div>
    </div>
  );
};

export default ConfirmationPaymentModal;
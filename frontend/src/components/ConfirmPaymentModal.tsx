import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../services/axios";
import { AxiosError } from "axios";

// Definisikan interface untuk props ConfirmationPaymentModal
interface ConfirmationPaymentModalProps {
  onClose: () => void;
  packageName: string;
  amount: number;
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
  packageId: number; // ✅ Tambahkan prop ini
}

const ConfirmationPaymentModal: React.FC<ConfirmationPaymentModalProps> = ({
  onClose,
  packageName,
  amount,
  bankName = "Mandiri", // Default jika tidak diberikan
  accountNumber = "1234567890", // Default jika tidak diberikan
  accountHolder = "TOEFL LaC", // Default jika tidak diberikan
  packageId, // ✅ Destrukturisasi prop ini
}) => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null);
    }
    setError(null);
  };

  const handleUploadButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError("Mohon unggah bukti pembayaran.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append("package_name", packageName);
    formData.append("amount", amount.toString());
    formData.append("bank_name", bankName);
    formData.append("account_number", accountNumber);
    formData.append("account_holder", accountHolder);
    formData.append("buktiPembayaran", selectedFile); // ✅ Sesuaikan nama field dengan yang diharapkan backend

    try {
      // ✅ Gunakan packageId di endpoint untuk upload bukti pembayaran
      const response = await axiosInstance.post(`/paket/${packageId}/beli`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log("Konfirmasi pembayaran berhasil:", response.data);
      setSuccess("Konfirmasi pembayaran berhasil dikirim!");
      setTimeout(() => {
        onClose();
        navigate("/student/langganan/riwayat");
      }, 1500);

    } catch (err) {
      console.error("Gagal mengirim konfirmasi pembayaran:", err);
      if (err instanceof AxiosError) {
        if (err.response) {
          if (err.response.status === 401 && (err.response.data as any)?.message === 'Unauthenticated.') {
            setError("Sesi Anda telah berakhir. Silakan login kembali.");
            localStorage.removeItem('AuthToken'); // Hapus token agar memaksa login
            navigate('/login');
          } else if (err.response.data && (err.response.data as any)?.message) {
            setError((err.response.data as any).message);
          } else {
            setError(`Terjadi kesalahan: ${err.response.status} ${err.response.statusText || 'Error'}`);
          }
        } else if (err.request) {
          setError("Tidak dapat terhubung ke server. Periksa koneksi Anda.");
        } else {
          setError("Terjadi kesalahan tak terduga.");
        }
      } else {
        setError("Terjadi kesalahan tidak dikenal.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-lg">
        <h2 className="text-lg font-bold text-center text-gray-800 mb-4">
          Konfirmasi Pembayaran
        </h2>

        {loading && (
          <div className="text-center text-blue-600 mb-4">Mengirim konfirmasi...</div>
        )}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative text-sm mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded relative text-sm mb-4">
            {success}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <p className="text-md font-semibold text-red-600 mb-2">
              Informasi Pembayaran
            </p>
            <div className="text-sm text-gray-700 space-y-1">
              <p>
                <span className="font-medium">Nama Paket:</span> {packageName}
              </p>
              <p>
                <span className="font-medium">Harga:</span> Rp. {amount.toLocaleString('id-ID')}
              </p>
              <p>
                <span className="font-medium">Bank:</span> {bankName}
              </p>
              <p>
                <span className="font-medium">Nomor Rekening:</span> {accountNumber}
              </p>
              <p>
                <span className="font-medium">Nama Rekening:</span> {accountHolder}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-md font-semibold text-gray-800 mb-2">
              Unggah Bukti Pembayaran
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="hidden"
            />
            <div className="flex items-center border border-gray-300 rounded-md py-2 px-3">
              <button
                type="button"
                onClick={handleUploadButtonClick}
                className="bg-[#0B6DFF] text-white rounded-full px-6 py-2 font-semibold text-sm mr-2"
                disabled={loading}
              >
                Unggah
              </button>
              <span className="text-sm text-gray-700">
                {selectedFile ? selectedFile.name : "No file chosen"}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className={`mt-6 w-full py-3 font-semibold rounded-md transition-colors ${
            loading
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-yellow-400 hover:bg-yellow-500 text-white"
          }`}
          disabled={loading || !selectedFile}
        >
          {loading ? "Mengirim..." : "Submit"}
        </button>

        <button
          onClick={onClose}
          className="mt-4 w-full py-2 text-sm text-gray-500 hover:underline"
          disabled={loading}
        >
          Batal
        </button>
      </div>
    </div>
  );
};

export default ConfirmationPaymentModal;
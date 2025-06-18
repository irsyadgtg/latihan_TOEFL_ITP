import React from "react";
import { useNavigate } from "react-router-dom";

interface PaymentMethodModalProps {
  onClose: () => void;
  onSelect: (method: string) => void;
}

const PaymentMethodModal: React.FC<PaymentMethodModalProps> = ({
  onClose,
  onSelect,
}) => {
  const navigate = useNavigate();
  const processPayment = () => {
    navigate("/student/langganan/riwayat");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-lg">
        <h2 className="text-lg font-bold text-center text-gray-800">
          Pilih Metode Pembayaran
        </h2>

        <div className="mt-4 space-y-4">
          <div>
            <p className="text-sm font-semibold text-gray-600 mb-2">
              Transfer Bank
            </p>
            <button
              onClick={() => processPayment()}
              className="flex items-center justify-between w-full border px-4 py-3 rounded-md hover:bg-gray-100"
            >
              <div className="flex items-center gap-2">
                <img src="/mandiri.png" alt="Mandiri" className="w-6 h-6" />
                <span className="text-sm font-medium">Bank Mandiri</span>
              </div>
              <span>›</span>
            </button>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-600 mb-2">E-Wallet</p>
            <button
              onClick={() => processPayment()}
              className="flex items-center justify-between w-full border px-4 py-3 rounded-md hover:bg-gray-100"
            >
              <div className="flex items-center gap-2">
                <img src="/gopay.png" alt="Gopay" className="w-6 h-6" />
                <span className="text-sm font-medium">Gopay</span>
              </div>
              <span>›</span>
            </button>
            <button
              onClick={() => processPayment()}
              className="flex items-center justify-between w-full border px-4 py-3 rounded-md hover:bg-gray-100 mt-2"
            >
              <div className="flex items-center gap-2">
                <img src="/shopeepay.png" alt="ShopeePay" className="w-6 h-6" />
                <span className="text-sm font-medium">ShopeePay</span>
              </div>
              <span>›</span>
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-2 text-sm text-gray-500 hover:underline"
        >
          Batal
        </button>
      </div>
    </div>
  );
};

export default PaymentMethodModal;

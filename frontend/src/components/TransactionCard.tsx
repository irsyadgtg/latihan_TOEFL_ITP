import React from "react";

interface Transaction {
  id: string;
  courseName: string;
  timestamp: string;
  paymentMethod: string;
  amount: string;
  status: string;
  notes?: string;
}

interface TransactionCardProps {
  data: Transaction;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "berhasil":
      return "text-green-600";
    case "gagal":
      return "text-red-600";
    case "pending":
      return "text-yellow-500";
    default:
      return "text-gray-700";
  }
};

const TransactionCard: React.FC<TransactionCardProps> = ({ data }) => {
  return (
    <div className="border border-gray-300 rounded-lg shadow-sm mb-4">
      <div className="flex gap-6 px-4 py-3 text-sm text-gray-800 min-w-[950px] whitespace-nowrap">
        <div className="min-w-[120px]">
          <p className="text-gray-500">ID Transaksi</p>
          <p className="font-medium">{data.id}</p>
        </div>
        <div className="min-w-[280px]">
          <p className="text-gray-500">Nama Paket Kursus</p>
          <p className="font-medium">{data.courseName}</p>
        </div>
        <div className="min-w-[160px]">
          <p className="text-gray-500">Timestamp</p>
          <p className="font-medium">{data.timestamp}</p>
        </div>
        <div className="min-w-[200px]">
          <p className="text-gray-500">Metode Pembayaran</p>
          <p className="font-medium">{data.paymentMethod}</p>
        </div>
        <div className="min-w-[120px]">
          <p className="text-gray-500">Jumlah</p>
          <p className="font-medium">{data.amount}</p>
        </div>
        <div className="min-w-[120px]">
          <p className="text-gray-500">Status</p>
          <p className={`font-semibold ${getStatusColor(data.status)}`}>
            {data.status}
          </p>
        </div>
        <div className="min-w-[200px]">
          <p className="text-gray-500 ">Keterangan</p>
          <p className="font-medium ">{data.notes || "-"}</p>
        </div>
      </div>
    </div>
  );
};

export default TransactionCard;

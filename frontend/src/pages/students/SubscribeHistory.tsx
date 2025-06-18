// src/pages/student/StudentDashboard.tsx
import React, { useEffect } from "react";
import { useStudentLayoutContext } from "../../layouts/StudentLayout";
import TransactionCard from "../../components/TransactionCard";

const SubscribeHistory: React.FC = () => {
  const dummyData = [
    {
      id: "12345",
      courseName: "TOEFL ITP~Free",
      timestamp: "08:00 ~ 10/04/2025",
      paymentMethod: "Transfer Mandiri",
      amount: "Rp100.000",
      status: "Berhasil",
      notes: "-",
    },
    {
      id: "12346",
      courseName: "TOEFL ITP~6 Bulan",
      timestamp: "09:30 ~ 12/04/2025",
      paymentMethod: "Gopay",
      amount: "Rp250.000",
      status: "Berhasil",
      notes: "Voucher digunakan",
    },
    {
      id: "12347",
      courseName: "TOEFL ITP~3 Bulan",
      timestamp: "10:15 ~ 14/04/2025",
      paymentMethod: "ShopeePay",
      amount: "Rp180.000",
      status: "Gagal",
      notes: "Saldo tidak cukup",
    },
    {
      id: "12348",
      courseName: "IELTS Preparation",
      timestamp: "11:00 ~ 16/04/2025",
      paymentMethod: "Transfer Mandiri",
      amount: "Rp300.000",
      status: "Berhasil",
      notes: "-",
    },
    {
      id: "12349",
      courseName: "TOEIC Basic",
      timestamp: "13:00 ~ 18/04/2025",
      paymentMethod: "Gopay",
      amount: "Rp200.000",
      status: "Diproses",
      notes: "Menunggu konfirmasi",
    },
    {
      id: "12350",
      courseName: "TOEFL ITP~Free",
      timestamp: "15:00 ~ 20/04/2025",
      paymentMethod: "ShopeePay",
      amount: "Rp100.000",
      status: "Berhasil",
      notes: "-",
    },
    {
      id: "12351",
      courseName: "TOEFL ITP~1 Bulan",
      timestamp: "08:00 ~ 22/04/2025",
      paymentMethod: "Transfer Mandiri",
      amount: "Rp120.000",
      status: "Gagal",
      notes: "Rekening tidak ditemukan",
    },
    {
      id: "12352",
      courseName: "IELTS Pro",
      timestamp: "14:30 ~ 24/04/2025",
      paymentMethod: "Gopay",
      amount: "Rp320.000",
      status: "Berhasil",
      notes: "-",
    },
    {
      id: "12353",
      courseName: "TOEIC Intermediate",
      timestamp: "17:00 ~ 26/04/2025",
      paymentMethod: "Transfer Mandiri",
      amount: "Rp210.000",
      status: "Diproses",
      notes: "Sedang diverifikasi",
    },
    {
      id: "12354",
      courseName: "TOEFL ITP~6 Bulan",
      timestamp: "19:00 ~ 28/04/2025",
      paymentMethod: "ShopeePay",
      amount: "Rp100.000",
      status: "Berhasil",
      notes: "-",
    },
  ];

  const { setTitle, setSubtitle } = useStudentLayoutContext();

  useEffect(() => {
    setTitle("Riwayat Pembayaran");
    setSubtitle("Berisi data pembayaran yang anda lakukan sebelumnya");
  }, []);

  return (
    <div className="space-y-3   overflow-x-auto">
      {dummyData.map((tx, idx) => (
        <TransactionCard key={idx} data={tx} />
      ))}
    </div>
  );
};

export default SubscribeHistory;

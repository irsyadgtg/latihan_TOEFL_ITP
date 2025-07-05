import React, { useEffect, useState } from "react";
import { useDashboardLayoutContext } from "../../layouts/DashboardLayout";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import { useNavigate, useParams } from "react-router-dom"; // Import useParams
import ConfirmationPaymentModal from "../../components/ConfirmPaymentModal";
import axios from "axios";
import axiosInstance from "../../services/axios";

// Definisikan interface untuk struktur data Paket Kursus dari API
interface CoursePackageData {
  id: number;
  nama_paket: string;
  harga: string;
  fasilitas: string;
  masa_berlaku: string;
  bank_name?: string; // Akan diisi dari endpoint /beli
  account_number?: string; // Akan diisi dari endpoint /beli
  account_holder?: string; // Akan diisi dari endpoint /beli
}

// Interface untuk respons dari endpoint eligibility
interface EligibilityResponse {
  is_eligible: boolean; // Menambahkan ini agar lebih eksplisit, sesuaikan jika backend hanya mengirim 'message'
  message: string;
}

// Interface untuk respons dari endpoint beliPaketInfo
interface PaymentInfoResponse {
  message: string;
  nama_paket: string;
  harga: string; // Bisa juga number, sesuaikan dengan backend
  bank: string;
  nomor_rekening: string;
  nama_rekening: string;
}

const SubscribeForm: React.FC = () => {
  const { setTitle, setSubtitle } = useDashboardLayoutContext();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); // Ambil ID dari URL

  const [packageId, setPackageId] = useState<number>(() => {
    // Pastikan ID valid, default ke 1 jika tidak ada/invalid
    const parsedId = parseInt(id || "1");
    return isNaN(parsedId) ? 1 : parsedId;
  });

  const [approvalStatus, setApprovalStatus] = useState<
    "pending" | "approved" | "rejected" | "not_checked"
  >("not_checked");

  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const [coursePackage, setCoursePackage] = useState<CoursePackageData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [eligibilityMessage, setEligibilityMessage] = useState<string | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<{
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    amount: number;
    packageName: string;
  } | null>(null);

  useEffect(() => {
    setTitle("Berlangganan Paket Kursus");
    setSubtitle("Paket kursus untuk disediakan kepada peserta");

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setEligibilityMessage(null);

      try {
        // 1. Ambil detail paket
        const packageResponse = await axiosInstance.get<CoursePackageData>(`/paket/${packageId}`);
        setCoursePackage(packageResponse.data);

        // 2. Cek eligibility
        const eligibilityResponse = await axiosInstance.get<EligibilityResponse>(
          `/paket/${packageId}/eligibility`
        );

        if ((eligibilityResponse.data as any).message === 'Eligible untuk membeli paket kursus ini. Silakan upload bukti pembayaran.') {
          setApprovalStatus("approved");
          setEligibilityMessage(eligibilityResponse.data.message);

          // Jika eligible, ambil informasi pembayaran
          const paymentInfoRes = await axiosInstance.get<PaymentInfoResponse>(
            `/paket/${packageId}/beli`
          );
          setPaymentInfo({
            bankName: paymentInfoRes.data.bank,
            accountNumber: paymentInfoRes.data.nomor_rekening,
            accountHolder: paymentInfoRes.data.nama_rekening,
            amount: parseFloat(paymentInfoRes.data.harga),
            packageName: paymentInfoRes.data.nama_paket,
          });
        } else {
          setApprovalStatus("rejected");
          setEligibilityMessage(eligibilityResponse.data.message);
        }
      } catch (err: unknown) {
        console.error("Failed to fetch data for subscription form:", err);
        if (axios.isAxiosError(err)) {
          if (err.response) {
            if (err.response.status === 401 && (err.response.data as any)?.message === 'Unauthenticated.') {
              setError("Sesi Anda telah berakhir. Silakan login kembali.");
              localStorage.removeItem('AuthToken');
              navigate('/login');
            } else if (err.response?.status === 404) {
              setError("Paket kursus tidak ditemukan.");
            } else if (err.response.data && typeof err.response.data === 'object' && 'message' in err.response.data) {
              setError(err.response.data.message as string);
            } else {
              setError(`Terjadi kesalahan: ${err.response.status} ${err.response.statusText || 'Error'}`);
            }
          } else if (err.request) {
            setError("Tidak dapat terhubung ke server. Pastikan koneksi internet Anda aktif atau server sedang berjalan.");
          } else {
            setError("Terjadi kesalahan saat mengatur permintaan. Silakan coba lagi.");
          }
        } else {
          setError("Terjadi kesalahan tidak terduga.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [setTitle, setSubtitle, packageId, navigate]); // Tambahkan id ke dependency array

  const isDisabled = approvalStatus !== "approved";

  if (loading) {
    return (
      <div className="mt-4 p-6 rounded-lg bg-white text-center text-gray-600">
        Memuat data paket kursus...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-4 p-6 rounded-lg bg-red-100 border border-red-400 text-red-700 text-center">
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  if (!coursePackage) {
    return (
      <div className="mt-4 p-6 rounded-lg bg-white text-center text-gray-500">
        Tidak ada paket kursus yang tersedia saat ini.
      </div>
    );
  }

  return (
    <div>
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

      <form className="space-y-4 mt-4">
        <div>
          <label className="block font-semibold mb-1">Nama Paket</label>
          <input
            type="text"
            value={coursePackage.nama_paket}
            readOnly
            className="w-full border border-gray-400 rounded-md px-3 py-2 text-sm bg-transparent"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Harga</label>
          <input
            type="text"
            value={`Rp${parseFloat(coursePackage.harga).toLocaleString('id-ID')}`}
            readOnly
            className="w-full border border-gray-400 rounded-md px-3 py-2 text-sm bg-transparent"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Fasilitas</label>
          <input
            type="text"
            value={coursePackage.fasilitas}
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
            value={coursePackage.masa_berlaku}
            readOnly
            className="w-full border border-gray-400 rounded-md px-3 py-2 text-sm bg-transparent"
          />
        </div>

        {paymentInfo && ( // Tampilkan info pembayaran dari paymentInfo state
          <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">Informasi Pembayaran</h4>
            <p className="text-sm text-blue-700">
              Bank: {paymentInfo.bankName} <br />
              Nomor Rekening: {paymentInfo.accountNumber} <br />
              Atas Nama: {paymentInfo.accountHolder}
            </p>
            <p className="text-xs text-blue-600 mt-2">
              Mohon lakukan pembayaran sesuai harga paket ke rekening di atas.
            </p>
          </div>
        )}

        <div className="text-right">
          <button
            type="button"
            disabled={isDisabled || !paymentInfo} // Disable juga jika info pembayaran belum tersedia
            onClick={() => setShowPaymentModal(true)}
            className={`px-6 py-2 rounded-md font-semibold transition ${
              isDisabled || !paymentInfo
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-yellow-400 hover:bg-yellow-500 text-white"
            }`}
          >
            Beli
          </button>
          {/* Tampilkan pesan kelayakan jika tidak eligible */}
          {isDisabled && eligibilityMessage && (
            <p className="text-xs text-red-500 mt-1 text-left">
              {eligibilityMessage}
            </p>
          )}
          {isDisabled && !eligibilityMessage && ( // Fallback jika pesan kelayakan tidak ada
            <p className="text-xs text-red-500 mt-1 text-left">
              Anda tidak dapat membeli paket ini. Mohon lengkapi persyaratan.
            </p>
          )}
        </div>
      </form>

      {showPaymentModal && paymentInfo && ( // Pastikan paymentInfo tersedia sebelum membuka modal
        <ConfirmationPaymentModal
          onClose={() => setShowPaymentModal(false)}
          packageName={paymentInfo.packageName}
          amount={paymentInfo.amount}
          bankName={paymentInfo.bankName}
          accountNumber={paymentInfo.accountNumber}
          accountHolder={paymentInfo.accountHolder}
          packageId={packageId} // Teruskan packageId ke modal
        />
      )}
    </div>
  );
};

export default SubscribeForm;
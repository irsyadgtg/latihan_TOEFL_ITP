// src/pages/student/SubscribeForm.tsx
import React, { useEffect, useState, useCallback } from "react";
import { useDashboardLayoutContext } from "../../layouts/DashboardLayout";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import { useNavigate, useParams }
from "react-router-dom";
import ConfirmationPaymentModal from "../../components/ConfirmPaymentModal";
import axios from "axios";
import axiosInstance from "../../services/axios"; 

// Interface CoursePackageData (SUDAH SESUAI DENGAN RESPON API YANG ANDA BERIKAN)
interface CoursePackageData {
  idPaketKursus: number;
  namaPaket: string;
  harga: string;
  fasilitas: string;
  masaBerlaku: number;
  aktif: number;
  idPegawai: number;
  created_at: string;
  updated_at: string;
  pegawai?: {
    idPegawai: number;
    namaLengkap: string;
  };
}

interface EligibilityResponse {
  is_eligible: boolean;
  message: string; // Backend HARUS mengirim pesan spesifik di sini
}

interface PaymentInfoResponse {
  message: string;
  // HATI-HATI: Pastikan API /beli mengembalikan "nama_paket" atau "namaPaket".
  // Sesuaikan jika perlu.
  nama_paket: string; 
  harga: string;
  bank: string;
  nomor_rekening: string;
  nama_rekening: string;
}

const SubscribeForm: React.FC = () => {
  const { setTitle, setSubtitle } = useDashboardLayoutContext();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); 

  const [packageId, setPackageId] = useState<number | null>(null); 

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
    const parsedId = parseInt(id || ""); 
    
    if (!isNaN(parsedId) && parsedId > 0) {
      setPackageId(parsedId);
    } else {
      console.error("Invalid or missing package ID in URL:", id, ". Cannot fetch package data.");
      setError("ID Paket tidak valid di URL. Mohon periksa kembali."); 
      setLoading(false); 
      setPackageId(null); 
    }
  }, [id]);

  const fetchData = useCallback(async () => {
    if (packageId === null || isNaN(packageId)) {
      setLoading(false); 
      return;
    }

    setLoading(true);        
    setError(null);          
    setEligibilityMessage(null); 
    setCoursePackage(null);  
    setPaymentInfo(null);    

    try {
      console.log(`[Fetch] Fetching package details for ID: ${packageId}`);
      const packageResponse = await axiosInstance.get<CoursePackageData>(`/paket/${packageId}`);
      
      // --- Bagian debugging dan validasi respons API ---
      console.log("[Fetch] Raw packageResponse object (full Axios response):", packageResponse); 
      console.log("[Fetch] packageResponse.data (isi respons API mentah):", packageResponse.data); 
      console.log("[Fetch] Tipe packageResponse.data:", typeof packageResponse.data);
      console.log("[Fetch] packageResponse.data.namaPaket (jika langsung):", (packageResponse.data as any)?.namaPaket); 
      console.log("[Fetch] packageResponse.data.data.namaPaket (jika dibungkus 'data'):", (packageResponse.data as any)?.data?.namaPaket); 

      let actualPackageData: CoursePackageData | undefined = undefined;

      if (packageResponse.data && typeof packageResponse.data === 'object' && 'namaPaket' in packageResponse.data) {
          actualPackageData = packageResponse.data;
      } 
      else if ((packageResponse.data as any)?.data && typeof (packageResponse.data as any)?.data === 'object' && 'namaPaket' in (packageResponse.data as any)?.data) {
          actualPackageData = (packageResponse.data as any).data;
      }

      if (!actualPackageData || !actualPackageData.namaPaket || !actualPackageData.harga) {
          throw new Error("Respons API untuk detail paket tidak valid atau kosong (namaPaket/harga missing) setelah pengecekan pembungkus data.");
      }
      setCoursePackage(actualPackageData); 
      // --- END Bagian debugging dan validasi ---

      // --- PERBAIKAN PENTING DI SINI: Fetch paymentInfo di luar blok eligibility ---
      // Ambil informasi pembayaran terlepas dari status kelayakan
      console.log(`[Fetch] Fetching payment info for package ID: ${packageId}`);
      const paymentInfoRes = await axiosInstance.get<PaymentInfoResponse>(
        `/paket/${packageId}/beli`
      );
      console.log("[Fetch] Payment info response:", paymentInfoRes.data);

      if (!paymentInfoRes.data || !paymentInfoRes.data.bank || !paymentInfoRes.data.nomor_rekening) {
          throw new Error("Respons API untuk info pembayaran tidak valid atau kosong.");
      }

      setPaymentInfo({
        bankName: paymentInfoRes.data.bank,
        accountNumber: paymentInfoRes.data.nomor_rekening,
        accountHolder: paymentInfoRes.data.nama_rekening,
        amount: parseFloat(paymentInfoRes.data.harga), 
        packageName: paymentInfoRes.data.nama_paket, 
      });
      // --- AKHIR PERBAIKAN PENTING ---

      console.log(`[Fetch] Checking eligibility for package ID: ${packageId}`);
      const eligibilityResponse = await axiosInstance.get<EligibilityResponse>(
        `/paket/${packageId}/eligibility`
      );
      console.log("[Fetch] Eligibility response:", eligibilityResponse.data);
      
      console.log(`[Fetch] is_eligible dari API: ${eligibilityResponse.data.is_eligible}`);
      console.log(`[Fetch] Pesan eligibility dari API: ${eligibilityResponse.data.message}`);
      
      if (eligibilityResponse.data.is_eligible) {
        setApprovalStatus("approved");
        setEligibilityMessage(eligibilityResponse.data.message); 
      } else {
        setApprovalStatus("rejected");
        setEligibilityMessage(eligibilityResponse.data.message); 
      }
    } catch (err: unknown) {
      console.error("Failed to fetch data for subscription form:", err);
      if (axios.isAxiosError(err)) {
        if (err.response) {
          console.error("Axios response error:", err.response.status, err.response.data);
          if (err.response.status === 401) { 
            if ((err.response.data as any)?.message === 'Unauthenticated.') {
              setError("Sesi Anda telah berakhir. Silakan login kembali.");
              localStorage.removeItem('AuthToken');
              localStorage.removeItem('userData');
              navigate('/login');
            } else {
              setError((err.response.data as any)?.message || "Anda tidak memiliki izin untuk akses ini.");
            }
          } else if (err.response?.status === 404) {
            setError("Paket kursus tidak ditemukan atau endpoint tidak valid.");
          } else { 
             setError(`Terjadi kesalahan saat mengambil data: ${err.response.status} ${ (err.response.data as any)?.message || err.response.statusText || 'Error'}`);
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
  }, [packageId, navigate]);

  useEffect(() => {
    setTitle("Berlangganan Paket Kursus");
    setSubtitle("Paket kursus untuk disediakan kepada peserta");

    if (packageId !== null && !isNaN(packageId)) {
        fetchData();
    }
  }, [setTitle, setSubtitle, packageId, fetchData]);

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
          onClick={() => {
            if (error?.includes("ID Paket tidak valid")) {
                navigate(-1); 
            } else {
                window.location.reload(); 
            }
          }}
          className="mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
        >
          {error?.includes("ID Paket tidak valid") ? "Kembali" : "Coba Lagi"}
        </button>
      </div>
    );
  }

  if (!coursePackage) {
    return (
      <div className="mt-4 p-6 rounded-lg bg-white text-center text-gray-500">
        Tidak ada paket kursus yang tersedia untuk ID ini.
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
            value={coursePackage?.namaPaket || 'N/A'} 
            readOnly
            className="w-full border border-gray-400 rounded-md px-3 py-2 text-sm bg-transparent"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Harga</label>
          <input
            type="text"
            value={
              `Rp${parseFloat(coursePackage?.harga || '0').toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
            }
            readOnly
            className="w-full border border-gray-400 rounded-md px-3 py-2 text-sm bg-transparent"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Fasilitas</label>
          <input
            type="text"
            value={coursePackage?.fasilitas || 'Tidak tersedia'} 
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
            value={coursePackage?.masaBerlaku ? `${coursePackage.masaBerlaku} Bulan` : 'Tidak tersedia'} 
            readOnly
            className="w-full border border-gray-400 rounded-md px-3 py-2 text-sm bg-transparent"
          />
        </div>

        <div className="text-right">
          <button
            type="button"
            disabled={!paymentInfo} 
            onClick={() => setShowPaymentModal(true)}
            className={`px-6 py-2 rounded-md font-semibold transition ${
              !paymentInfo 
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-yellow-400 hover:bg-yellow-500 text-white"
            }`}
          >
            Beli
          </button>
          {/* --- PERBAIKAN DI SINI: MENGHILANGKAN KONDISI WARNA UNTUK SELAIN APPROVED --- */}
          {eligibilityMessage && ( 
            <p className={`text-xs mt-1 text-left text-green-500`}> {/* Selalu hijau */}
              {eligibilityMessage}
            </p>
          )}
          {/* ------------------------------------------------------------------------- */}
        </div>
      </form>

      {showPaymentModal && paymentInfo && ( 
        <ConfirmationPaymentModal
          onClose={() => setShowPaymentModal(false)}
          packageName={paymentInfo.packageName} 
          amount={paymentInfo.amount}
          bankName={paymentInfo.bankName}
          accountNumber={paymentInfo.accountNumber}
          accountHolder={paymentInfo.accountHolder}
          packageId={packageId!} 
        />
      )}
    </div>
  );
};

export default SubscribeForm;
// src/pages/student/StudyPlanSubmissionDetail.tsx
import React, { useEffect, useState } from "react";
import { useDashboardLayoutContext } from "../../layouts/DashboardLayout";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import { useNavigate, useParams } from "react-router-dom";
import axios, { AxiosError } from "axios";
import axiosInstance from "../../services/axios";

// --- Interface untuk struktur data Rencana Belajar DETAIL dari API ---
interface StudyPlanDetailData {
    idPengajuanRencanaBelajar: number;
    namaRencana: string;
    targetSkor: number;
    targetWaktu: string;
    hariPerMinggu: number;
    jamPerHari: string;
    tglPengajuan: string;
    status: "pending" | "disetujui" | "ditolak" | "sudah ada feedback" | "selesai";
    isAktif: number;
    tanggalMulai?: string;
    selesaiPada?: string;
    idPeserta: number;
    idPengajuanSkorAwal: number;
    created_at: string;
    updated_at: string;

    detail_pengajuan_rencana_belajar: Array<{
        idDetailPengajuan: number;
        idSkill: number;
        idPengajuanRencanaBelajar: number;
        created_at: string | null;
        updated_at: string | null;
        skill: {
            idSkill: number;
            kategori: string; // Misal: "Structure and Written Expression"
            skill: string;    // Misal: "Verb questions"
            deskripsi: string; // Misal: "I can answer questions..."
            created_at: string;
            updated_at: string;
        };
    }>;
    
    // feedback_rencana_belajar tetap di sini karena Anda memerlukannya untuk mengecek status dan keterangan
    feedback_rencana_belajar?: {
        idFeedbackRencanaBelajar: number;
        tglPemberianFeedback: string;
        idPengajuanRencanaBelajar: number;
        idInstruktur: number;
        created_at: string;
        updated_at: string;
        keterangan?: string; 

        // detail_feedback_rencana_belajar dihapus dari interface jika memang tidak akan pernah dipakai
        // Namun, jika Anda mungkin ingin menampilkannya di halaman feedback terpisah, 
        // tetap biarkan di interface dan hapus hanya dari JSX di bawah.
        // Untuk saat ini, saya biarkan di interface sesuai kode asli Anda,
        // karena ini adalah interface data dari API.
        detail_feedback_rencana_belajar: Array<{
            idDetailFeedback: number;
            idSkill: number;
            idFeedbackRencanaBelajar: number;
            created_at: string;
            updated_at: string;
            skill: {
                idSkill: number;
                kategori: string;
                skill: string;
                deskripsi: string;
                created_at: string;
                updated_at: string;
            };
        }>;
    } | null;
}

const StudyPlanSubmissionDetail: React.FC = () => {
    const { setTitle, setSubtitle } = useDashboardLayoutContext();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const [studyPlanData, setStudyPlanData] = useState<StudyPlanDetailData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setTitle("Detail Rencana Belajar");
        setSubtitle("Melihat detail rencana belajar yang telah diajukan.");
    }, [setTitle, setSubtitle]);

    useEffect(() => {
        const fetchStudyPlanDetail = async () => {
            if (!id) {
                setError("ID Rencana Belajar tidak ditemukan di URL.");
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError(null);
            try {
                const response = await axiosInstance.get<{ data: StudyPlanDetailData }>(`/peserta/rencana-belajar/${id}`);
                setStudyPlanData(response.data.data);
            } catch (err: unknown) {
                console.error("Failed to fetch study plan detail:", err);
                let errorMessage = "Gagal memuat detail rencana belajar. Silakan coba lagi.";

                if (axios.isAxiosError(err) && err.response) {
                    const responseData = err.response.data as { message?: string };
                    if (err.response.status === 404) {
                        errorMessage = "Rencana belajar tidak ditemukan.";
                    } else if (err.response.status === 401) {
                        errorMessage = "Sesi Anda telah berakhir. Silakan login kembali.";
                        localStorage.removeItem('AuthToken');
                        localStorage.removeItem('userData');
                        navigate('/login');
                    } else if (responseData && responseData.message) {
                        errorMessage = responseData.message;
                    } else {
                        errorMessage = `Error: ${err.response.status} - ${err.response.statusText}`;
                    }
                } else if (err instanceof Error) {
                    errorMessage = `Terjadi kesalahan: ${err.message}`;
                }
                setError(errorMessage);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStudyPlanDetail();
    }, [id, navigate]);

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            const options: Intl.DateTimeFormatOptions = {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
            };
            return date.toLocaleDateString('id-ID', options);
        } catch (e) {
            console.error("Failed to format date:", dateString, e);
            return dateString;
        }
    };

    // Fungsi helper untuk mengelompokkan skill berdasarkan kategori
    const groupSkillsByCategory = (skillDetails: Array<{ skill: { kategori: string; skill: string; } }>) => {
        const grouped: Record<string, string[]> = {};
        if (skillDetails) {
            skillDetails.forEach(detail => {
                const category = detail.skill.kategori;
                const skillName = detail.skill.skill; 
                if (!grouped[category]) {
                    grouped[category] = [];
                }
                grouped[category].push(skillName);
            });
        }
        return grouped;
    };


    if (isLoading) {
        return (
            <div className="p-6 bg-white rounded-lg shadow-sm mx-auto text-center">
                <p className="text-gray-600">Memuat detail rencana belajar...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-red-100 border border-red-400 text-red-700 rounded-lg mx-auto text-center">
                <p>{error}</p>
                <button
                    onClick={() => navigate(-1)}
                    className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                    Kembali
                </button>
            </div>
        );
    }

    if (!studyPlanData) {
        return (
            <div className="p-6 bg-white rounded-lg shadow-sm mx-auto text-center">
                <p className="text-gray-600">Rencana belajar tidak ditemukan.</p>
                <button
                    onClick={() => navigate(-1)}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Kembali
                </button>
            </div>
        );
    }

    // Kelompokkan skill yang diajukan peserta
    const submittedSkillsGrouped = groupSkillsByCategory(studyPlanData.detail_pengajuan_rencana_belajar);

    // Variabel ini tidak lagi digunakan untuk rendering, tapi tetap didefinisikan jika Anda ingin memanfaatkannya di tempat lain (misal, tombol feedback)
    // const recommendedSkillsGrouped = studyPlanData.feedback_rencana_belajar?.detail_feedback_rencana_belajar 
    //                                 ? groupSkillsByCategory(studyPlanData.feedback_rencana_belajar.detail_feedback_rencana_belajar)
    //                                 : {};

    return (
        <div className="p-6 bg-white rounded-lg shadow-sm mx-auto relative">
            <div className="flex gap-2 items-center">
                <button onClick={() => navigate(-1)} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
                    <IoArrowBackCircleOutline size={30} color="#A80532" />
                </button>
                <div>
                    <h3 className="text-[#A80532] font-bold text-xl">
                        Detail Pengajuan Rencana Belajar
                    </h3>
                    <p className="text-[#8E8E8E] text-sm">
                        Hasil detail pengajuan rencana belajar yang telah diajukan.
                    </p>
                </div>
            </div>

            <div className=" mt-5 flex justify-end">
                {/* Tombol Lihat Hasil Feedback */}
                {(studyPlanData.status === 'sudah ada feedback' || studyPlanData.status === 'selesai') && (
                    <button
                        onClick={() => navigate(`/student/rencana/detail/${id}/feedback`)} 
                        className="text-[#493BC0] font-medium border border-[#493BC0] px-4 py-2 rounded-lg hover:bg-[#493BC0]/10 transition"
                    >
                        Lihat Hasil Feedback
                    </button>
                )}
            </div>

            <h3 className="text-xl font-semibold mt-8 mb-4">Ringkasan Rencana Belajar:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                    <label className="block text-sm font-semibold mb-1 text-gray-700">Nama Rencana</label>
                    <p className="px-4 py-2 bg-gray-100 rounded-md">{studyPlanData.namaRencana}</p>
                </div>
                <div className="flex flex-col">
                    <label className="block text-sm font-semibold mb-1 text-gray-700">Target Skor</label>
                    <p className="px-4 py-2 bg-gray-100 rounded-md">{studyPlanData.targetSkor}</p>
                </div>
                <div className="flex flex-col">
                    <label className="block text-sm font-semibold mb-1 text-gray-700">Target Waktu</label>
                    <p className="px-4 py-2 bg-gray-100 rounded-md">{studyPlanData.targetWaktu}</p>
                </div>
                <div className="flex flex-col">
                    <label className="block text-sm font-semibold mb-1 text-gray-700">Frekuensi Waktu (Jam per Hari)</label>
                    <p className="px-4 py-2 bg-gray-100 rounded-md">{studyPlanData.jamPerHari}</p>
                </div>
                <div className="flex flex-col">
                    <label className="block text-sm font-semibold mb-1 text-gray-700">Jumlah Hari per Minggu</label>
                    <p className="px-4 py-2 bg-gray-100 rounded-md">{studyPlanData.hariPerMinggu}</p>
                </div>
                <div className="flex flex-col">
                    <label className="block text-sm font-semibold mb-1 text-gray-700">Status Persetujuan</label>
                    <p className="px-4 py-2 bg-gray-100 rounded-md capitalize">{studyPlanData.status === "sudah ada feedback" ? "Berjalan" : studyPlanData.status}</p>
                </div>
                    <div className="flex flex-col">
                    <label className="block text-sm font-semibold mb-1 text-gray-700">Tanggal Pengajuan</label>
                    <p className="px-4 py-2 bg-gray-100 rounded-md">{formatDate(studyPlanData.tglPengajuan)}</p>
                </div>
                    <div className="flex flex-col">
                    <label className="block text-sm font-semibold mb-1 text-gray-700">Tanggal Mulai</label>
                    <p className="px-4 py-2 bg-gray-100 rounded-md">{studyPlanData.tanggalMulai ? formatDate(studyPlanData.tanggalMulai) : '-'}</p>
                </div>
            </div>

            <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4">Skill yang Diajukan Peserta:</h3>
                {Object.keys(submittedSkillsGrouped).length > 0 ? (
                    Object.entries(submittedSkillsGrouped).map(([category, skills]) => (
                        <div key={category} className="mb-4">
                            <h4 className="font-semibold text-lg text-gray-800">{category}:</h4>
                            <ul className="list-disc list-inside bg-gray-100 p-4 rounded-md text-gray-800">
                                {skills.map((skillName, index) => (
                                    <li key={index}>{skillName}</li>
                                ))}
                            </ul>
                        </div>
                    ))
                ) : (
                    <div className="bg-gray-100 p-4 rounded-md text-gray-800">
                        <p>Tidak ada skill yang diajukan.</p>
                    </div>
                )}
            </div>

            {/* Keterangan Admin (jika ada) */}
            {studyPlanData.feedback_rencana_belajar?.keterangan && (
                <div className="mt-8">
                    <h3 className="text-xl font-semibold mb-4">Keterangan dari Admin/Instruktur:</h3>
                    <textarea
                        className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none bg-gray-100 cursor-not-allowed resize-y min-h-[100px]"
                        value={studyPlanData.feedback_rencana_belajar.keterangan}
                        readOnly
                        disabled
                    />
                </div>
            )}
            
        </div>
    );
};

export default StudyPlanSubmissionDetail;
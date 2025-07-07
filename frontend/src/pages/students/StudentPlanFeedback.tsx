// src/pages/student/StudyPlanFeedbackDetail.tsx
import React, { useEffect, useState } from "react";
import { useDashboardLayoutContext } from "../../layouts/DashboardLayout";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import { useNavigate, useParams } from "react-router-dom";
import axios, { AxiosError } from "axios";
import axiosInstance from "../../services/axios";

// --- Interface untuk struktur data Rencana Belajar DETAIL dari API (Sama dengan sebelumnya) ---
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
            kategori: string;
            skill: string;
            deskripsi: string;
            created_at: string;
            updated_at: string;
        };
    }>;
    
    feedback_rencana_belajar?: {
        idFeedbackRencanaBelajar: number;
        tglPemberianFeedback: string;
        idPengajuanRencanaBelajar: number;
        idInstruktur: number;
        created_at: string;
        updated_at: string;
        keterangan?: string; 

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

const StudyPlanFeedbackDetail: React.FC = () => { // Nama komponen baru
    const { setTitle, setSubtitle } = useDashboardLayoutContext();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>(); // ID pengajuan rencana belajar

    const [studyPlanData, setStudyPlanData] = useState<StudyPlanDetailData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<string>(''); // State untuk tab aktif

    useEffect(() => {
        setTitle("Hasil Feedback Rencana Belajar");
        setSubtitle("Detail feedback yang telah diberikan instruktur.");
    }, [setTitle, setSubtitle]);

    useEffect(() => {
        const fetchStudyPlanAndFeedback = async () => {
            if (!id) {
                setError("ID Rencana Belajar tidak ditemukan di URL.");
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError(null);
            try {
                // Ambil data rencana belajar (yang sudah termasuk feedback)
                const response = await axiosInstance.get<{ data: StudyPlanDetailData }>(`/peserta/rencana-belajar/${id}`);
                const data = response.data.data;
                setStudyPlanData(data);

                // Jika ada feedback, tentukan tab default
                if (data.feedback_rencana_belajar) {
                    const categoriesInFeedback = new Set<string>();
                    data.feedback_rencana_belajar.detail_feedback_rencana_belajar.forEach(d => {
                        if (d.skill.kategori.includes('Structure')) categoriesInFeedback.add('Structure and Written Expression');
                        if (d.skill.kategori.includes('Listening')) categoriesInFeedback.add('Listening Comprehension');
                        if (d.skill.kategori.includes('Reading')) categoriesInFeedback.add('Reading Comprehension');
                    });
                    
                    if (categoriesInFeedback.has('Structure and Written Expression')) setActiveTab('Structure and Written Expression');
                    else if (categoriesInFeedback.has('Listening Comprehension')) setActiveTab('Listening Comprehension');
                    else if (categoriesInFeedback.has('Reading Comprehension')) setActiveTab('Reading Comprehension');
                    else if (categoriesInFeedback.size > 0) setActiveTab(Array.from(categoriesInFeedback)[0]); // Fallback
                }
                
                // Jika tidak ada feedback, mungkin perlu pesan khusus atau redirect
                if (!data.feedback_rencana_belajar || data.feedback_rencana_belajar.detail_feedback_rencana_belajar.length === 0) {
                    setError("Belum ada feedback instruktur untuk rencana belajar ini.");
                }

            } catch (err: unknown) {
                console.error("Failed to fetch study plan and feedback detail:", err);
                let errorMessage = "Gagal memuat detail feedback. Silakan coba lagi.";

                if (axios.isAxiosError(err) && err.response) {
                    const responseData = err.response.data as { message?: string };
                    if (err.response.status === 404) {
                        errorMessage = "Feedback rencana belajar tidak ditemukan.";
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

        fetchStudyPlanAndFeedback();
    }, [id, navigate]);

    const getRecommendedSkillsForCategory = (category: string) => {
        if (!studyPlanData?.feedback_rencana_belajar?.detail_feedback_rencana_belajar) {
            return "Instruktur belum merekomendasikan skill apapun untuk kategori ini.";
        }
        
        const recommendedSkills = studyPlanData.feedback_rencana_belajar.detail_feedback_rencana_belajar.filter(
            (detail) => detail.skill.kategori.includes(category)
        );

        if (recommendedSkills.length === 0) {
            return `Instruktur belum merekomendasikan skill untuk bagian ${category}.`;
        }

        let content = `Berikut adalah unit skill yang direkomendasikan instruktur untuk kategori ${category}:\n\n`;
        recommendedSkills.forEach(detail => {
            content += `• ${detail.skill.skill}\n`;
            content += `  Deskripsi: ${detail.skill.deskripsi}\n\n`;
        });
        return content;
    };

    if (isLoading) {
        return (
            <div className="p-6 bg-white rounded-lg shadow-sm mx-auto text-center">
                <p className="text-gray-600">Memuat detail feedback...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-red-100 border border-red-400 text-red-700 rounded-lg mx-auto text-center">
                <p>{error}</p>
                <button
                    onClick={() => navigate(-1)} // Kembali ke halaman detail rencana belajar
                    className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                    Kembali
                </button>
            </div>
        );
    }

    if (!studyPlanData || !studyPlanData.feedback_rencana_belajar || studyPlanData.feedback_rencana_belajar.detail_feedback_rencana_belajar.length === 0) {
        return (
            <div className="p-6 bg-white rounded-lg shadow-sm mx-auto text-center">
                <p className="text-gray-600">Belum ada feedback instruktur untuk rencana belajar ini.</p>
                <button
                    onClick={() => navigate(-1)}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Kembali
                </button>
            </div>
        );
    }

    const feedbackCategories = Array.from(new Set(
        studyPlanData.feedback_rencana_belajar.detail_feedback_rencana_belajar.map(d => d.skill.kategori)
    )).sort();

    return (
        <div className="p-6 bg-white rounded-lg shadow-sm mx-auto relative">
            <div className="flex gap-2 items-center mb-6">
                <button onClick={() => navigate(-1)} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
                    <IoArrowBackCircleOutline size={30} color="#A80532" />
                </button>
                <div>
                    <h3 className="text-[#A80532] font-bold text-xl">
                        Hasil Feedback Rencana Belajar
                    </h3>
                    <p className="text-[#8E8E8E] text-sm">
                        Detail feedback yang telah di tinjau oleh instruktur.
                    </p>
                </div>
            </div>

            <div className="mt-4">
                {/* Tab Navigasi untuk Rekomendasi per Kategori */}
                <div className="flex border-b border-gray-200 mb-4 overflow-x-auto pb-2">
                    {feedbackCategories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setActiveTab(category)}
                            className={`py-2 px-4 whitespace-nowrap ${activeTab === category ? 'border-b-2 border-[#A80532] text-[#A80532] font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            {category.replace(' and Written Expression', '').replace(' Comprehension', '')}
                        </button>
                    ))}
                </div>

                {/* Konten Rekomendasi untuk Tab Aktif */}
                {activeTab ? ( // Hanya tampilkan konten jika ada tab aktif
                    <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                        <h4 className="text-lg font-medium text-gray-800 mb-2">
                            Rekomendasi Unit Skill untuk Bagian {activeTab.replace(' and Written Expression', '').replace(' Comprehension', '')}:
                        </h4>
                        <pre className="text-gray-700 whitespace-pre-wrap font-sans">
                            {getRecommendedSkillsForCategory(activeTab)}
                        </pre>
                    </div>
                ) : (
                    <div className="bg-blue-50 p-4 rounded-md text-blue-800">
                        Pilih kategori di atas untuk melihat rekomendasi.
                    </div>
                )}
                
                {/* Menampilkan keterangan umum jika ada (jika backend mengirimnya) */}
                {studyPlanData.feedback_rencana_belajar.keterangan && (
                    <div className="mt-4">
                        <h4 className="text-lg font-medium text-gray-800 mb-2">Keterangan Umum dari Instruktur:</h4>
                        <p className="bg-gray-50 p-4 rounded-md border border-gray-200 text-gray-700">
                            {studyPlanData.feedback_rencana_belajar.keterangan}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudyPlanFeedbackDetail;
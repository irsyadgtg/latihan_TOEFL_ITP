import React, { useEffect, useRef, useState } from "react";
import { useDashboardLayoutContext } from "../../layouts/DashboardLayout";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import { useNavigate, useParams } from "react-router-dom";
import SkillListView from "../../components/SkillListView"; // Pastikan path ini benar

import axios from "axios";
import axiosInstance from "../../services/axios";

// Interface untuk payload yang akan dikirim ke backend (saat membuat atau mengupdate)
interface StudyPlanPayload {
  target_waktu: string;
  frekuensi_mingguan: number;
  durasi_harian: string;
  target_skor: number;
  skill: number[];
}

// Interface untuk data rencana belajar yang diambil dari backend (saat GET detail)
interface StudyPlanDetailData {
  idPengajuanRencanaBelajar: number;
  targetWaktu: string;
  jamPerHari: string;
  targetSkor: number;
  hariPerMinggu: number;
  detail_pengajuan_rencana_belajar: { skill: { idSkill: number; namaSkill: string; deskripsi: string; } }[]; // Menambahkan deskripsi
  status: string;
  tglPengajuan: string;
}

// Interface untuk data skill dari backend (GET /peserta/skill)
interface SkillData {
  idSkill: number;
  kategori: string;
  skill: string;
  deskripsi: string; // PENTING: Menggunakan 'deskripsi' sesuai respons backend
  created_at?: string;
  updated_at?: string;
}

// Interface untuk props SkillListView
interface SkillListViewProps {
  label: string;
  activeTab: string;
  skillOptions: Record<string, SkillData[]>;
  skillStatus: Record<number, boolean>;
  toggleSkill: (skillId: number) => void;
}

export default function StudyPlanSubmissionCreate() {
  const { setTitle, setSubtitle } = useDashboardLayoutContext();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const isEditMode = !!id;

  const [step, setStep] = useState<"structure" | "listening" | "reading">("structure");

  const [skillStatus, setSkillStatus] = useState<Record<string, Record<number, boolean>>>({
    Structure: {},
    Listening: {},
    Reading: {},
  });

  const [allSkills, setAllSkills] = useState<SkillData[]>([]);

  const [targetTime, setTargetTime] = useState<string>("");
  const [jamBelajar, setJamBelajar] = useState<string>("");
  const [targetScore, setTargetScore] = useState<string>("");
  const [jumlahHari, setJumlahHari] = useState<string>("");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFetchingData, setIsFetchingData] = useState<boolean>(isEditMode);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const listeningRef = useRef<HTMLDivElement>(null);
  const readingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTitle(isEditMode ? "Ubah Rencana Belajar" : "Pengajuan Rencana Belajar");
    setSubtitle(isEditMode ? "Memperbarui Data Pengajuan" : "Mengisikan Data Pengajuan");
  }, [setTitle, setSubtitle, isEditMode]);

  useEffect(() => {
    const fetchAllSkills = async () => {
      try {
        const response = await axiosInstance.get<{ data: SkillData[] }>("/peserta/skill");
        setAllSkills(response.data.data);
        console.log("All skills fetched:", response.data.data); // Debugging
      } catch (error) {
        console.error("Failed to fetch all skills:", error);
        setGeneralError("Gagal memuat daftar skill. Mohon coba lagi.");
      }
    };
    fetchAllSkills();
  }, []);

  // Definisikan options di sini agar bisa diakses oleh useEffect di bawahnya
  const structureOptions: SkillData[] = allSkills.filter((skill) =>
    [
      "I can answer questions related to the most frequently asked noun questions in TOEFL ITP",
      "I can answer questions related to the most frequently asked verb questions in TOEFL ITP",
      "I can answer questions related to the most frequently asked SV agreement questions in TOEFL ITP",
      "I can answer questions related to the most frequently asked adjective and adverb questions in TOEFL ITP",
      "I can answer questions related to the most frequently asked pronoun questions in TOEFL ITP",
      "I can answer questions related to the most frequently asked parallel structure questions in TOEFL ITP",
      "I can answer questions related to the most frequently asked simple and compound sentence questions in TOEFL ITP",
      "I can answer questions related to the most frequently asked complex sentence questions in TOEFL ITP",
      "I can answer questions related to the most frequently asked reduce clause questions in TOEFL ITP",
      "I can answer questions related to the most frequently asked preposition and word-choice questions in TOEFL ITP",
    ].includes(skill.deskripsi) // <--- PENTING: Menggunakan skill.deskripsi
  );

  const listeningOptions: SkillData[] = allSkills.filter((skill) =>
    [
      "I can identify the gist/topic of short and longer conversations",
      "I can explain advice/suggestions given in short conversations.",
      "I can predict what the speaker will probably do next in short conversations.",
      "I can make use of context to understand meaning in short conversations.",
      "I can infer unstated details of short conversations.",
      "I can identify stated details in longer conversations.",
      "I can identify unstated details in longer conversations.",
      "I can identify the gist in lectures.",
      "I can identify stated details in lectures.",
      "I can identify unstated details in lectures.",
    ].includes(skill.deskripsi) // <--- PENTING: Menggunakan skill.deskripsi
  );

  const readingOptions: SkillData[] = allSkills.filter((skill) =>
    [
      "I can identify the topic of the passage and main idea of a paragraph.",
      "I can explain central information and details explicitly given in the passage.",
      "I can find the referential relationship questions.",
      "I can make use of context to understand literal equivalent of a word or phrase.",
      "I can explain central information and details implicitly given in the passage.",
      "I can analyze the organizational structure of a passage.",
    ].includes(skill.deskripsi) // <--- PENTING: Menggunakan skill.deskripsi
  );

  useEffect(() => {
    // Debugging filter results
    console.log("Structure Options (after filter):", structureOptions);
    console.log("Listening Options (after filter):", listeningOptions);
    console.log("Reading Options (after filter):", readingOptions);

    if (isEditMode && allSkills.length > 0) {
      const fetchStudyPlanDetail = async () => {
        setIsFetchingData(true);
        setGeneralError(null);
        try {
          const response = await axiosInstance.get<{ message: string; data: StudyPlanDetailData }>(
            `/peserta/rencana-belajar/${id}`
          );
          const detailData = response.data.data;

          setTargetTime(detailData.targetWaktu);
          setJamBelajar(detailData.jamPerHari);
          setTargetScore(String(detailData.targetSkor));
          setJumlahHari(String(detailData.hariPerMinggu));

          const newSkillStatus: Record<string, Record<number, boolean>> = {
            Structure: {},
            Listening: {},
            Reading: {},
          };

          // Filter skill names based on their `deskripsi` to categorize them
          const structureSkillDescriptions = structureOptions.map((s) => s.deskripsi);
          const listeningSkillDescriptions = listeningOptions.map((s) => s.deskripsi);
          const readingSkillDescriptions = readingOptions.map((s) => s.deskripsi);

          detailData.detail_pengajuan_rencana_belajar.forEach((detail) => {
            const skillId = detail.skill.idSkill;
            const skillDescription = detail.skill.deskripsi; // Menggunakan deskripsi dari detail

            if (structureSkillDescriptions.includes(skillDescription)) {
              newSkillStatus.Structure[skillId] = true;
            } else if (listeningSkillDescriptions.includes(skillDescription)) {
              newSkillStatus.Listening[skillId] = true;
            } else if (readingSkillDescriptions.includes(skillDescription)) {
              newSkillStatus.Reading[skillId] = true;
            }
          });
          setSkillStatus(newSkillStatus);
        } catch (error: unknown) {
          console.error("Failed to fetch study plan detail:", error);
          if (axios.isAxiosError(error) && error.response) {
            const responseData = error.response.data;
            if (error.response.status === 404) {
              setGeneralError("Rencana belajar tidak ditemukan.");
            } else if (error.response.status === 401) {
              setGeneralError("Sesi Anda telah berakhir. Silakan login kembali.");
              localStorage.removeItem("AuthToken");
              localStorage.removeItem("userData");
              navigate("/login");
            } else {
              setGeneralError(responseData?.message || `Gagal memuat detail: ${error.response?.status}`);
            }
          } else {
            setGeneralError("Gagal memuat detail rencana belajar.");
          }
        } finally {
          setIsFetchingData(false);
        }
      };
      fetchStudyPlanDetail();
    } else if (!isEditMode && allSkills.length > 0) {
      setIsFetchingData(false);
    }
  }, [id, isEditMode, navigate, allSkills, structureOptions, listeningOptions, readingOptions]); // Tambahkan options sebagai dependensi

  const toggleSkill = (category: string, skillId: number) => {
    setSkillStatus((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [skillId]: !prev[category]?.[skillId],
      },
    }));
  };

  const handleNext = () => {
    if (step === "structure") {
      if (!targetTime || !jamBelajar || !targetScore || !jumlahHari) {
        setGeneralError("Harap lengkapi semua informasi umum rencana belajar.");
        return;
      }
      const parsedTargetScore = parseInt(targetScore);
      const parsedJumlahHari = parseInt(jumlahHari);

      if (isNaN(parsedTargetScore) || parsedTargetScore <= 0) {
        setGeneralError("Target Skor harus berupa angka positif.");
        return;
      }
      if (isNaN(parsedJumlahHari) || parsedJumlahHari <= 0) {
        setGeneralError("Jumlah hari harus berupa angka positif.");
        return;
      }
    }
    setGeneralError(null);

    if (step === "structure") {
      setStep("listening");
      setTimeout(() => {
        listeningRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else if (step === "listening") {
      setStep("reading");
      setTimeout(() => {
        readingRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setGeneralError(null);
    setSuccessMessage(null);

    if (!targetTime || !jamBelajar || !targetScore || !jumlahHari) {
      setGeneralError("Harap lengkapi semua informasi umum rencana belajar.");
      setIsLoading(false);
      setStep("structure");
      return;
    }
    const parsedTargetScore = parseInt(targetScore);
    const parsedJumlahHari = parseInt(jumlahHari);

    if (isNaN(parsedTargetScore) || parsedTargetScore <= 0) {
      setGeneralError("Target Skor harus berupa angka positif.");
      setIsLoading(false);
      return;
    }

    if (isNaN(parsedJumlahHari) || parsedJumlahHari <= 0) {
      setGeneralError("Jumlah hari per minggu harus berupa angka positif.");
      setIsLoading(false);
      return;
    }

    const selectedSkillIds: number[] = [];
    Object.keys(skillStatus.Structure).forEach((id) => {
      if (skillStatus.Structure[Number(id)]) selectedSkillIds.push(Number(id));
    });
    Object.keys(skillStatus.Listening).forEach((id) => {
      if (skillStatus.Listening[Number(id)]) selectedSkillIds.push(Number(id));
    });
    Object.keys(skillStatus.Reading).forEach((id) => {
      if (skillStatus.Reading[Number(id)]) selectedSkillIds.push(Number(id));
    });

    if (selectedSkillIds.length === 0) {
      setGeneralError("Anda harus memilih setidaknya satu skill.");
      setIsLoading(false);
      return;
    }

    const payload: StudyPlanPayload = {
      target_waktu: targetTime,
      frekuensi_mingguan: parsedJumlahHari,
      durasi_harian: jamBelajar,
      target_skor: parsedTargetScore,
      skill: selectedSkillIds,
    };

    console.log("Payload yang dikirim:", payload);

    try {
      let response;
      if (isEditMode) {
        response = await axiosInstance.patch(`/peserta/rencana-belajar/${id}`, payload);
      } else {
        response = await axiosInstance.post("/peserta/rencana-belajar", payload);
      }

      setSuccessMessage(
        response.data.message || (isEditMode ? "Rencana belajar berhasil diperbarui!" : "Rencana belajar berhasil diajukan!")
      );

      if (!isEditMode) {
        setTargetTime("");
        setJamBelajar("");
        setTargetScore("");
        setJumlahHari("");
        setSkillStatus({ Structure: {}, Listening: {}, Reading: {} });
        setStep("structure");
      }

      setTimeout(() => {
        navigate("/student/rencana");
      }, 2000);
    } catch (error: unknown) {
      console.error("Submission Error:", error);
      let errorMessage = "Pengajuan gagal. Terjadi kesalahan yang tidak diketahui.";

      if (axios.isAxiosError(error)) {
        const responseData = error.response?.data;

        if (error.response?.status === 401) {
          errorMessage = "Sesi Anda telah berakhir. Silakan login kembali.";
          localStorage.removeItem("AuthToken");
          localStorage.removeItem("userData");
          navigate("/login");
        } else if (responseData && responseData.errors) {
          let validationMsg = "";
          for (const key in responseData.errors) {
            validationMsg += `- ${key}: ${responseData.errors[key].join(", ")}\n`;
          }
          errorMessage = `Pengajuan gagal. Periksa kembali input Anda:\n${validationMsg}`;
        } else if (responseData && responseData.message) {
          errorMessage = responseData.message;
        } else {
          errorMessage = `Pengajuan gagal. Error: ${error.response?.status} - ${error.response?.statusText}`;
        }
      } else if (error instanceof Error) {
        errorMessage = `Pengajuan gagal. Terjadi kesalahan: ${error.message}`;
      }
      setGeneralError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetchingData || allSkills.length === 0) {
    return (
      <div className="bg-white px-3 py-2 rounded-lg shadow-md min-h-[300px] flex justify-center items-center">
        <p className="text-gray-600">Memuat data...</p>
      </div>
    );
  }

  return (
    <div className="bg-white px-3 py-2 rounded-lg shadow-md">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
          <IoArrowBackCircleOutline size={30} color="#A80532" />
        </button>
        <div>
          <h3 className="text-[#A80532] font-bold text-xl">
            {isEditMode ? "Ubah Rencana Belajar" : "Pengajuan Rencana Belajar"}
          </h3>
          <p className="text-[#8E8E8E] text-sm">{isEditMode ? "Memperbarui Data Pengajuan" : "Mengisikan Data Pengajuan"}</p>
        </div>
      </div>

      <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
        {generalError && (
          <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md whitespace-pre-line text-center">
            {generalError}
          </p>
        )}
        {successMessage && (
          <p className="text-sm text-green-600 bg-green-100 p-3 rounded-md text-center">
            {successMessage}
          </p>
        )}

        <div>
          <label htmlFor="targetTime" className="block text-lg font-bold text-gray-800 mb-2">
            Target Waktu
          </label>
          <select
            id="targetTime"
            name="targetTime"
            required
            value={targetTime}
            onChange={(e) => setTargetTime(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-4 py-3 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 text-base"
          >
            <option value="">-- Pilih --</option>
            <option value="2 minggu">2 Minggu</option>
            <option value="3 minggu">3 Minggu</option>
            <option value="1 bulan">1 Bulan</option>
          </select>
        </div>

        <div>
          <label htmlFor="jamBelajar" className="block text-lg font-bold text-gray-800 mb-2">
            Frekuensi Waktu
          </label>
          <select
            id="jamBelajar"
            name="jamBelajar"
            required
            value={jamBelajar}
            onChange={(e) => setJamBelajar(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-4 py-3 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 text-base"
          >
            <option value="">-- Pilih --</option>
            <option value="<1 jam">&lt; 1 Jam</option>
            <option value="<2 jam">&lt; 2 Jam</option>
            <option value="2-3 jam">2-3 Jam</option>
          </select>
        </div>

        <div>
          <label htmlFor="targetScore" className="block text-lg font-bold text-gray-800 mb-2">
            Target Skor
          </label>
          <div className="mt-1">
            <input
              id="targetScore"
              name="targetScore"
              type="number"
              required
              placeholder="Target Score"
              value={targetScore}
              onChange={(e) => setTargetScore(e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-4 py-3 placeholder-gray-400 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 text-base"
            />
          </div>
        </div>

        <div>
          <label htmlFor="jumlahHari" className="block text-lg font-bold text-gray-800 mb-2">
            Berapa hari waktu yang diluangkan per-minggu
          </label>
          <select
            id="jumlahHari"
            name="jumlahHari"
            required
            value={jumlahHari}
            onChange={(e) => setJumlahHari(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-4 py-3 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 text-base"
          >
            <option value="">-- Pilih --</option>
            <option value="1">1 Hari</option>
            <option value="2">2 Hari</option>
            <option value="3">3 Hari</option>
            <option value="4">4 Hari</option>
            <option value="5">5 Hari</option>
            <option value="6">6 Hari</option>
            <option value="7">7 Hari</option>
          </select>
        </div>

        {step === "structure" && (
          <div className="bg-gray-50 p-4 rounded-lg shadow-inner">
            <SkillListView
              label="Bagian Structure and Written Expression"
              activeTab="Structure"
              skillOptions={{ Structure: structureOptions }}
              skillStatus={skillStatus.Structure}
              toggleSkill={(skillId) => toggleSkill("Structure", skillId)}
            />
            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={handleNext}
                className="bg-white border border-[#493BC0] text-[#493BC0] font-semibold px-6 py-3 rounded-lg hover:bg-[#493BC0] hover:text-white transition-colors duration-300 shadow-sm"
              >
                Bagian Selanjutnya
              </button>
            </div>
          </div>
        )}

        {step === "listening" && (
          <div className="bg-gray-50 p-4 rounded-lg shadow-inner" ref={listeningRef}>
            <SkillListView
              label="Bagian Listening"
              activeTab="Listening"
              skillOptions={{ Listening: listeningOptions }}
              skillStatus={skillStatus.Listening}
              toggleSkill={(skillId) => toggleSkill("Listening", skillId)}
            />
            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={handleNext}
                className="bg-white border border-[#493BC0] text-[#493BC0] font-semibold px-6 py-3 rounded-lg hover:bg-[#493BC0] hover:text-white transition-colors duration-300 shadow-sm"
              >
                Bagian Selanjutnya
              </button>
            </div>
          </div>
        )}

        {step === "reading" && (
          <div className="bg-gray-50 p-4 rounded-lg shadow-inner" ref={readingRef}>
            <SkillListView
              label="Bagian Reading"
              activeTab="Reading"
              skillOptions={{ Reading: readingOptions }}
              skillStatus={skillStatus.Reading}
              toggleSkill={(skillId) => toggleSkill("Reading", skillId)}
            />
            <div className="flex justify-end mt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-[#EDC968] text-white font-semibold px-8 py-3 rounded-lg hover:bg-opacity-90 transition-opacity duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Mengajukan..." : isEditMode ? "Simpan Perubahan" : "Submit Pengajuan"}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
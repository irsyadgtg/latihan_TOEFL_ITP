import React, { useEffect, useRef, useState } from "react";
import { useDashboardLayoutContext } from "../../layouts/DashboardLayout";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import SkillListView from "../../components/SkillListView";

const StudyPlanSubmissionCreate: React.FC = () => {
  const { setTitle, setSubtitle } = useDashboardLayoutContext();
  const navigate = useNavigate();
  const [step, setStep] = useState<"structure" | "listening" | "reading">(
    "structure"
  );

  const [skillStatus, setSkillStatus] = useState<Record<string, boolean>>({});

  const toggleSkill = (stepKey: string, index: number) => {
    const key = `${stepKey}-${index}`;
    setSkillStatus((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const listeningRef = useRef<HTMLDivElement>(null);
  const readingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTitle("");
    setSubtitle("");
  }, []);

  const handleNext = () => {
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

  const structureOptions = [
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
  ];

  const listeningOptions = [
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
  ];

  const readingOptions = [
    "I can identify the topic of the passage and main idea of a paragraph.",
    "I can explain central information and details explicitly given in the passage.",
    "I can find the referential relationship questions.",
    "I can make use of context to understand literal equivalent of a word or phrase.",
    "I can explain central information and details implicitly given in the passage.",
    "I can analyze the organizational structure of a passage.",
  ];

  return (
    <div className="bg-white px-3 py-2 rounded-lg">
      <div className="flex gap-5">
        <button onClick={() => navigate(-1)}>
          <IoArrowBackCircleOutline size={25} color="red" />
        </button>
        <div>
          <h3 className="text-[#A80532] font-bold text-lg">
            Pengajuan Rencana Belajar
          </h3>
          <p className="text-[#8E8E8E] text-sm">Mengisikan Data Pengajuan</p>
        </div>
      </div>

      <form className="mt-6 space-y-4">
        <div>
          <label
            htmlFor="targetTime"
            className="block text-[18px] font-bold text-black"
          >
            Target Waktu
          </label>
          <select
            id="targetTime"
            name="targetTime"
            required
            className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-4 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
          >
            <option value="">-- Pilih --</option>
            <option value="2 minggu">2 Minggu</option>
            <option value="3 minggu">3 Minggu</option>
            <option value="1 bulan">1 Bulan</option>
            <option value="2 bulan">2 Bulan</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="jamBelajar"
            className="block text-[18px] font-bold text-black"
          >
            Frekuensi Waktu
          </label>
          <select
            id="jamBelajar"
            name="jamBelajar"
            required
            className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-4 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
          >
            <option value="">-- Pilih --</option>
            <option value="1 jam">1 Jam</option>
            <option value="2 jam">2 Jam</option>
            <option value="3 jam">3 Jam</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="targetscore"
            className="block text-[18px] font-bold text-black"
          >
            Target Skor
          </label>
          <div className="mt-2">
            <input
              id="targetscore"
              name="targetscore"
              type="text"
              required
              placeholder="Target Score"
              className="block w-full rounded-md border border-gray-300 px-3 py-4 placeholder-gray-400 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="jumlahHari"
            className="block text-[18px] font-bold text-black"
          >
            Berapa waktu yang diluangkan per-hari
          </label>
          <select
            id="jumlahHari"
            name="jumlahHari"
            required
            className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-4 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
          >
            <option value="">-- Pilih --</option>
            <option value="3">3 Hari</option>
            <option value="4">4 Hari</option>
            <option value="5">5 Hari</option>
          </select>
        </div>

        {step === "structure" && (
          <div className="flex justify-between px-4  rounded-md">
            <SkillListView
              label="Bagian Structure and Witten Expression"
              activeTab="Structure"
              skillOptions={{ Structure: structureOptions }}
              skillStatus={skillStatus}
              toggleSkill={(index) => toggleSkill("Structure", index)}
            />
            <button
              type="button"
              onClick={handleNext}
              className="mt-4 bg-white border border-[#493BC0] text-[#493BC0] h-fit px-4 py-2 rounded"
            >
              Bagian Selanjutnya
            </button>
          </div>
        )}

        {step === "listening" && (
          <div
            className="flex justify-between px-4   rounded-md "
            ref={listeningRef}
          >
            <SkillListView
              label="Bagian Listening"
              activeTab="Listening"
              skillOptions={{ Listening: listeningOptions }}
              skillStatus={skillStatus}
              toggleSkill={(index) => toggleSkill("Listening", index)}
            />
            <button
              type="button"
              onClick={handleNext}
              className="mt-4 bg-white border border-[#493BC0] text-[#493BC0] h-fit px-4 py-2 rounded"
            >
              Bagian Selanjutnya
            </button>
          </div>
        )}

        {step === "reading" && (
          <div ref={readingRef}>
            <SkillListView
              label="Bagian Reading"
              activeTab="Reading"
              skillOptions={{ Reading: readingOptions }}
              skillStatus={skillStatus}
              toggleSkill={(index) => toggleSkill("Reading", index)}
            />
            <div className="flex justify-self-end">
              <button
                type="submit"
                className="mt-4 bg-[#EDC968] text-white px-4 py-2 rounded"
              >
                Submit
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default StudyPlanSubmissionCreate;

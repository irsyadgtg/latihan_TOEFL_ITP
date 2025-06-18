import React, { useEffect, useRef } from "react";
import { useStudentLayoutContext } from "../../layouts/StudentLayout";
import { IoArrowBackCircleOutline, IoDocumentOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

const CreateInitialScore: React.FC = () => {
  const { setTitle, setSubtitle } = useStudentLayoutContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setTitle("");
    setSubtitle("");
  }, []);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white px-3 py-2 rounded-lg">
      <div className="flex gap-2">
        <button onClick={() => navigate(-1)}>
          <IoArrowBackCircleOutline size={25} color="red" />
        </button>
        <div>
          <h3 className="text-[#A80532] font-bold text-lg">
            Pengajuan Skor Awal
          </h3>
          <p className="text-[#8E8E8E] text-sm">Mengisikan Data Pengajuan</p>
        </div>
      </div>

      <form action="" method="post" className="mt-6">
        {/* Nama Tes */}
        <div className="mb-3">
          <label
            htmlFor="testName"
            className="block text-sm font-bold text-black text-[18px]"
          >
            Nama Tes Yang Diikuti
          </label>
          <div className="mt-2">
            <input
              id="testName"
              name="testName"
              type="text"
              required
              placeholder="TOEFL ITP Preparation"
              className="block w-full rounded-md border border-gray-300 px-3 py-4 placeholder-gray-400 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Skor */}
        <div className="mb-3">
          <label
            htmlFor="score"
            className="block text-sm font-bold text-black text-[18px]"
          >
            Besaran Skor
          </label>
          <div className="mt-2">
            <input
              id="score"
              name="score"
              type="number"
              required
              placeholder="90"
              className="block w-full rounded-md border border-gray-300 px-3 py-4 placeholder-gray-400 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Dokumen */}
        <div className="mb-3">
          <label
            htmlFor="certificate"
            className="block text-sm font-bold text-black text-[18px]"
          >
            Dokumen Pendukung Sertifikat Test Yang Pernah Diikuti
          </label>
          <input
            ref={fileInputRef}
            id="certificate"
            name="certificate"
            type="file"
            required
            className="hidden"
          />

          <div
            onClick={handleUploadClick}
            className="border border-gray-700 rounded-lg py-10 flex flex-col gap-2 justify-center items-center cursor-pointer"
          >
            <IoDocumentOutline size={"100px"} color="#B6252A" />
            <button
              type="button"
              className="bg-[#0B6DFF] text-white rounded-full px-6 py-2"
            >
              Unggah
            </button>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-[#EDC968] text-white px-6 py-3 rounded-lg"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateInitialScore;

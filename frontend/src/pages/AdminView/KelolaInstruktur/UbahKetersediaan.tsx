import Layout from "../../../layouts/AdminView";

import FotoProfile from "../../../assets/image/foto.png";

// icons
import { ChevronDown } from "lucide-react";


export default function Dashboard() {

  return (
    <Layout
      title="Ubah Ketersediaan"
      note={"Ubah jadwal ketersediaan instructor"}
    >
      <div className="w-full py-2 px-28">
        {/* Header Profil */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <img
              src={FotoProfile}
              alt="Foto Profil"
              className="w-20 h-20 rounded-full object-cover"
            />
            <div>
              <h2 className="text-[20px] font-semibold">Khrsima</h2>
              <p className="text-gray-500 text-[16px]">khrsimanaam@gmail.com</p>
            </div>
          </div>
          <button className="border border-indigo-500 text-indigo-500 px-10 py-2 rounded-lg hover:bg-indigo-50 text-[16px] font-semibold">
            Simpan
          </button>
        </div>

        {/* Form */}
        <form className="space-y-6">
          {/* Input Nama Lengkap */}
          <div>
            <label className="block text-[22px] font-medium mb-1">
              Nama Lengkap
            </label>
            <input
              type="text"
              placeholder="Masukkan nama lengkap"
              className="w-full h-16 border border-borderColor rounded-xl px-4 py-2 focus:outline-none"
            />
          </div>

          {/* Username */}
          <div>
            <label className="block text-[22px] font-medium mb-1">
              Username
            </label>
            <input
              type="text"
              placeholder="Masukkan username"
              className="w-full h-16 border border-borderColor rounded-xl px-4 py-2 focus:outline-none"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-[22px] font-medium mb-1">Email</label>
            <input
              type="email"
              placeholder="Masukkan E-mail pengguna"
              className="w-full h-16 border border-borderColor rounded-xl px-4 py-2 focus:outline-none"
            />
          </div>

          {/* Ketersediaan & Keahlian */}
          <div className="grid grid-cols-2 gap-6 ">
            {/* Ketersediaan */}
            <div className=" rounded-md  flex flex-col justify-start h-full">
              <label className="block font-semibold mb-4 text-[22px]">
                Ketersediaan
              </label>
              <div className="space-y-4">
                {/* Mulai */}
                <div className="flex items-center gap-4">
                  <label className="text-[18px] w-24">Mulai</label>
                  <div className="relative w-full">
                    <select className="w-full h-16 border rounded-xl px-4 pr-10 py-2 border-borderColor appearance-none focus:outline-none">
                      <option>08.00</option>
                      <option>09.00</option>
                      <option>10.00</option>
                    </select>
                    <ChevronDown className="w-5 h-5 text-gray-500 absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Berakhir */}
                <div className="flex items-center gap-4">
                  <label className="text-[18px] w-24">Berakhir</label>
                  <div className="relative w-full">
                    <select className="w-full h-16 border rounded-xl px-4 pr-10 py-2 border-borderColor appearance-none focus:outline-none">
                      <option>16.00</option>
                      <option>17.00</option>
                      <option>18.00</option>
                    </select>
                    <ChevronDown className="w-5 h-5 text-gray-500 absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Tanggal */}
                <div className="flex items-center gap-4">
                  <label className="text-[18px] w-24">Tanggal</label>
                  <input
                    type="date"
                    className="w-full h-16 border rounded-xl px-4 py-2 border-borderColor focus:outline-none"
                    defaultValue="2025-04-18"
                  />
                </div>
              </div>
            </div>

            {/* Keahlian */}
            <div className="rounded-md flex flex-col justify-start h-full">
              <label className="block font-semibold mb-4 text-[22px]">
                Keahlian
              </label>
              <div className="relative w-full">
                <select className="w-full h-16 border rounded-xl px-4 pr-10 py-2 border-borderColor appearance-none focus:outline-none">
                  <option value="">Masukkan Keahlian</option>
                  <option value="TOEFL">TOEFL</option>
                  <option value="Listening">Listening</option>
                  <option value="Reading">Reading</option>
                </select>
                <ChevronDown className="w-5 h-5 text-gray-500 absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}

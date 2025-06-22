import Layout from "../../../layouts/AdminView";

// icons
import { ChevronDown } from "lucide-react";

export default function TambahInstruktur() {
  return (
    <Layout
      title="Tambah Instruktur"
      note={"Masukkan data untuk menambahkan instructor baru"}
    >
      <div className="w-full py-2 ">
        {/* Form */}
        <form className="space-y-6">
          {/* Input Nama Lengkap */}
          <div>
            <label className="block text-[22px] font-semibold mb-1">
              Nama Lengkap
            </label>
            <input
              type="text"
              placeholder="Masukkan nama lengkap"
              className="w-full h-16 border border-borderColor rounded-xl px-4 py-2 focus:outline-none"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-[22px] font-semibold mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="Masukkan E-mail pengguna"
              className="w-full h-16 border border-borderColor rounded-xl px-4 py-2 focus:outline-none"
            />
          </div>

          {/* Keahlian */}
          <div className="rounded-md flex flex-col justify-start h-full">
            <label className="block font-semibold mb-4 text-[22px]">
              Keahlian
            </label>
            <div className="relative w-full">
              <select className="w-full h-16 border rounded-xl px-4 pr-10 py-2 border-borderColor appearance-none focus:outline-none">
                <option value="">Pilih keahlian</option>
                <option value="TOEFL">TOEFL</option>
                <option value="Listening">Listening</option>
                <option value="Reading">Reading</option>
              </select>
              <ChevronDown className="w-5 h-5 text-gray-500 absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-[22px] font-semibold mb-1">
              Username
            </label>
            <input
              type="text"
              placeholder="Masukkan username"
              className="w-full h-16 border border-borderColor rounded-xl px-4 py-2 focus:outline-none"
            />
          </div>

          {/* NIK/NIP */}
          <div>
            <label className="block text-[22px] font-semibold mb-1">
              NIK/NIP
            </label>
            <input
              type="text"
              placeholder="Masukkan username"
              className="w-full h-16 border border-borderColor rounded-xl px-4 py-2 focus:outline-none"
            />
          </div>

          {/* Unggah Foto */}
          <div>
            <label className="block text-[22px] font-semibold mb-1">Foto</label>
            <div className="flex items-center border border-borderColor rounded-xl overflow-hidden p-4">
              <label
                htmlFor="foto"
                className="bg-blue-600 rounded-md text-white px-4 py-2 text-sm font-medium cursor-pointer"
              >
                Unggah
              </label>
              <input
                id="foto"
                type="file"
                accept="image/*"
                className="flex-1 px-4 py-2 text-gray-500 text-sm focus:outline-none"
                placeholder="Masukkan foto"
              />
            </div>
          </div>

          {/* Ketersediaan */}
          <div className="grid grid-cols-2 gap-6 ">
            {/* Ketersediaan */}
            <div className="rounded-md flex flex-col justify-start h-full">
              <label className="block font-semibold mb-4 text-[22px]">
                Ketersediaan
              </label>

              {/* Grid 2 Kolom */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-[52rem]">
                {/* Kolom Kiri: Mulai & Berakhir */}
                <div className="space-y-4">
                  {/* Mulai */}
                  <div className="flex items-center gap-4">
                    <label className="text-[18px] w-24">Mulai</label>
                    <div className="relative w-full flex-1">
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
                    <div className="relative w-full flex-1">
                      <select className="w-full h-16 border rounded-xl px-4 pr-10 py-2 border-borderColor appearance-none focus:outline-none">
                        <option>16.00</option>
                        <option>17.00</option>
                        <option>18.00</option>
                      </select>
                      <ChevronDown className="w-5 h-5 text-gray-500 absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Kolom Kanan: Tanggal */}
                <div className="flex items-start gap-4 h-full">
                  <label className="text-[18px] w-24 mt-5">Tanggal</label>
                  <input
                    type="date"
                    className="w-full flex-1 h-16 border rounded-xl px-4 py-2 border-borderColor focus:outline-none"
                    defaultValue="2025-04-18"
                  />
                </div>
              </div>
            </div>
          </div>
          {/* button kirim undangan */}
          <div className="flex justify-end">
            <button className="bg-secondary text-white font-semibold text-[20px] py-3 px-8 rounded-lg hover:bg-secondary/80 duration-200">
              Kirim Undangan
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

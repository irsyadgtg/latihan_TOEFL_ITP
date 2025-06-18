import Layout from "../../../layouts/AdminView";
import StatusToggle from "../../../components/utils/StatusToggle";

export default function Aktivasi() {
  return (
    <Layout
      title="Atur Aktivasi Paket Kursus"
      note={"Mengubah status aktivasi paket kursus"}
    >
      <div className="w-full py-2 ">
        <StatusToggle />
        {/* Form */}
        <form className="space-y-6">
          {/* Input Nama Paket */}
          <div>
            <label className="block text-[22px] font-semibold mb-1">
              Nama Paket
            </label>
            <input
              type="text"
              placeholder="Masukkan nama lengkap"
              className="w-full h-16 border border-borderColor rounded-xl px-4 py-2 focus:outline-none"
              defaultValue="TOEFL ITP Preparation"
            />
          </div>

          {/* Input Harga */}
          <div>
            <label className="block text-[22px] font-semibold mb-1">
              Harga
            </label>
            <input
              type="text"
              placeholder="Masukkan harga (contoh: Rp. 250.000)"
              className="w-full h-16 border border-borderColor rounded-xl px-4 py-2 focus:outline-none"
              defaultValue="Rp100.000"
            />
          </div>

          {/* Input Fasilitas */}
          <div>
            <label className="block text-[22px] font-semibold mb-1">
              Harga
            </label>
            <input
              type="text"
              placeholder="Masukkan harga (contoh: Rp. 250.000)"
              className="w-full h-16 border border-borderColor rounded-xl px-4 py-2 focus:outline-none"
              defaultValue="Tersedia modul belajar, belajar permateri, dan bisa melakukan konsultasi dengan instruktur"
            />
          </div>

          {/* Ketentuan Paket Kursus (Masa Berlaku Paket Kursus) */}
          <div>
            <label className="block text-[22px] font-semibold mb-1">
              Ketentuan Paket Kursus Masa Berlaku Paket Kursus
            </label>
            <input
              type="text"
              className="w-full h-16 border rounded-xl px-4 py-2 border-borderColor focus:outline-none"
              defaultValue="2025-04-18"
            />
          </div>

          {/* Total Pengguna Paket Kursus */}
          <div>
            <label className="block text-[22px] font-semibold mb-1">
              Total Pengguna Paket Kursus
            </label>
            <input
              type="text"
              className="w-full h-16 border rounded-xl px-4 py-2 border-borderColor focus:outline-none"
              defaultValue="40"
            />
          </div>

          {/* button kirim undangan */}
          <div className="flex justify-end">
            <button className="bg-secondary w-[16rem] text-white font-semibold text-[20px] py-3 px-8 rounded-lg hover:bg-secondary/80 duration-200">
              Simpan
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

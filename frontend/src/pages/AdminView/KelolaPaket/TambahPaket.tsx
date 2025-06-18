import Layout from "../../../layouts/AdminView";

export default function Dashboard() {
  return (
    <Layout
      title="Tambah Paket Kursus"
      note={"Menambahkan paket kursus untuk disediakan kepada peserta"}
    >
      <div className="w-full py-2 ">
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
            />
          </div>

          {/* Input Fasilitas */}
          <div className="rounded-md flex flex-col justify-start h-full">
            <label className="block font-semibold mb-1 text-[22px]">
              Fasilitas
            </label>
            <div className="relative w-full">
              <select className="w-full h-16 border rounded-xl px-4 pr-10 py-2 border-borderColor appearance-none focus:outline-none">
                <option value="">Pilih keahlian</option>
                <option value="TOEFL">TOEFL</option>
                <option value="Listening">Listening</option>
                <option value="Reading">Reading</option>
              </select>
            </div>
          </div>

          {/* Ketentuan Paket Kursus (Masa Berlaku Paket Kursus) */}
          <div>
            <label className="block text-[22px] font-semibold mb-1">
              Ketentuan Paket Kursus (Masa Berlaku Paket Kursus
            </label>
            <input
              type="date"
              className="w-full h-16 border rounded-xl px-4 py-2 border-borderColor focus:outline-none"
              defaultValue="2025-04-18"
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

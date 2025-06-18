import Layout from "../../../layouts/AdminView";
import EditIcon from "../../../assets/icons/edit.svg";

export default function UbahDetail() {
  return (
    <Layout
      title="Ubah Daetail Paket Kursus"
      note={"Mengubah detail paket kursus untuk diperbaharui"}
    >
      <div className="w-full py-2 ">
        {/* Form */}
        <form className="space-y-6">
          {/* Input Nama Paket */}
          <div>
            <label className="block text-[22px] font-semibold mb-1">
              Nama Paket
            </label>

            <div className="flex items-center border border-borderColor rounded-xl px-4 h-16">
              <input
                type="text"
                placeholder="TOEFL ITP Preparation"
                className="flex-grow focus:outline-none"
              />
              <button className="ml-4 font-semibold flex items-center gap-4 bg-blue-500 text-white px-8 py-2 rounded-full hover:bg-blue-500/80 duration-200">
                <img className="w-[18px]" src={EditIcon} alt="" />
                Edit
              </button>
            </div>
          </div>

          {/* Harga */}
          <div>
            <label className="block text-[22px] font-semibold mb-1">
              Harga
            </label>

            <div className="flex items-center border border-borderColor rounded-xl px-4 h-16">
              <input
                type="text"
                placeholder="Rp100.000"
                className="flex-grow focus:outline-none"
              />
              <button className="ml-4 font-semibold flex items-center gap-4 bg-blue-500 text-white px-8 py-2 rounded-full hover:bg-blue-500/80 duration-200">
                <img className="w-[18px]" src={EditIcon} alt="" />
                Edit
              </button>
            </div>
          </div>

          {/* Fasilitas */}
          <div>
            <label className="block text-[22px] font-semibold mb-1">
              Fasilitas
            </label>

            <div className="flex items-center border border-borderColor rounded-xl px-4 h-16">
              <input
                type="text"
                placeholder="Tersedia modul belajar, belajar permateri, dan bisa melakukan konsultasi dengan instruktur"
                className="flex-grow focus:outline-none"
              />
              <button className="ml-4 font-semibold flex items-center gap-4 bg-blue-500 text-white px-8 py-2 rounded-full hover:bg-blue-500/80 duration-200">
                <img className="w-[18px]" src={EditIcon} alt="" />
                Edit
              </button>
            </div>
          </div>

          {/* Ketentuan Paket Kursus (Masa Berlaku Paket Kursus) */}
          <div>
            <label className="block text-[22px] font-semibold mb-1">
              Ketentuan Paket Kursus (Masa Berlaku Paket Kursus)
            </label>

            <div className="flex items-center border border-borderColor rounded-xl px-4 h-16">
              <input
                type="text"
                placeholder="20-09-2025"
                className="flex-grow focus:outline-none"
              />
              <button className="ml-4 font-semibold flex items-center gap-4 bg-blue-500 text-white px-8 py-2 rounded-full hover:bg-blue-500/80 duration-200">
                <img className="w-[18px]" src={EditIcon} alt="" />
                Edit
              </button>
            </div>
          </div>

          {/* Total Pengguna Paket Kursus */}
          <div>
            <label className="block text-[22px] font-semibold mb-1">
              Total Pengguna Paket Kursus
            </label>

            <div className="flex items-center border border-borderColor rounded-xl px-4 h-16">
              <input
                type="text"
                placeholder="40"
                className="flex-grow focus:outline-none"
              />
              <button className="ml-4 font-semibold flex items-center gap-4 bg-blue-500 text-white px-8 py-2 rounded-full hover:bg-blue-500/80 duration-200">
                <img className="w-[18px]" src={EditIcon} alt="" />
                Edit
              </button>
            </div>
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

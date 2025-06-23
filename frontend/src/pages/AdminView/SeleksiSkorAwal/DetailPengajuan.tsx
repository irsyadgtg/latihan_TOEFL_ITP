import { useState } from "react";

// icons
import dokumenIcon from "../../../assets/icons/dokumen.svg";
import { ChevronDown } from "lucide-react";

export default function DetailPengajuan() {
  const [status, setStatus] = useState("Pending");
  const [tanggal, setTanggal] = useState("");
  const [keterangan, setKeterangan] = useState("");

  return (
    <div className="w-full">
      <h2 className="text-[22px] font-semibold mb-4">Data Pengaju</h2>

      <div className="space-y-6 text-base">
        {/* Data Pengaju */}
        <div>
          <p className="font-semibold">Nama Pengaju</p>
          <p>John Doe</p>
        </div>
        <div>
          <p className="font-semibold">Email</p>
          <p>john@example.com</p>
        </div>
        <div>
          <p className="font-semibold">Timestamp</p>
          <p>2025-06-17 21:00</p>
        </div>
        <div>
          <p className="font-semibold text-[22px]">Besaran Skor</p>
          <p>90</p>
        </div>
        <div>
          <p className="font-semibold text-[22px]">Nama Tes yang Diikuti</p>
          <p>Tes Awal Satu</p>
        </div>

        {/* --- Bagian Dokumen Pendukung (lebar penuh, rata kanan) --- */}
        {/* Kontainer baru untuk Dokumen Pendukung agar rata kanan */}
        <div className="w-full ml-auto">
          <div>
            <p className="font-semibold text-[22px] mb-2">Dokumen Pendukung</p>
            {/* Lebar div dokumen pendukung diatur agar mengisi parent */}
            <div className="border rounded-lg px-4 py-6 flex items-center gap-4 w-full"> {/* py-6 untuk tinggi lebih */}
              <img src={dokumenIcon} alt="Dokumen" className="w-16 h-16" /> {/* Ikon lebih besar */}
              <p className="font-medium text-lg">Dokumen test EPRT</p> {/* Teks lebih besar */}
            </div>
          </div>
        </div>

        {/* Status Dropdown (tetap di kiri, lebar terkontrol) */}
        <div>
          <p className="font-semibold mb-1 text-[22px]">Status</p>
          <div className="relative w-[10rem] border border-gray-300 rounded-md"> {/* Tambahkan border dan rounded di sini */}
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full h-16 px-4 pr-10 py-2 appearance-none focus:outline-none bg-white" /* Tambahkan bg-white */
            >
              <option value="Pending">Pending</option>
              <option value="Disetujui">Disetujui</option>
              <option value="Ditolak">Ditolak</option>
            </select>
            <ChevronDown className="w-5 h-5 text-gray-500 absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* --- Input Tambahan Jika Status = Disetujui atau Ditolak (rata kanan, lebar penuh) --- */}
        {/* Kontainer baru untuk Masa Berlaku dan Keterangan agar rata kanan */}
        <div className="w-full ml-auto space-y-6"> 
          {(status === "Disetujui" || status === "Ditolak") && (
            <div>
              <p className="font-semibold text-[22px]">Masa Berlaku Dokumen</p>
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="mt-1 block w-full max-w-xs py-2 focus:outline-none border border-gray-300 rounded-md px-3" /* Tambahkan border, rounded, dan px-3 */
              />
            </div>
          )}

          {status === "Ditolak" && (
            <div>
              <p className="font-semibold text-[22px]">Keterangan</p>
              <textarea
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                rows={5} /* Perbesar baris default */
                className="mt-1 block w-full max-w-3xl rounded py-2 px-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base" /* Tambahkan border, rounded, dan px-3, max-w-3xl */
                placeholder="Tulis alasan penolakan..."
              />
            </div>
          )}
        </div>
        {/* --- Akhir Bagian Input Tambahan --- */}

        {/* Anda mungkin ingin menambahkan tombol Submit di sini, seperti di DetailTransaksi */}
        {/* Contoh: */}
        {/* <div className="mt-6 flex justify-end w-full">
          <button
            onClick={() => {
              console.log("Submit Pengajuan");
              console.log("Status:", status);
              console.log("Tanggal:", tanggal);
              console.log("Keterangan:", keterangan);
            }}
            className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition-colors"
          >
            Submit
          </button>
        </div> */}

      </div>
    </div>
  );
}
import { useState } from "react";
import Layout from "../../../layouts/AdminView";

// icons
import dokumenIcon from "../../../assets/icons/dokumen.svg";
import { ChevronDown } from "lucide-react";

export default function DetailPengajuan() {
  const [status, setStatus] = useState("Pending");
  const [tanggal, setTanggal] = useState("");
  const [keterangan, setKeterangan] = useState("");

  return (
    <Layout
      title="Detail Pengajuan"
      note={"Lihat detail pengajuan yang dilakukan oleh peserta"}
    >
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

          {/* Dokumen Pendukung */}
          <div>
            <p className="font-semibold text-[22px] mb-2">Dokumen Pendukung</p>
            <div className="border rounded-lg px-4 py-3 flex items-center gap-4 w-full sm:w-1/2">
              <img src={dokumenIcon} alt="Dokumen" className="w-12 h-12" />
              <p className="font-medium">Dokumen test EPRT</p>
            </div>
          </div>

          {/* Status Dropdown */}
          <div>
            <p className="font-semibold mb-1 text-[22px]">Status</p>
            <div className="relative w-[10rem]">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full h-16 px-4 pr-10 py-2 appearance-none focus:outline-none"
              >
                <option value="Pending">Pending</option>
                <option value="Disetujui">Disetujui</option>
                <option value="Ditolak">Ditolak</option>
              </select>
              <ChevronDown className="w-5 h-5 text-gray-500 absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Input Tambahan Jika Status = Disetujui atau Ditolak */}
          {(status === "Disetujui" || status === "Ditolak") && (
            <div>
              <p className="font-semibold text-[22px]">Masa Berlaku Dokumen</p>
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="mt-1 block w-full max-w-xs  py-2 focus:outline-none"
              />
            </div>
          )}

          {status === "Ditolak" && (
            <div>
              <p className="font-semibold text-[22px]">Keterangan</p>
              <textarea
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                rows={3}
                className="mt-1 block w-full max-w-xl rounded py-2 focus:outline-none"
                placeholder="Tulis alasan penolakan..."
              />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

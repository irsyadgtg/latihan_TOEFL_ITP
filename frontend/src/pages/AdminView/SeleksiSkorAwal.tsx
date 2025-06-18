import { useNavigate } from "react-router-dom";
import Layout from "../../layouts/AdminView";
import { skor } from "../../assets/data/seleksiSkorAwal"; //data dummy

// fungsi format rupiah
function formatRupiah(amount: number): string {
  return "Rp" + amount.toLocaleString("id-ID");
}

// fungsi format tanggal
function formatTimestamp(dateStr: string): string {
  const date = new Date(dateStr);
  const formattedDate = date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  return `08:00 – ${formattedDate}`;
}

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <Layout
      title="Daftar Pengajuan Skor Awal"
      note={""}
    >
      <div className="space-y-4">
        {skor.map((trx) => (
          <div
            key={trx.id}
            className="border border-borderColor rounded-xl p-4 shadow-sm bg-white"
          >
            <div className="grid grid-cols-7 gap-4 items-center">
              <div>
                <p className="text-gray-500 font-medium text-[12px]">
                  Nama Lengkap
                </p>
                <p className="font-semibold text-[16px]">{trx.name}</p>
              </div>
              <div>
                <p className="text-gray-500 font-medium text-[12px]">Email</p>
                <p className="font-semibold text-[16px]">{trx.email}</p>
              </div>
              <div>
                <p className="text-gray-500 font-medium">Status Pengajuan</p>
                <p
                  className={`font-semibold ${
                    trx.status === "Pending"
                      
                  }`}
                >
                  {trx.status}
                </p>
              </div>
              <div>
                <p className="text-gray-500 font-medium text-[12px]">
                  Timestamp
                </p>
                <p className="font-semibold text-[16px]">
                  {formatTimestamp(trx.date)}
                </p>
              </div>
              <div>
                <p className="text-gray-500 font-medium text-[12px]">
                  Masa Berlaku
                </p>
                <p className="font-semibold text-[16px]">
                  20/12/2025
                </p>
              </div>
              <div>
                <p className="text-gray-500 font-medium text-[12px]">
                  Keterangan
                </p>
                <p className="font-semibold text-[16px]">{trx.keterangan}</p>
              </div>
              <div>
                <button  onClick={() => navigate("/detailPengajuan")} className="px-5 py-2 border border-blue-500 rounded-md font-semibold text-blue-500 bg-white hover:bg-blue-50">Seleksi</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}

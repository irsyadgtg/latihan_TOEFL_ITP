import Layout from "../../layouts/AdminView";
import { transaksi } from "../../assets/data/riwayatTransaksi"; //data dummy


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
  return (
    <Layout
      title="Riwayat Transaksi Peserta Kursus"
      note={"Berisi data transaksi dari hasil peserta kursus yang mendaftar"}
    >
      <div className="space-y-4">
        {transaksi.map((trx) => (
          <div
            key={trx.id}
            className="border border-borderColor rounded-xl p-4 shadow-sm bg-white"
          >
            <div className="grid grid-cols-8 gap-4">
              <div>
                <p className="text-gray-500 font-medium text-[12px]">Nama Pengguna</p>
                <p className="font-semibold text-[16px]">{trx.name}</p>
              </div>
              <div>
                <p className="text-gray-500 font-medium text-[12px]">Nama Paket Kursus</p>
                <p className="font-semibold text-[16px]">{trx.coursePackage}</p>
              </div>
              <div>
                <p className="text-gray-500 font-medium text-[12px]">ID Transaksi</p>
                <p className="font-semibold text-[16px]">{trx.id}</p>
              </div>
              <div>
                <p className="text-gray-500 font-medium text-[12px]">Timestamp</p>
                <p className="font-semibold text-[16px]">{formatTimestamp(trx.date)}</p>
              </div>
              <div>
                <p className="text-gray-500 font-medium text-[12px]">Metode Pembayaran</p>
                <p className="font-semibold text-[16px]">{trx.paymentMethod}</p>
              </div>
              <div>
                <p className="text-gray-500 font-medium text-[12px]">Jumlah</p>
                <p className="font-semibold text-[16px]">
                  {trx.amount === 0 ? "Gratis" : formatRupiah(trx.amount)}
                </p>
              </div>
              <div>
                <p className="text-gray-500 font-medium text-[12px]">Status</p>
                <p
                  className={`font-semibold text-[16px]
                  }`}
                >
                  {trx.status}
                </p>
              </div>
              <div>
                <p className="text-gray-500 font-medium text-[12px]">Keterangan</p>
                <p className="font-semibold text-[16px]">{trx.keterangan}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}

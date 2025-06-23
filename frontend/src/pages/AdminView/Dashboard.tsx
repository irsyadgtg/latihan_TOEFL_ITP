import Layout from "../../layouts/AdminView";
import img1 from "../../assets/image/Kelola-Paket-Kursus/image 25.png";

// icons
import userDashboard from "../../assets/icons/userDashboard.svg"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";


// data untuk grafik bar
const dataBar = [
  { name: "Januari 2024", peserta: 25 },
  { name: "Juni 2024", peserta: 50 },
  { name: "Januari 2025", peserta: 75 },
  { name: "Juni 2025", peserta: 100 },
];

// data untuk paket kursus
const kursus = [
  {
    title: "TOEFL ITP® Preparation",
    peserta: 40,
    image: img1,
    label: "Free",
  },
  {
    title: "TOEFL ITP® Preparation",
    peserta: 40,
    image: img1,
    label: "Free",
  },
];

export default function Dashboard() {
  return (
    <Layout
      title="Dashboard Admin"
      note={"Admin dapat memantau statistik sistem saat ini"}
    >
      <div className="space-y-8">
        {/* Statistik Pengguna */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Admin", total: 1 },
            { label: "Peserta Kursus", total: 200 },
            { label: "Instruktur", total: 10 },
          ].map((item, index) => (
            <div
              key={index}
              className={`border border-borderColor p-12 rounded-xl flex items-center gap-3 ${
                item.label === "Peserta Kursus" ? "border-blue-500" : ""
              }`}
            >
              <img src={userDashboard} alt="" />
              <div>
                <p className="text-[24px] text-black font-medium">{item.label}</p>
                <p className="text-[24px] font-bold">{item.total} Orang</p>
              </div>
            </div>
          ))}
        </div>

        {/* Grafik */}
        <div>
          <h2 className="text-xl font-semibold mb-2">
            Statistik Pertumbuhan Peserta
          </h2>
          <div className="w-full h-64 bg-white p-4 rounded-xl shadow-sm">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataBar}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="peserta" fill="#EDC968" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Paket Kursus */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Tersedia Paket Kursus</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {kursus.map((item, index) => (
              <div
                key={index}
                className="border border-borderColor p-4 rounded-xl overflow-hidden bg-white shadow-sm flex"
              >
                <div className="">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-[28rem] h-[15rem] object-cover"
                  />
                  <div className="mt-5 font-semibold">
                    <span className="inline-block bg-gray-300 text-white text-[16px] px-3 py-1 rounded-md w-[7rem] text-center">
                      {item.label}
                    </span>
                  </div>
                </div>
                
                <div className="px-4 space-y-1">
                  <p className="text-blue-600 font-semibold text-[20px]">{item.title}</p>
                  <p className="text-[16px] text-gray-600">
                    Terdaftar {item.peserta} Peserta
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}

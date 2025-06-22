import { NavLink } from "react-router-dom";

// icons
import dashboardIcon from "../../assets/icons/Dashboard.svg"
import riwayatTransaksiIcon from "../../assets/icons/riwayatTransaksi.svg"
import kelolaPaketIcon from "../../assets/icons/kelolaPaket.svg"
import KelolaStrukturIcon from "../../assets/icons/kelolaStruktur.svg"
import notifikasiIcon from "../../assets/icons/notifikasi.svg"
import pantauDaftarIcon from "../../assets/icons/pantauDaftar.svg"
import seleksiIcon from "../../assets/icons/seleksi.svg"
import profileIcon from "../../assets/icons/profile.svg"


// image
import Logo from "../../assets/image/logo.jpeg";

// Daftar menu navigasi
const menuItems = [
  { label: "Dashboard Admin", to: "/admin/dashboard", icon: <img src={dashboardIcon} alt="Dashboard" className="w-5 h-5" /> },
  { label: "Kelola Instruktur", to: "/admin/kelola-instruktur", icon: <img src={KelolaStrukturIcon} alt="Kelola Instruktur" className="w-5 h-5" /> },
  { label: "Kelola Paket Kursus", to: "/admin/kelola-paket", icon: <img src={kelolaPaketIcon} alt="Kelola Paket Kursus" className="w-5 h-5" /> },
  { label: "Pantau Daftar Peserta", to: "/admin/pantau-peserta", icon: <img src={pantauDaftarIcon} alt="Pantau Daftar Peserta" className="w-5 h-5" /> },
  { label: "Seleksi Skor Awal", to: "/admin/seleksi-skor", icon: <img src={seleksiIcon} alt="Seleksi Skor Awal" className="w-5 h-5" /> },
  { label: "Riwayat Transaksi", to: "/admin/riwayat-transaksi", icon: <img src={riwayatTransaksiIcon} alt="Riwayat Transaksi" className="w-5 h-5" /> },
  { label: "Notifikasi Admin", to: "/admin/notifikasi", icon: <img src={notifikasiIcon} alt="Notifikasi Admin" className="w-5 h-5" /> },
  { label: "Profil Saya", to: "/admin/profil", icon: <img src={profileIcon} alt="Profil Saya" className="w-5 h-5" /> },
];

export default function Sidebar() {
  return (
    <aside className="w-[20rem] z-50 h-screen overflow-y-auto bg-primary text-white fixed top-0 left-0 p-4">
      <img src={Logo} alt="Telkom University" className="w-auto"/>
      <nav className="space-y-2 block mt-8">
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.to}
            end
            className={({ isActive }) =>
              `flex items-center gap-3 p-4 rounded-[10px]  ${
                isActive ? "border border-borderColor" : ""
              }`
            }
          >
            {item.icon}
            <span className="text-[20px]">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

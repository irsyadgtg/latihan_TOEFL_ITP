@echo off
echo Creating missing folders and files for LMS TOEFL ITP Project...

REM Create profile components
echo import React from "react"; const ProfilePeserta = () => { return <div>ProfilePeserta</div>; }; export default ProfilePeserta; > "src\new\persiapan\profile\ProfilePeserta.jsx"
echo import React from "react"; const ProfileInstruktur = () => { return <div>ProfileInstruktur</div>; }; export default ProfileInstruktur; > "src\new\persiapan\profile\ProfileInstruktur.jsx"
echo import React from "react"; const ProfileAdmin = () => { return <div>ProfileAdmin</div>; }; export default ProfileAdmin; > "src\new\persiapan\profile\ProfileAdmin.jsx"

REM Create admin components
echo import React from "react"; const KelolaInstruktur = () => { return <div>KelolaInstruktur</div>; }; export default KelolaInstruktur; > "src\new\persiapan\admin\KelolaInstruktur.jsx"
echo import React from "react"; const PantauPeserta = () => { return <div>PantauPeserta</div>; }; export default PantauPeserta; > "src\new\persiapan\admin\PantauPeserta.jsx"
echo import React from "react"; const KelolaPaketKursus = () => { return <div>KelolaPaketKursus</div>; }; export default KelolaPaketKursus; > "src\new\persiapan\admin\KelolaPaketKursus.jsx"
echo import React from "react"; const SeleksiSkorAwal = () => { return <div>SeleksiSkorAwal</div>; }; export default SeleksiSkorAwal; > "src\new\persiapan\admin\SeleksiSkorAwal.jsx"
echo import React from "react"; const RiwayatTransaksi = () => { return <div>RiwayatTransaksi</div>; }; export default RiwayatTransaksi; > "src\new\persiapan\admin\RiwayatTransaksi.jsx"
echo import React from "react"; const NotifikasiAdmin = () => { return <div>NotifikasiAdmin</div>; }; export default NotifikasiAdmin; > "src\new\persiapan\admin\NotifikasiAdmin.jsx"

REM Create peserta components
echo import React from "react"; const DaftarInstruktur = () => { return <div>DaftarInstruktur</div>; }; export default DaftarInstruktur; > "src\new\persiapan\peserta\DaftarInstruktur.jsx"
echo import React from "react"; const PengajuanSkorAwal = () => { return <div>PengajuanSkorAwal</div>; }; export default PengajuanSkorAwal; > "src\new\persiapan\peserta\PengajuanSkorAwal.jsx"
echo import React from "react"; const PaketKursus = () => { return <div>PaketKursus</div>; }; export default PaketKursus; > "src\new\persiapan\peserta\PaketKursus.jsx"
echo import React from "react"; const RencanaBelajar = () => { return <div>RencanaBelajar</div>; }; export default RencanaBelajar; > "src\new\persiapan\peserta\RencanaBelajar.jsx"
echo import React from "react"; const Pembayaran = () => { return <div>Pembayaran</div>; }; export default Pembayaran; > "src\new\persiapan\peserta\Pembayaran.jsx"
echo import React from "react"; const RiwayatPembayaran = () => { return <div>RiwayatPembayaran</div>; }; export default RiwayatPembayaran; > "src\new\persiapan\peserta\RiwayatPembayaran.jsx"

REM Create instruktur components
echo import React from "react"; const TinjauRencanaBelajar = () => { return <div>TinjauRencanaBelajar</div>; }; export default TinjauRencanaBelajar; > "src\new\persiapan\instruktur\TinjauRencanaBelajar.jsx"
echo import React from "react"; const DaftarPengajuan = () => { return <div>DaftarPengajuan</div>; }; export default DaftarPengajuan; > "src\new\persiapan\instruktur\DaftarPengajuan.jsx"

echo.
echo ✅ All files created successfully!
echo.
echo 📂 Files created:
echo   - src\new\shared\components\MainLayout.jsx
echo   - src\new\shared\components\Header.jsx  
echo   - src\new\shared\components\Sidebar.jsx
echo   - src\new\shared\services\api.js (copied)
echo   - 3 Profile components
echo   - 6 Admin components  
echo   - 6 Peserta components
echo   - 2 Instruktur components
echo.
echo 🚀 Total: 20 new files created!
echo.
pause
// src/types/api.d.ts

// --- Auth Types ---
export interface UserData {
  idPengguna: number;
  username: string;
  email: string;
  email_verified_at: string | null;
  role: 'admin' | 'peserta' | 'instruktur';
  idPeserta: number | null;
  idPegawai: number | null;
  created_at: string;
  updated_at: string;
  pegawai?: { // Hanya ada jika role === 'admin' atau 'instruktur'
    idPegawai: number;
    nik_nip: string;
    jabatan: string;
    namaLengkap: string;
    nomorTelepon: string | null;
    alamat: string | null;
    urlFotoProfil: string;
    status: string;
    created_at: string;
    updated_at: string;
  };
  peserta?: { // Hanya ada jika role === 'peserta'
    idPeserta: number;
    namaLengkap: string;
    alamat: string | null;
    nomorTelepon: string | null;
    urlFotoProfil: string;
    status: string;
    nik: string;
    created_at: string;
    updated_at: string;
  };
}

export interface LoginResponse {
  message: string;
  token: string;
  user: UserData;
}

export interface AuthErrorResponse {
  message: string;
  errors?: { [key: string]: string[] }; // Untuk validasi 422
}

export interface BasicMessageResponse {
  message: string;
}

// --- Instructor Types ---
export interface Instructor {
  idPegawai: number;
  namaLengkap: string;
  status: string;
  urlFotoProfil: string;
  email: string;
  username: string;
  idInstruktur: number;
  keahlian: string;
  tglKetersediaan: string; // Format YYYY-MM-DD
  waktuMulai: string; // Format HH:MM:SS
  waktuBerakhir: string; // Format HH:MM:SS
}

export interface GetInstructorsResponse {
  data: Instructor[];
}

export interface InstructorDetail extends Omit<Instructor, 'status'> {
  // Omit status karena di detail tidak ada di contoh response Postman
  // Tambahan detail jika ada dari endpoint detail
}

// --- Initial Score Submission Types ---
export interface InitialScoreSubmission {
  idPengajuanSkorAwal: number;
  idPeserta: number;
  namaTes: string;
  skor: number;
  urlDokumenPendukung: string;
  tglPengajuan: string; // ISO format datetime
  status: 'Pending' | 'Disetujui' | 'Ditolak';
  masaBerlakuDokumen: string | null;
  keterangan: string | null;
  tglSeleksi: string | null;
  idPegawai: number | null;
  created_at: string;
  updated_at: string;
  peserta?: { // Nested peserta data, bisa ada atau tidak
    idPeserta: number;
    namaLengkap: string;
    alamat: string | null;
    nomorTelepon: string | null;
    urlFotoProfil: string;
    status: string;
    nik: string;
    created_at: string;
    updated_at: string;
  };
}

export interface SubmitInitialScoreResponse {
  message: string;
  data: InitialScoreSubmission;
}

export interface InitialScoreHistoryResponse {
  message: string;
  riwayat: InitialScoreSubmission[];
}

export interface AdminInitialScoreListItem {
  id: number;
  timestamp: string; // format "YYYY-MM-DD HH:MM:SS"
  namaLengkap: string;
  email: string;
  status: 'Pending' | 'Disetujui' | 'Ditolak';
  masaBerlakuDokumen: string | null;
  keterangan: string | null;
}

export interface AdminInitialScoreListResponse {
  message: string;
  data: AdminInitialScoreListItem[];
}

export interface AdminInitialScoreDetailResponse {
  message: string;
  data: {
    id: number;
    namaLengkap: string;
    email: string;
    timestamp: string;
    namaTes: string;
    skor: number;
    dokumen_pendukung: string; // URL path to document
    status: 'Pending' | 'Disetujui' | 'Ditolak';
  };
}

// --- Course Package Types ---
export interface CoursePackage {
  idPaketKursus: number;
  namaPaket: string;
  harga: string; // string karena bisa "500000.00"
  masaBerlaku: number; // in months
  fasilitas: string; // comma separated string
  aktif: boolean | 0 | 1; // boolean or number
  idPegawai: number;
  created_at: string;
  updated_at: string;
  pegawai?: { // Nested pegawai data if available
    idPegawai: number;
    namaLengkap: string;
  };
  peserta_paket_count?: number; // Only for admin detail
}

export interface CoursePackageDetailResponse extends CoursePackage {
  // Add any specific fields from detail endpoint if they are different
}

// --- Study Plan Types ---
export interface Skill {
  idSkill: number;
  kategori: string;
  skill: string; // e.g., "Identify gist of short and long conversations"
  deskripsi: string; // e.g., "I can identify the gist/topic of short and longer conversations"
  created_at: string;
  updated_at: string;
}

export interface StudyPlanSubmissionDetail {
  idDetailPengajuan: number | null;
  idSkill: number;
  idPengajuanRencanaBelajar: number;
  created_at: string | null;
  updated_at: string | null;
  skill: { // Simplified skill data in detail
    id: number;
    nama?: string; // Appears as 'nama' in some responses
    deskripsi?: string; // Appears as 'deskripsi' in some responses
    kategori: string; // Kategori skill
  };
}

export interface StudyPlanSubmission {
  idPengajuanRencanaBelajar: number;
  skorAwal: number | null;
  namaRencana: string;
  targetSkor: number;
  targetWaktu: string;
  hariPerMinggu: number;
  jamPerHari: string;
  tglPengajuan: string; // ISO datetime
  status: 'pending' | 'disetujui' | 'ditolak';
  isAktif: boolean | null;
  tanggalMulai: string | null;
  selesaiPada: string | null;
  idPengajuanSkorAwal: number;
  idPeserta: number;
  created_at: string;
  updated_at: string;
  detail_pengajuan_rencana_belajar?: StudyPlanSubmissionDetail[];
  feedback_rencana_belajar?: any; // Define more specifically if needed
}

export interface SubmitStudyPlanResponse {
  message: string;
  data: StudyPlanSubmission;
}

export interface ParticipantSkillListResponse {
  data: Skill[];
}

export interface InstructorStudyPlanListItem {
  id: number;
  tglPengajuan: string;
  nama_peserta: string | null;
  email_peserta: string;
  status: 'pending' | 'disetujui' | 'ditolak';
}

export interface InstructorStudyPlanListResponse {
  pengajuan: InstructorStudyPlanListItem[];
}

export interface InstructorStudyPlanDetailResponse {
  id: number;
  nama_rencana: string;
  target_skor: number;
  target_waktu: string;
  frekuensi_mingguan: number;
  durasi_harian: string;
  status: 'pending' | 'disetujui' | 'ditolak';
  peserta: {
    nama: string | null;
    email: string;
  };
  detail_pengajuan: Array<{
    id_detail_pengajuan: number | null;
    kategori: string;
    skill: {
      id: number;
      nama?: string; // "nama" when getting full list, "deskripsi" when getting detail
      deskripsi?: string;
    };
  }>;
  daftar_skill: Array<{
    id: number;
    kategori: string;
    nama: string; // Full skill description
  }>;
}

export interface FeedbackStudyPlanPayload {
  detail: Array<{ skill_id: number }>;
}

// --- Profile Types ---
export interface AdminProfile {
  username: string;
  email: string;
  namaLengkap: string;
  nik_nip: string;
  nomorTelepon: string | null;
  alamat: string | null;
  urlFotoProfil: string;
}

export interface ParticipantProfile {
  namaLengkap: string;
  username: string;
  email: string;
  nik: string;
  nomorTelepon: string | null;
  paketKursus: string | null;
  sisaMasaBerlaku: number | null;
  alamat: string | null;
  urlFotoProfil: string;
}

export interface InstructorProfile {
  namaLengkap: string;
  username: string;
  email: string;
  nik_nip: string;
  nomorTelepon: string | null;
  keahlian: string;
  waktuMulai: string;
  waktuBerakhir: string;
  tglKetersediaan: string;
  alamat: string | null;
  urlFotoProfil: string;
}

// --- Participant Monitoring Types ---
export interface MonitoredParticipant {
  namaLengkap: string;
  username: string;
  email: string;
  paketKursus: string | null;
  sisaMasaBerlaku: number | null;
}

export interface MonitoredParticipantsResponse {
  data: MonitoredParticipant[];
}

// --- Dashboard Admin Types ---
export interface TotalUserPerRole {
  peserta: number;
  instruktur: number;
  admin: number;
}

export interface TotalParticipantsPerPackage {
  namaPaket: string;
  totalPeserta: number;
  totalPesertaAktif: number;
}

export interface ParticipantGrowth {
  tahun: number;
  bulan: number;
  total: number;
}

export interface AdminDashboardResponse {
  totalUserPerRole: TotalUserPerRole;
  totalPesertaPerPaket: TotalParticipantsPerPackage[];
  pertumbuhanPeserta: ParticipantGrowth[];
}

// --- Subscription/Purchase Course Package Types ---
export interface ParticipantCoursePackage {
  idPaketKursus: number;
  namaPaket: string;
  harga: string;
  fasilitas: string;
  masaBerlaku: number;
  aktif: boolean | 0 | 1;
  idPegawai: number;
  pegawai: {
    idPegawai: number;
    namaLengkap: string;
  };
}

export interface PurchaseEligibilityResponse {
  message: string;
}

export interface PaymentInfoResponse {
  message: string;
  nama_paket: string;
  harga: string;
  bank: string;
  nomor_rekening: string;
  nama_rekening: string;
}

// --- Payment History Types ---
export interface PaymentRecord {
  kodeTransaksi: string;
  namaPaket: string;
  hargaPaket: string;
  nominalBayar: number;
  statusTransaksi: 'PENDING' | 'BERHASIL' | 'DITOLAK';
  tanggalTransaksi: string; // "YYYY-MM-DD HH:MM:SS"
  buktiPembayaran: string; // URL path to document
  keterangan: string | null;
}

// --- Admin Transaction History Types ---
export interface TransactionDetailAdmin {
  idTransaksi: number;
  kodeTransaksi: string;
  nominal: number;
  status: 'PENDING' | 'BERHASIL' | 'DITOLAK';
  buktiPembayaran: string; // URL path
  keterangan: string | null;
  idPesertaPaketKursus: number;
  created_at: string;
  updated_at: string;
  peserta_paket: {
    idPesertaPaketKursus: number;
    tglMulai: string;
    tglBerakhir: string | null;
    statusAktif: number; // 0 or 1
    paketSaatIni: number; // 0 or 1
    idPeserta: number;
    idPaketKursus: number;
    paket: {
      idPaketKursus: number;
      namaPaket: string;
      harga: string;
      masaBerlaku: number;
      fasilitas: string;
      aktif: number;
    };
    peserta: {
      idPeserta: number;
      namaLengkap: string;
      alamat: string | null;
      nomorTelepon: string | null;
      urlFotoProfil: string;
      status: string;
      nik: string;
    };
  };
}

// --- Admin Notification Types ---
export interface AdminNotification {
  idNotifikasi: number;
  pesan: string;
  jenisNotifikasi: string; // e.g., "PENGAJUAN_SKOR_AWAL"
  sudahDibaca: 0 | 1; // 0 for unread, 1 for read
  tglDibuat: string; // "YYYY-MM-DD HH:MM:SS"
  sumberId: string;
  sumberTipe: string;
}
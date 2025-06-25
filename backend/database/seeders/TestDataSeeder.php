<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class TestDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Buat Pegawai (Admin & 3 Instruktur) - cek duplicate
        $existingAdmin = DB::table('pegawai')->where('nik_nip', 'ADM001')->first();
        if ($existingAdmin) {
            $pegawaiAdmin = $existingAdmin->idPegawai;
            echo "   - Pegawai Admin sudah ada (NIK: ADM001), skip...\n";
        } else {
            $pegawaiAdmin = DB::table('pegawai')->insertGetId([
                'nik_nip' => 'ADM001',
                'jabatan' => 'Administrator',
                'namaLengkap' => 'Admin System',
                'nomorTelepon' => '081234567890',
                'alamat' => 'Jl. Admin No. 1',
                'urlFotoProfil' => null,
                'status' => 'aktif',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);
            echo "   - Pegawai Admin berhasil dibuat (NIK: ADM001)\n";
        }

        // NEW: Create 3 Instructors
        $instrukturData = [
            [
                'nik_nip' => 'INS001',
                'namaLengkap' => 'Dr. Jane Smith',
                'nomorTelepon' => '081234567891',
                'alamat' => 'Jl. Instruktur No. 1',
                'keahlian' => 'TOEFL ITP Listening & Structure',
                'waktuMulai' => '08:00:00',
                'waktuBerakhir' => '16:00:00',
                'username' => 'instruktur1',
                'email' => 'jane.smith@lms.com'
            ],
            [
                'nik_nip' => 'INS002',
                'namaLengkap' => 'Prof. Ahmad Rahman',
                'nomorTelepon' => '081234567892',
                'alamat' => 'Jl. Instruktur No. 2',
                'keahlian' => 'TOEFL ITP Reading & Vocabulary',
                'waktuMulai' => '09:00:00',
                'waktuBerakhir' => '17:00:00',
                'username' => 'instruktur2',
                'email' => 'ahmad.rahman@lms.com'
            ],
            [
                'nik_nip' => 'INS003',
                'namaLengkap' => 'Ms. Sarah Wilson',
                'nomorTelepon' => '081234567893',
                'alamat' => 'Jl. Instruktur No. 3',
                'keahlian' => 'TOEFL ITP Grammar & Writing',
                'waktuMulai' => '13:00:00',
                'waktuBerakhir' => '21:00:00',
                'username' => 'instruktur3',
                'email' => 'sarah.wilson@lms.com'
            ]
        ];

        $pegawaiInstrukturIds = [];
        $instrukturIds = [];

        foreach ($instrukturData as $index => $data) {
            // Create Pegawai Instruktur
            $existingPegawai = DB::table('pegawai')->where('nik_nip', $data['nik_nip'])->first();
            if ($existingPegawai) {
                $pegawaiInstrukturIds[] = $existingPegawai->idPegawai;
                echo "   - Pegawai {$data['namaLengkap']} sudah ada (NIK: {$data['nik_nip']}), skip...\n";
            } else {
                $pegawaiInstrukturIds[] = DB::table('pegawai')->insertGetId([
                    'nik_nip' => $data['nik_nip'],
                    'jabatan' => 'Instruktur',
                    'namaLengkap' => $data['namaLengkap'],
                    'nomorTelepon' => $data['nomorTelepon'],
                    'alamat' => $data['alamat'],
                    'urlFotoProfil' => null,
                    'status' => 'aktif',
                    'created_at' => Carbon::now(),
                    'updated_at' => Carbon::now(),
                ]);
                echo "   - Pegawai {$data['namaLengkap']} berhasil dibuat (NIK: {$data['nik_nip']})\n";
            }

            // Create Instruktur Record
            $existingInstruktur = DB::table('instruktur')->where('idPegawai', $pegawaiInstrukturIds[$index])->first();
            if ($existingInstruktur) {
                $instrukturIds[] = $existingInstruktur->idInstruktur;
                echo "   - Record Instruktur {$data['namaLengkap']} sudah ada, skip...\n";
            } else {
                $instrukturIds[] = DB::table('instruktur')->insertGetId([
                    'keahlian' => $data['keahlian'],
                    'waktuMulai' => $data['waktuMulai'],
                    'waktuBerakhir' => $data['waktuBerakhir'],
                    'tglKetersediaan' => Carbon::today(), // TODAY for testing
                    'idPegawai' => $pegawaiInstrukturIds[$index],
                    'created_at' => Carbon::now(),
                    'updated_at' => Carbon::now(),
                ]);
                echo "   - Record Instruktur {$data['namaLengkap']} berhasil dibuat\n";
            }
        }

        // 2. Buat Peserta Kursus (cek duplicate dulu)
        $pesertaIds = [];
        $timestamp = Carbon::now()->format('YmdHis');
        $namaPeserta = [
            ['nama' => 'John Doe', 'nik' => '1234567890123456', 'email' => 'john@example.com'],
            ['nama' => 'Jane Wilson', 'nik' => '1234567890123457', 'email' => 'jane@example.com'],
            ['nama' => 'Bob Johnson', 'nik' => '1234567890123458', 'email' => 'bob@example.com'],
            ['nama' => 'Alice Brown', 'nik' => '1234567890123459', 'email' => 'alice@example.com'],
            ['nama' => 'Charlie Davis', 'nik' => '1234567890123460', 'email' => 'charlie@example.com'],
        ];

        foreach ($namaPeserta as $index => $peserta) {
            // Generate unique NIK dengan timestamp untuk avoid duplicate
            $uniqueNik = $peserta['nik'] . $timestamp . $index;
            
            // Cek apakah peserta sudah ada berdasarkan email
            $existingPeserta = DB::table('peserta_kursus')
                ->join('pengguna', 'peserta_kursus.idPeserta', '=', 'pengguna.idPeserta')
                ->where('pengguna.email', $peserta['email'])
                ->first();

            if ($existingPeserta) {
                $pesertaIds[] = $existingPeserta->idPeserta;
                echo "   - Peserta {$peserta['nama']} sudah ada, skip...\n";
            } else {
                $pesertaIds[] = DB::table('peserta_kursus')->insertGetId([
                    'namaLengkap' => $peserta['nama'],
                    'alamat' => 'Jl. Peserta No. ' . ($index + 1),
                    'nomorTelepon' => '0812345678' . (90 + $index),
                    'urlFotoProfil' => null,
                    'status' => 'aktif',
                    'nik' => $uniqueNik,
                    'created_at' => Carbon::now(),
                    'updated_at' => Carbon::now(),
                ]);
                echo "   - Peserta {$peserta['nama']} berhasil dibuat\n";
            }
        }

        // 3. Buat Pengguna (Admin & 3 Instruktur & Peserta)
        // Admin
        $existingAdmin = DB::table('pengguna')->where('email', 'admin@lms.com')->orWhere('username', 'admin')->first();
        if (!$existingAdmin) {
            DB::table('pengguna')->insert([
                'username' => 'admin',
                'email' => 'admin@lms.com',
                'email_verified_at' => Carbon::now(),
                'password' => Hash::make('password'),
                'role' => 'admin',
                'idPeserta' => null,
                'idPegawai' => $pegawaiAdmin,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);
            echo "   - Admin user berhasil dibuat (admin@lms.com)\n";
        } else {
            echo "   - Admin user sudah ada ({$existingAdmin->email}), skip...\n";
        }

        // Create 3 Instruktur Users
        foreach ($instrukturData as $index => $data) {
            $existingInstrukturUser = DB::table('pengguna')
                ->where('email', $data['email'])
                ->orWhere('username', $data['username'])
                ->first();
                
            if (!$existingInstrukturUser) {
                DB::table('pengguna')->insert([
                    'username' => $data['username'],
                    'email' => $data['email'],
                    'email_verified_at' => Carbon::now(),
                    'password' => Hash::make('password'),
                    'role' => 'instruktur',
                    'idPeserta' => null,
                    'idPegawai' => $pegawaiInstrukturIds[$index],
                    'created_at' => Carbon::now(),
                    'updated_at' => Carbon::now(),
                ]);
                echo "   - Instruktur user {$data['namaLengkap']} berhasil dibuat ({$data['email']})\n";
            } else {
                echo "   - Instruktur user {$data['namaLengkap']} sudah ada ({$existingInstrukturUser->email}), skip...\n";
                
                // Update idPegawai if user exists but linked to wrong pegawai
                if ($existingInstrukturUser->idPegawai != $pegawaiInstrukturIds[$index]) {
                    DB::table('pengguna')
                        ->where('idPengguna', $existingInstrukturUser->idPengguna)
                        ->update(['idPegawai' => $pegawaiInstrukturIds[$index]]);
                    echo "   - Fixed instruktur user linkage untuk {$data['namaLengkap']}\n";
                }
            }
        }

        // Peserta Users
        foreach ($pesertaIds as $index => $pesertaId) {
            $username = 'peserta' . ($index + 1);
            $existingPesertaUser = DB::table('pengguna')->where('email', $namaPeserta[$index]['email'])->orWhere('username', $username)->first();
            if (!$existingPesertaUser) {
                DB::table('pengguna')->insert([
                    'username' => $username,
                    'email' => $namaPeserta[$index]['email'],
                    'email_verified_at' => Carbon::now(),
                    'password' => Hash::make('password'),
                    'role' => 'peserta',
                    'idPeserta' => $pesertaId,
                    'idPegawai' => null,
                    'created_at' => Carbon::now(),
                    'updated_at' => Carbon::now(),
                ]);
                echo "   - User {$namaPeserta[$index]['nama']} berhasil dibuat\n";
            } else {
                echo "   - User {$namaPeserta[$index]['nama']} sudah ada, skip...\n";
            }
        }

        // 4. Buat Pengajuan Skor Awal (semua disetujui) - cek duplicate
        $skorAwalIds = [];
        foreach ($pesertaIds as $index => $pesertaId) {
            // Cek apakah peserta sudah punya skor awal yang disetujui
            $existingSkor = DB::table('pengajuan_skor_awal')
                ->where('idPeserta', $pesertaId)
                ->where('status', 'Disetujui')
                ->first();

            if ($existingSkor) {
                $skorAwalIds[] = $existingSkor->idPengajuanSkorAwal;
                echo "   - Skor awal {$namaPeserta[$index]['nama']} sudah ada, skip...\n";
            } else {
                $skorAwalIds[] = DB::table('pengajuan_skor_awal')->insertGetId([
                    'namaTes' => 'TOEFL ITP Official Test',
                    'skor' => rand(400, 500), // skor random 400-500
                    'urlDokumenPendukung' => 'dokumen-pendukung/test-document-' . ($index + 1) . '.pdf',
                    'tglPengajuan' => Carbon::now()->subDays(rand(10, 30)),
                    'status' => 'Disetujui',
                    'masaBerlakuDokumen' => Carbon::now()->addMonths(6),
                    'keterangan' => null,
                    'tglSeleksi' => Carbon::now()->subDays(rand(5, 15)),
                    'idPeserta' => $pesertaId,
                    'idPegawai' => $pegawaiAdmin,
                    'created_at' => Carbon::now(),
                    'updated_at' => Carbon::now(),
                ]);
                echo "   - Skor awal {$namaPeserta[$index]['nama']} berhasil dibuat\n";
            }
        }

        // 5. Buat Pengajuan Rencana Belajar - cek duplicate
        $rencanaIds = [];
        $targetWaktuOptions = ['2 minggu', '3 minggu', '1 bulan'];
        $durasiOptions = ['<1 jam', '<2 jam', '2-3 jam'];

        foreach ($pesertaIds as $index => $pesertaId) {
            // Cek apakah peserta sudah punya rencana belajar dengan feedback
            $existingRencana = DB::table('pengajuan_rencana_belajar')
                ->where('idPeserta', $pesertaId)
                ->where('status', 'sudah ada feedback')
                ->first();

            if ($existingRencana) {
                $rencanaIds[] = $existingRencana->idPengajuanRencanaBelajar;
                echo "   - Rencana belajar {$namaPeserta[$index]['nama']} sudah ada, skip...\n";
            } else {
                $targetWaktu = $targetWaktuOptions[array_rand($targetWaktuOptions)];
                $tanggalMulai = Carbon::now()->subDays(rand(1, 7));
                $tanggalSelesai = match ($targetWaktu) {
                    '2 minggu' => $tanggalMulai->copy()->addWeeks(2),
                    '3 minggu' => $tanggalMulai->copy()->addWeeks(3),
                    '1 bulan' => $tanggalMulai->copy()->addMonth(),
                };

                $rencanaIds[] = DB::table('pengajuan_rencana_belajar')->insertGetId([
                    'namaRencana' => 'Rencana Belajar TOEFL - ' . $tanggalMulai->format('d F Y') . ' - Target Skor ' . rand(500, 600),
                    'targetSkor' => rand(500, 600),
                    'targetWaktu' => $targetWaktu,
                    'hariPerMinggu' => rand(3, 7),
                    'jamPerHari' => $durasiOptions[array_rand($durasiOptions)],
                    'tglPengajuan' => $tanggalMulai,
                    'status' => 'sudah ada feedback',
                    'isAktif' => true,
                    'tanggalMulai' => $tanggalMulai,
                    'selesaiPada' => $tanggalSelesai,
                    'idPengajuanSkorAwal' => $skorAwalIds[$index],
                    'idPeserta' => $pesertaId,
                    'created_at' => Carbon::now(),
                    'updated_at' => Carbon::now(),
                ]);
                echo "   - Rencana belajar {$namaPeserta[$index]['nama']} berhasil dibuat\n";
            }
        }

        // 6. Buat Detail Pengajuan Rencana Belajar (skill yang diminta peserta - random) - cek duplicate
        foreach ($rencanaIds as $index => $rencanaId) {
            // Cek apakah detail pengajuan sudah ada
            $existingDetail = DB::table('detail_pengajuan_rencana_belajar')
                ->where('idPengajuanRencanaBelajar', $rencanaId)
                ->first();

            if (!$existingDetail) {
                $skillsRequested = collect(range(1, 26))->random(rand(5, 10))->toArray();
                
                foreach ($skillsRequested as $skillId) {
                    DB::table('detail_pengajuan_rencana_belajar')->insert([
                        'idSkill' => $skillId,
                        'idPengajuanRencanaBelajar' => $rencanaId,
                        'created_at' => Carbon::now(),
                        'updated_at' => Carbon::now(),
                    ]);
                }
                echo "   - Detail pengajuan {$namaPeserta[$index]['nama']} berhasil dibuat\n";
            } else {
                echo "   - Detail pengajuan {$namaPeserta[$index]['nama']} sudah ada, skip...\n";
            }
        }

        // 7. Buat Feedback Rencana Belajar - UPDATED: Distribute among 3 instructors
        $feedbackIds = [];
        foreach ($rencanaIds as $index => $rencanaId) {
            // Cek apakah feedback sudah ada
            $existingFeedback = DB::table('feedback_rencana_belajar')
                ->where('idPengajuanRencanaBelajar', $rencanaId)
                ->first();

            if ($existingFeedback) {
                $feedbackIds[] = $existingFeedback->idFeedbackRencanaBelajar;
                echo "   - Feedback {$namaPeserta[$index]['nama']} sudah ada, skip...\n";
            } else {
                // DISTRIBUTE: Round-robin assign to 3 instructors
                $assignedInstrukturId = $instrukturIds[$index % 3];
                
                $feedbackIds[] = DB::table('feedback_rencana_belajar')->insertGetId([
                    'tglPemberianFeedback' => Carbon::now()->subDays(rand(1, 5)),
                    'idPengajuanRencanaBelajar' => $rencanaId,
                    'idInstruktur' => $assignedInstrukturId,
                    'created_at' => Carbon::now(),
                    'updated_at' => Carbon::now(),
                ]);
                echo "   - Feedback {$namaPeserta[$index]['nama']} berhasil dibuat (assigned to instruktur " . ($index % 3 + 1) . ")\n";
            }
        }

        // 8. Buat Detail Feedback Rencana Belajar (skill final yang diberikan - random dari yang diminta) - cek duplicate
        foreach ($feedbackIds as $index => $feedbackId) {
            // Cek apakah detail feedback sudah ada
            $existingDetailFeedback = DB::table('detail_feedback_rencana_belajar')
                ->where('idFeedbackRencanaBelajar', $feedbackId)
                ->first();

            if (!$existingDetailFeedback) {
                // Ambil skill yang diminta peserta untuk rencana ini
                $skillsRequested = DB::table('detail_pengajuan_rencana_belajar')
                    ->where('idPengajuanRencanaBelajar', $rencanaIds[$index])
                    ->pluck('idSkill')
                    ->toArray();

                // Instruktur pilih sebagian dari yang diminta (atau bisa tambah skill lain)
                $skillsGiven = collect($skillsRequested)->random(rand(3, min(8, count($skillsRequested))))->toArray();
                
                // Tambah kemungkinan skill tambahan dari instruktur
                if (rand(1, 100) <= 30) { // 30% chance instruktur tambah skill lain
                    $additionalSkills = collect(range(1, 26))
                        ->diff($skillsGiven)
                        ->random(rand(1, 3))
                        ->toArray();
                    $skillsGiven = array_merge($skillsGiven, $additionalSkills);
                }

                foreach ($skillsGiven as $skillId) {
                    DB::table('detail_feedback_rencana_belajar')->insert([
                        'idSkill' => $skillId,
                        'idFeedbackRencanaBelajar' => $feedbackId,
                        'created_at' => Carbon::now(),
                        'updated_at' => Carbon::now(),
                    ]);
                }
                echo "   - Detail feedback {$namaPeserta[$index]['nama']} berhasil dibuat\n";
            } else {
                echo "   - Detail feedback {$namaPeserta[$index]['nama']} sudah ada, skip...\n";
            }
        }

        echo "\n✅ Test data seeder completed!\n";
        echo "📊 Summary:\n";
        echo "   - " . count($pesertaIds) . " peserta data\n";
        echo "   - " . count($skorAwalIds) . " skor awal data\n";
        echo "   - " . count($rencanaIds) . " rencana belajar data\n";
        echo "   - " . count($feedbackIds) . " feedback data\n";
        echo "   - 1 admin, 3 instruktur\n";
        echo "\n🔑 Login credentials:\n";
        echo "   Admin: admin@lms.com / password\n";
        echo "   Instruktur 1: jane.smith@lms.com / password (Dr. Jane Smith - Listening & Structure - 08:00-16:00)\n";
        echo "   Instruktur 2: ahmad.rahman@lms.com / password (Prof. Ahmad Rahman - Reading & Vocabulary - 09:00-17:00)\n";
        echo "   Instruktur 3: sarah.wilson@lms.com / password (Ms. Sarah Wilson - Grammar & Writing - 13:00-21:00)\n";
        foreach ($namaPeserta as $index => $peserta) {
            echo "   Peserta" . ($index + 1) . ": " . $peserta['email'] . " / password\n";
        }
        echo "\n🕒 Instructor Availability (TODAY - " . Carbon::today() . "):\n";
        echo "   - Dr. Jane Smith: 08:00-16:00 (Available for consultation)\n";
        echo "   - Prof. Ahmad Rahman: 09:00-17:00 (Available for consultation)\n";
        echo "   - Ms. Sarah Wilson: 13:00-21:00 (Available for consultation)\n";
        echo "\n📋 Check instructor mapping:\n";
        echo "   SELECT u.username, u.email, p.namaLengkap, i.keahlian, i.waktuMulai, i.waktuBerakhir\n";
        echo "   FROM pengguna u\n";
        echo "   JOIN pegawai p ON u.idPegawai = p.idPegawai\n";
        echo "   JOIN instruktur i ON p.idPegawai = i.idPegawai\n";
        echo "   WHERE u.role = 'instruktur';\n";
    }
}
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
        // 1. Buat Pegawai (Admin & Instruktur) - cek duplicate
        $existingAdmin = DB::table('pegawai')->where('nik_nip', 'ADM001')->first();
        if ($existingAdmin) {
            $pegawaiAdmin = $existingAdmin->idPegawai;
            echo "   - Pegawai Admin sudah ada, skip...\n";
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
            echo "   - Pegawai Admin berhasil dibuat\n";
        }

        $existingInstrukturPegawai = DB::table('pegawai')->where('nik_nip', 'INS001')->first();
        if ($existingInstrukturPegawai) {
            $pegawaiInstruktur = $existingInstrukturPegawai->idPegawai;
            echo "   - Pegawai Instruktur sudah ada, skip...\n";
        } else {
            $pegawaiInstruktur = DB::table('pegawai')->insertGetId([
                'nik_nip' => 'INS001',
                'jabatan' => 'Instruktur',
                'namaLengkap' => 'Dr. Jane Smith',
                'nomorTelepon' => '081234567891',
                'alamat' => 'Jl. Instruktur No. 2',
                'urlFotoProfil' => null,
                'status' => 'aktif',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);
            echo "   - Pegawai Instruktur berhasil dibuat\n";
        }

        // 2. Buat Instruktur - cek duplicate
        $existingInstruktur = DB::table('instruktur')->where('idPegawai', $pegawaiInstruktur)->first();
        if ($existingInstruktur) {
            $instrukturId = $existingInstruktur->idInstruktur;
            echo "   - Instruktur sudah ada, skip...\n";
        } else {
            $instrukturId = DB::table('instruktur')->insertGetId([
                'keahlian' => 'TOEFL ITP Training',
                'waktuMulai' => '08:00:00',
                'waktuBerakhir' => '17:00:00',
                'tglKetersediaan' => Carbon::today(),
                'idPegawai' => $pegawaiInstruktur,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);
            echo "   - Instruktur berhasil dibuat\n";
        }

        // 3. Buat Peserta Kursus (cek duplicate dulu)
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

        // 4. Buat Pengguna (Admin, Instruktur, Peserta)
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
            echo "   - Admin user berhasil dibuat\n";
        } else {
            echo "   - Admin user sudah ada, skip...\n";
        }

        // Instruktur
        $existingInstruktur = DB::table('pengguna')->where('email', 'instruktur@lms.com')->orWhere('username', 'instruktur')->first();
        if (!$existingInstruktur) {
            DB::table('pengguna')->insert([
                'username' => 'instruktur',
                'email' => 'instruktur@lms.com',
                'email_verified_at' => Carbon::now(),
                'password' => Hash::make('password'),
                'role' => 'instruktur',
                'idPeserta' => null,
                'idPegawai' => $pegawaiInstruktur,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);
            echo "   - Instruktur user berhasil dibuat\n";
        } else {
            echo "   - Instruktur user sudah ada, skip...\n";
        }

        // Peserta
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

        // 5. Buat Pengajuan Skor Awal (semua disetujui) - cek duplicate
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

        // 6. Buat Pengajuan Rencana Belajar - cek duplicate
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

        // 7. Buat Detail Pengajuan Rencana Belajar (skill yang diminta peserta - random) - cek duplicate
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

        // 8. Buat Feedback Rencana Belajar - cek duplicate
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
                $feedbackIds[] = DB::table('feedback_rencana_belajar')->insertGetId([
                    'tglPemberianFeedback' => Carbon::now()->subDays(rand(1, 5)),
                    'idPengajuanRencanaBelajar' => $rencanaId,
                    'idInstruktur' => $instrukturId,
                    'created_at' => Carbon::now(),
                    'updated_at' => Carbon::now(),
                ]);
                echo "   - Feedback {$namaPeserta[$index]['nama']} berhasil dibuat\n";
            }
        }

        // 9. Buat Detail Feedback Rencana Belajar (skill final yang diberikan - random dari yang diminta) - cek duplicate
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
        echo "   - 1 admin, 1 instruktur\n";
        echo "\n🔑 Login credentials:\n";
        echo "   Admin: admin@lms.com / password\n";
        echo "   Instruktur: instruktur@lms.com / password\n";
        foreach ($namaPeserta as $index => $peserta) {
            echo "   Peserta" . ($index + 1) . ": " . $peserta['email'] . " / password\n";
        }
        echo "\n📋 Check mapping dengan query:\n";
        echo "   SELECT p.namaLengkap, s.kategori, s.skill\n";
        echo "   FROM detail_feedback_rencana_belajar dfb\n";
        echo "   JOIN feedback_rencana_belajar fb ON dfb.idFeedbackRencanaBelajar = fb.idFeedbackRencanaBelajar\n";
        echo "   JOIN pengajuan_rencana_belajar prb ON fb.idPengajuanRencanaBelajar = prb.idPengajuanRencanaBelajar\n";
        echo "   JOIN peserta_kursus p ON prb.idPeserta = p.idPeserta\n";
        echo "   JOIN skill s ON dfb.idSkill = s.idSkill\n";
        echo "   ORDER BY p.namaLengkap, s.idSkill;\n";
    }
}
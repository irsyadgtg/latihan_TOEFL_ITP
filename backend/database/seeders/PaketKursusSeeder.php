<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PaketKursusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        echo "\n=== PAKET KURSUS SEEDER ===\n";

        // Ambil idPegawai admin untuk creator paket
        $adminPegawai = DB::table('pegawai')
            ->where('jabatan', 'Administrator')
            ->orWhere('jabatan', 'Staff Administrasi')
            ->orWhere('namaLengkap', 'LIKE', '%Admin%')
            ->first();

        if (!$adminPegawai) {
            echo "ERROR: Admin pegawai tidak ditemukan. Pastikan pegawai admin sudah dibuat.\n";
            echo "Available pegawai with admin-like roles:\n";
            $adminLikePegawai = DB::table('pegawai')
                ->where('jabatan', 'LIKE', '%admin%')
                ->orWhere('namaLengkap', 'LIKE', '%admin%')
                ->get(['idPegawai', 'namaLengkap', 'jabatan', 'nik_nip']);
            
            foreach ($adminLikePegawai as $pegawai) {
                echo "   - ID: {$pegawai->idPegawai}, Nama: {$pegawai->namaLengkap}, Jabatan: {$pegawai->jabatan}, NIK: {$pegawai->nik_nip}\n";
            }
            
            return;
        }

        $idPegawaiAdmin = $adminPegawai->idPegawai;
        
        echo "✅ Found admin pegawai: {$adminPegawai->namaLengkap} (ID: {$idPegawaiAdmin}, Jabatan: {$adminPegawai->jabatan})\n\n";

        // Data paket kursus
        $paketData = [
            [
                'namaPaket' => 'TOEFL ITP Complete Package',
                'harga' => 750000.00,
                'masaBerlaku' => 6, // 6 bulan
                'fasilitas' => 'listening,structure,reading,simulasi,konsultasi',
                'aktif' => true,
                'idPegawai' => $idPegawaiAdmin,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'namaPaket' => 'TOEFL ITP Simulation & Consultation',
                'harga' => 350000.00,
                'masaBerlaku' => 3, // 3 bulan
                'fasilitas' => 'simulasi,konsultasi',
                'aktif' => true,
                'idPegawai' => $idPegawaiAdmin,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]
        ];

        // Insert paket kursus
        foreach ($paketData as $index => $paket) {
            // Cek apakah paket sudah ada
            $existingPaket = DB::table('paket_kursus')
                ->where('namaPaket', $paket['namaPaket'])
                ->first();

            if (!$existingPaket) {
                $paketId = DB::table('paket_kursus')->insertGetId($paket);
                echo "✅ Paket '{$paket['namaPaket']}' berhasil dibuat (ID: {$paketId})\n";
                echo "   - Harga: Rp " . number_format($paket['harga'], 0, ',', '.') . "\n";
                echo "   - Masa Berlaku: {$paket['masaBerlaku']} bulan\n";
                echo "   - Fasilitas: {$paket['fasilitas']}\n\n";
            } else {
                echo "⚠️  Paket '{$paket['namaPaket']}' sudah ada (ID: {$existingPaket->idPaketKursus}), skip...\n\n";
            }
        }

        // Tampilkan ringkasan
        $totalPaket = DB::table('paket_kursus')->count();
        echo "📊 RINGKASAN PAKET KURSUS:\n";
        echo "   - Total paket kursus: {$totalPaket}\n";
        echo "   - Paket aktif: " . DB::table('paket_kursus')->where('aktif', true)->count() . "\n";

        // Detail paket yang ada
        $allPaket = DB::table('paket_kursus')
            ->select('idPaketKursus', 'namaPaket', 'harga', 'masaBerlaku', 'aktif')
            ->orderBy('harga', 'desc')
            ->get();

        echo "\n📋 DAFTAR PAKET TERSEDIA:\n";
        foreach ($allPaket as $paket) {
            $status = $paket->aktif ? '🟢 Aktif' : '🔴 Non-aktif';
            echo "   {$paket->idPaketKursus}. {$paket->namaPaket}\n";
            echo "      Harga: Rp " . number_format($paket->harga, 0, ',', '.') . "\n";
            echo "      Masa Berlaku: {$paket->masaBerlaku} bulan\n";
            echo "      Status: {$status}\n\n";
        }

        echo "✅ PAKET KURSUS SEEDER COMPLETED!\n\n";
    }
}
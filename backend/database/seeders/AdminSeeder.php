<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        /// Cek apakah NIK pegawai ini sudah ada
        $existingPegawai = DB::table('pegawai')->where('nik_nip', '6675431234234543')->first();

        if (!$existingPegawai) {
            $pegawaiId = DB::table('pegawai')->insertGetId([
                'nik_nip' => '6675431234234543',
                'jabatan' => 'Staff Administrasi',
                'namaLengkap' => 'Jonathan Arya Wibowo',
                'nomorTelepon' => '081234567890',
                'alamat' => 'Jl. Sukabirus No.1',
                'urlFotoProfil' => 'foto-profil/foto-profil-admin.jpg',
                'status' => 'aktif',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);
        } else {
            $pegawaiId = $existingPegawai->idPegawai;
        }

        // Cek apakah admin ini sudah ada
        DB::table('pengguna')->updateOrInsert(
            ['username' => 'Jonathan'],
            [
                'email' => 'jonathan@telkomuniversity.ac.id',
                'password' => Hash::make('admin123@SATU'),
                'role' => 'admin',
                'email_verified_at' => Carbon::now(),
                'idPegawai' => $pegawaiId,
                'idPeserta' => null,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]
        );
    }
}

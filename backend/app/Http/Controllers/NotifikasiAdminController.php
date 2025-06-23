<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\NotifikasiAdmin;
use Illuminate\Http\Request;

class NotifikasiAdminController extends Controller
{
    public function getNotifikasiTerbaru()
    {
        $notifikasi = NotifikasiAdmin::orderBy('tglDibuat', 'desc')->take(5)->get();
        return response()->json($notifikasi);
    }

    public function getSemuaNotifikasi(Request $request)
    {
        // Default ke 'SEMUA' kalau tidak ada query status
        $status = $request->query('status', 'SEMUA');

        if (!in_array($status, ['BACA', 'BELUM TERBACA', 'SEMUA'])) {
            return response()->json(['message' => 'Status tidak valid'], 400);
        }

        $query = NotifikasiAdmin::orderBy('tglDibuat', 'desc');

        if ($status === 'BACA') {
            $query->where('sudahDibaca', true);
        } elseif ($status === 'BELUM TERBACA') {
            $query->where('sudahDibaca', false);
        }
        
        $notifikasi = $query->get();

        return response()->json($notifikasi);
    }

    public function tandaiTerbaca($id)
    {
        $notif = NotifikasiAdmin::find($id);
        if (!$notif) {
            return response()->json(['message' => 'Notifikasi tidak ditemukan'], 404);
        }

        $notif->sudahDibaca = true;
        $notif->save();

        return response()->json(['message' => 'Berhasil ditandai sudah dibaca dengan status BACA']);
    }
}

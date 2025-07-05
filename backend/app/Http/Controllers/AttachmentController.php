<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AttachmentController extends Controller
{
    public function upload(Request $request)
{
    $request->validate([
        'file' => 'required|file|mimes:jpg,jpeg,png,gif,mp3,wav,ogg,mp4,webm|max:20480'
    ]);

    $path = $request->file('file')->store('attachments', 'public');

    return response()->json(['url' => '/storage/' . $path]);
}

}

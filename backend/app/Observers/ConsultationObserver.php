<?php

namespace App\Observers;

use App\Models\Consultation;
use App\Models\Notification;
use Illuminate\Support\Facades\Log;

class ConsultationObserver
{
    /**
     * Handle the Consultation "created" event.
     */
    public function created(Consultation $consultation): void
    {
        // Load relasi untuk mendapatkan data user
        $consultation->load(['student', 'instructor']);

        // Notifikasi untuk instruktur: Ada konsultasi baru
        Notification::create([
            'idPengguna' => $consultation->instructor_id,
            'title' => 'Konsultasi Baru Dimulai',
            'message' => "Peserta {$consultation->student->username} memulai sesi konsultasi baru dengan Anda",
            'type' => Notification::TYPE_CONSULTATION,
            'metadata' => [
                'sumberId' => (string) $consultation->id,
                'sumberTipe' => 'Consultation',
                'action' => 'new_consultation',
                'student_id' => $consultation->student_id,
                'student_name' => $consultation->student->username,
                'instructor_id' => $consultation->instructor_id
            ]
        ]);

        Log::info('Notification created via ConsultationObserver', [
            'consultation_id' => $consultation->id,
            'student_id' => $consultation->student_id,
            'instructor_id' => $consultation->instructor_id,
            'action' => 'new_consultation'
        ]);
    }

    /**
     * Handle the Consultation "updated" event.
     */
    public function updated(Consultation $consultation): void
    {
        // Check jika status berubah
        if ($consultation->wasChanged('status')) {
            $consultation->load(['student', 'instructor']);
            
            $oldStatus = $consultation->getOriginal('status');
            $newStatus = $consultation->status;

            Log::info('Consultation status changed', [
                'consultation_id' => $consultation->id,
                'old_status' => $oldStatus,
                'new_status' => $newStatus
            ]);

            // Status berubah ke closed - sesi berakhir
            if ($newStatus === 'closed' && $oldStatus !== 'closed') {
                // Notifikasi ke kedua belah pihak
                $this->notifySessionEnded($consultation);
            }

            // Status berubah ke active dari pending - instruktur mulai merespons
            if ($newStatus === 'active' && $oldStatus === 'pending') {
                Notification::create([
                    'idPengguna' => $consultation->student_id,
                    'title' => 'Instruktur Merespons',
                    'message' => "Instruktur {$consultation->instructor->username} telah merespons konsultasi Anda",
                    'type' => Notification::TYPE_CONSULTATION,
                    'metadata' => [
                        'sumberId' => (string) $consultation->id,
                        'sumberTipe' => 'Consultation',
                        'action' => 'instructor_responded',
                        'instructor_id' => $consultation->instructor_id,
                        'instructor_name' => $consultation->instructor->username,
                        'student_id' => $consultation->student_id
                    ]
                ]);
            }

            // Status berubah ke pending dari closed - konsultasi dimulai kembali
            if ($newStatus === 'pending' && $oldStatus === 'closed') {
                Notification::create([
                    'idPengguna' => $consultation->instructor_id,
                    'title' => 'Konsultasi Dimulai Kembali',
                    'message' => "Peserta {$consultation->student->username} memulai sesi konsultasi baru dengan Anda",
                    'type' => Notification::TYPE_CONSULTATION,
                    'metadata' => [
                        'sumberId' => (string) $consultation->id,
                        'sumberTipe' => 'Consultation',
                        'action' => 'restart_consultation',
                        'student_id' => $consultation->student_id,
                        'student_name' => $consultation->student->username,
                        'instructor_id' => $consultation->instructor_id
                    ]
                ]);
            }
        }
    }

    /**
     * Notify when session ended
     */
    private function notifySessionEnded(Consultation $consultation)
    {
        // Cari message terakhir untuk menentukan siapa yang mengakhiri
        $lastMessage = $consultation->messages()
            ->where('message_type', 'chat')
            ->latest()
            ->first();

        $endedByStudent = false;
        $endedByInstructor = false;

        if ($lastMessage) {
            if ($lastMessage->sender_id === $consultation->student_id) {
                $endedByStudent = true;
            } elseif ($lastMessage->sender_id === $consultation->instructor_id) {
                $endedByInstructor = true;
            }
        }

        // Notifikasi ke instruktur jika peserta yang mengakhiri
        if ($endedByStudent) {
            Notification::create([
                'idPengguna' => $consultation->instructor_id,
                'title' => 'Sesi Konsultasi Berakhir',
                'message' => "Peserta {$consultation->student->username} mengakhiri sesi konsultasi",
                'type' => Notification::TYPE_CONSULTATION,
                'metadata' => [
                    'sumberId' => (string) $consultation->id,
                    'sumberTipe' => 'Consultation',
                    'action' => 'session_ended',
                    'ended_by' => 'student',
                    'ended_by_id' => $consultation->student_id,
                    'ended_by_name' => $consultation->student->username,
                    'instructor_id' => $consultation->instructor_id
                ]
            ]);
        }

        // Notifikasi ke peserta jika instruktur yang mengakhiri
        if ($endedByInstructor) {
            Notification::create([
                'idPengguna' => $consultation->student_id,
                'title' => 'Sesi Konsultasi Berakhir',
                'message' => "Instruktur {$consultation->instructor->username} mengakhiri sesi konsultasi",
                'type' => Notification::TYPE_CONSULTATION,
                'metadata' => [
                    'sumberId' => (string) $consultation->id,
                    'sumberTipe' => 'Consultation',
                    'action' => 'session_ended',
                    'ended_by' => 'instructor',
                    'ended_by_id' => $consultation->instructor_id,
                    'ended_by_name' => $consultation->instructor->username,
                    'student_id' => $consultation->student_id
                ]
            ]);
        }

        Log::info('Session ended notifications sent', [
            'consultation_id' => $consultation->id,
            'ended_by_student' => $endedByStudent,
            'ended_by_instructor' => $endedByInstructor
        ]);
    }

    /**
     * Handle the Consultation "deleted" event.
     */
    public function deleted(Consultation $consultation): void
    {
        // Optional: cleanup related notifications if needed
    }

    /**
     * Handle the Consultation "restored" event.
     */
    public function restored(Consultation $consultation): void
    {
        //
    }

    /**
     * Handle the Consultation "force deleted" event.
     */
    public function forceDeleted(Consultation $consultation): void
    {
        //
    }
}
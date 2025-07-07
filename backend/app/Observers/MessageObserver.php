<?php

namespace App\Observers;

use App\Models\Message;
use App\Models\Notification;
use Illuminate\Support\Facades\Log;

class MessageObserver
{
    /**
     * Handle the Message "created" event.
     */
    public function created(Message $message): void
    {
        // Skip jika message type adalah session_marker
        if ($message->message_type === 'session_marker') {
            return;
        }

        // Skip jika tidak ada sender (system message)
        if (!$message->sender_id) {
            return;
        }

        // Load relasi yang dibutuhkan
        $message->load(['consultation.student', 'consultation.instructor', 'sender']);

        $consultation = $message->consultation;

        if (!$consultation) {
            Log::warning('Message created without consultation', [
                'message_id' => $message->id
            ]);
            return;
        }

        // Tentukan penerima notifikasi (pihak lain selain pengirim)
        $recipientId = null;
        $recipientName = '';
        $senderRole = '';
        $actionType = '';

        if ($message->sender_id === $consultation->student_id) {
            // Pesan dari peserta ke instruktur
            $recipientId = $consultation->instructor_id;
            $recipientName = $consultation->instructor->username ?? 'Instruktur';
            $senderRole = 'student';
            $actionType = 'student_message';
        } elseif ($message->sender_id === $consultation->instructor_id) {
            // Pesan dari instruktur ke peserta
            $recipientId = $consultation->student_id;
            $recipientName = $consultation->student->username ?? 'Peserta';
            $senderRole = 'instructor';
            $actionType = 'instructor_reply';
        }

        if (!$recipientId) {
            Log::warning('Cannot determine recipient for message notification', [
                'message_id' => $message->id,
                'sender_id' => $message->sender_id,
                'consultation_id' => $consultation->id
            ]);
            return;
        }

        // Buat notifikasi berdasarkan role pengirim
        if ($senderRole === 'student') {
            // Notifikasi untuk instruktur
            $title = 'Pesan Baru dari Peserta';
            $notificationMessage = "Peserta {$message->sender->username} mengirim pesan baru dalam konsultasi";
        } else {
            // Notifikasi untuk peserta
            $title = 'Balasan dari Instruktur';
            $notificationMessage = "Instruktur {$message->sender->username} membalas pesan Anda dalam konsultasi";
        }

        // Metadata untuk notifikasi
        $metadata = [
            'sumberId' => (string) $message->id,
            'sumberTipe' => 'Message',
            'action' => $actionType,
            'consultation_id' => $consultation->id,
            'sender_id' => $message->sender_id,
            'sender_name' => $message->sender->username ?? 'Unknown',
            'sender_role' => $senderRole,
            'student_id' => $consultation->student_id,
            'instructor_id' => $consultation->instructor_id
        ];

        // Tambah info attachment jika ada
        if ($message->attachment) {
            $metadata['has_attachment'] = true;
            $metadata['attachment_type'] = $message->getAttachmentType();
        }

        // Tambah info reference jika ada
        if ($message->hasReference()) {
            $metadata['has_reference'] = true;
            $metadata['reference_info'] = $message->getReferenceInfo();
        }

        try {
            Notification::create([
                'idPengguna' => $recipientId,
                'title' => $title,
                'message' => $notificationMessage,
                'type' => Notification::TYPE_CONSULTATION,
                'metadata' => $metadata
            ]);

            Log::info('Message notification created via MessageObserver', [
                'message_id' => $message->id,
                'consultation_id' => $consultation->id,
                'sender_id' => $message->sender_id,
                'recipient_id' => $recipientId,
                'sender_role' => $senderRole,
                'action' => $actionType
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create message notification', [
                'message_id' => $message->id,
                'consultation_id' => $consultation->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }

    /**
     * Handle the Message "updated" event.
     */
    public function updated(Message $message): void
    {
        // Biasanya message tidak di-update, tapi bisa ditambahkan logic jika diperlukan
    }

    /**
     * Handle the Message "deleted" event.
     */
    public function deleted(Message $message): void
    {
        // Optional: cleanup related notifications if needed
    }

    /**
     * Handle the Message "restored" event.
     */
    public function restored(Message $message): void
    {
        //
    }

    /**
     * Handle the Message "force deleted" event.
     */
    public function forceDeleted(Message $message): void
    {
        //
    }
}

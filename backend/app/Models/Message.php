<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Message extends Model
{
    use HasFactory;

    protected $fillable = [
        'consultation_id',
        'sender_id',
        'message',
        'message_type',
        'attachment',
        'reference_page_id',
        'reference_modul',
        'reference_unit_number'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    protected $appends = [
        'attachment_url',
        'is_session_marker'
    ];

    // Message type constants
    const TYPE_CHAT = 'chat';
    const TYPE_SESSION_MARKER = 'session_marker';

    public function consultation()
    {
        return $this->belongsTo(Consultation::class, 'consultation_id', 'id');
    }

    public function sender()
    {
        return $this->belongsTo(Pengguna::class, 'sender_id', 'idPengguna');
    }

    public function referencePage()
    {
        return $this->belongsTo(Page::class, 'reference_page_id', 'id');
    }

    // Accessors
    public function getAttachmentUrlAttribute()
    {
        if ($this->attachment) {
            return Storage::url($this->attachment);
        }
        return null;
    }

    public function getIsSessionMarkerAttribute()
    {
        return $this->message_type === self::TYPE_SESSION_MARKER;
    }

    // Scopes
    public function scopeChatMessages($query)
    {
        return $query->where('message_type', self::TYPE_CHAT);
    }

    public function scopeSessionMarkers($query)
    {
        return $query->where('message_type', self::TYPE_SESSION_MARKER);
    }

    public function scopeWithAttachments($query)
    {
        return $query->whereNotNull('attachment');
    }

    public function scopeWithReferences($query)
    {
        return $query->whereNotNull('reference_page_id')
                    ->orWhereNotNull('reference_modul')
                    ->orWhereNotNull('reference_unit_number');
    }

    // Helper methods
    public function hasAttachment()
    {
        return !empty($this->attachment);
    }

    public function hasReference()
    {
        return !empty($this->reference_page_id) || 
               !empty($this->reference_modul) || 
               !empty($this->reference_unit_number);
    }

    public function isFromStudent()
    {
        return $this->sender && $this->sender->role === 'peserta';
    }

    public function isFromInstructor()
    {
        return $this->sender && $this->sender->role === 'instruktur';
    }

    public function getAttachmentType()
    {
        if (!$this->hasAttachment()) {
            return null;
        }

        $extension = pathinfo($this->attachment, PATHINFO_EXTENSION);
        
        switch (strtolower($extension)) {
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
            case 'webp':
                return 'image';
            case 'mp3':
            case 'wav':
            case 'ogg':
            case 'm4a':
                return 'audio';
            case 'mp4':
            case 'avi':
            case 'mov':
            case 'wmv':
            case 'webm':
                return 'video';
            case 'pdf':
                return 'pdf';
            case 'doc':
            case 'docx':
                return 'document';
            default:
                return 'file';
        }
    }

    public function getReferenceInfo()
    {
        $info = [];
        
        if ($this->reference_page_id && $this->referencePage) {
            $info['page'] = [
                'id' => $this->referencePage->id,
                'title' => $this->referencePage->title,
                'modul' => $this->referencePage->modul,
                'unit_number' => $this->referencePage->unit_number
            ];
        }
        
        if ($this->reference_modul) {
            $info['modul'] = $this->reference_modul;
        }
        
        if ($this->reference_unit_number) {
            $info['unit_number'] = $this->reference_unit_number;
        }
        
        return !empty($info) ? $info : null;
    }
}
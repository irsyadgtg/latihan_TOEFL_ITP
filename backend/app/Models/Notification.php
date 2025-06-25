<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'idPengguna',
        'title',
        'message',
        'type',
        'metadata',
        'read_at',
    ];

    protected $casts = [
        'read_at' => 'datetime',
        'metadata' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    protected $appends = [
        'is_read',
        'time_ago',
        'sumber_id',
        'sumber_tipe',
        'jenis_notifikasi'
    ];

    // Notification type constants
    const TYPE_GENERAL = 'general';
    const TYPE_CONSULTATION = 'consultation';
    const TYPE_SIMULATION = 'simulation';
    const TYPE_FEEDBACK = 'feedback';
    const TYPE_ADMIN = 'admin';

    public function user()
    {
        return $this->belongsTo(\App\Models\Pengguna::class, 'idPengguna', 'idPengguna');
    }

    // Accessors for compatibility with admin system
    public function getIsReadAttribute()
    {
        return !is_null($this->read_at);
    }

    public function getTimeAgoAttribute()
    {
        return $this->created_at->diffForHumans();
    }

    public function getSumberIdAttribute()
    {
        return $this->metadata['sumberId'] ?? null;
    }

    public function getSumberTipeAttribute()
    {
        return $this->metadata['sumberTipe'] ?? null;
    }

    public function getJenisNotifikasiAttribute()
    {
        // Untuk compatibility dengan admin system
        return $this->metadata['jenisNotifikasi'] ?? $this->type;
    }

    // Legacy accessor untuk admin system
    public function getSudahDibacaAttribute()
    {
        return $this->is_read;
    }

    public function getTglDibuatAttribute()
    {
        return $this->created_at;
    }

    public function getPesanAttribute()
    {
        return $this->message;
    }

    // Methods
    public function markAsRead()
    {
        $this->update(['read_at' => now()]);
    }

    public function markAsUnread()
    {
        $this->update(['read_at' => null]);
    }

    // Scopes
    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }

    public function scopeRead($query)
    {
        return $query->whereNotNull('read_at');
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeConsultation($query)
    {
        return $query->where('type', self::TYPE_CONSULTATION);
    }

    public function scopeSimulation($query)
    {
        return $query->where('type', self::TYPE_SIMULATION);
    }

    public function scopeFeedback($query)
    {
        return $query->where('type', self::TYPE_FEEDBACK);
    }

    public function scopeAdmin($query)
    {
        return $query->where('type', self::TYPE_ADMIN);
    }

    public function scopeRecent($query, $limit = 10)
    {
        return $query->orderBy('created_at', 'desc')->limit($limit);
    }

    // Scope untuk admin system compatibility
    public function scopeByStatus($query, $status)
    {
        switch ($status) {
            case 'BACA':
                return $query->read();
            case 'BELUM TERBACA':
                return $query->unread();
            case 'SEMUA':
            default:
                return $query;
        }
    }

    public function scopeByJenisNotifikasi($query, $jenis)
    {
        return $query->where('metadata->jenisNotifikasi', $jenis);
    }

    // Helper methods
    public function isRead()
    {
        return !is_null($this->read_at);
    }

    public function isUnread()
    {
        return is_null($this->read_at);
    }

    public function isConsultation()
    {
        return $this->type === self::TYPE_CONSULTATION;
    }

    public function isSimulation()
    {
        return $this->type === self::TYPE_SIMULATION;
    }

    public function isFeedback()
    {
        return $this->type === self::TYPE_FEEDBACK;
    }

    public function isAdmin()
    {
        return $this->type === self::TYPE_ADMIN;
    }

    public function hasMetadata()
    {
        return !empty($this->metadata);
    }

    public function getMetadata($key = null)
    {
        if ($key) {
            return $this->metadata[$key] ?? null;
        }
        return $this->metadata;
    }

    public function setMetadata($key, $value = null)
    {
        if (is_array($key)) {
            $this->metadata = array_merge($this->metadata ?? [], $key);
        } else {
            $metadata = $this->metadata ?? [];
            $metadata[$key] = $value;
            $this->metadata = $metadata;
        }
        $this->save();
    }

    public function getAction()
    {
        return $this->metadata['action'] ?? null;
    }

    public function getSumberId()
    {
        return $this->metadata['sumberId'] ?? null;
    }

    public function getSumberTipe()
    {
        return $this->metadata['sumberTipe'] ?? null;
    }

    // Navigation helpers
    public function getNavigationUrl()
    {
        $action = $this->getAction();
        $sumberId = $this->getSumberId();
        
        if ($this->isConsultation()) {
            switch ($action) {
                case 'new_consultation':
                case 'restart_consultation':
                case 'student_message':
                case 'instructor_reply':
                    return "/consultation/{$sumberId}";
                case 'instructor_available':
                    return "/consultation/instructors";
                default:
                    return "/consultations";
            }
        }

        if ($this->isSimulation()) {
            return "/simulation/{$sumberId}";
        }

        if ($this->isFeedback()) {
            return "/feedback/{$sumberId}";
        }

        if ($this->isAdmin()) {
            $jenisNotifikasi = $this->getMetadata('jenisNotifikasi');
            switch ($jenisNotifikasi) {
                case 'TRANSAKSI_PEMBAYARAN':
                    return "/admin/transaksi/{$sumberId}";
                case 'PENGAJUAN_SKOR_AWAL':
                    return "/admin/pengajuan-skor-awal/{$sumberId}";
                default:
                    return "/admin/dashboard";
            }
        }

        return null;
    }

    // Format for admin API compatibility
    public function toAdminFormat()
    {
        return [
            'idNotifikasi' => $this->id,
            'pesan' => $this->message,
            'jenisNotifikasi' => $this->jenis_notifikasi,
            'sudahDibaca' => $this->is_read,
            'tglDibuat' => $this->created_at,
            'sumberId' => $this->sumber_id,
            'sumberTipe' => $this->sumber_tipe,
        ];
    }
}
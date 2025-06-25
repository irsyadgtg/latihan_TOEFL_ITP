<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Consultation extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'instructor_id',
        'status'
    ];

    public function student()
    {
        return $this->belongsTo(Pengguna::class, 'student_id');
    }

    public function instructor()
    {
        return $this->belongsTo(Pengguna::class, 'instructor_id');
    }

    public function messages()
    {
        return $this->hasMany(Message::class)->orderBy('created_at', 'asc');
    }

    public function latestMessage()
    {
        return $this->hasOne(Message::class)->latest();
    }
}
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Page extends Model
{
    use HasFactory;

    protected $fillable = [
        'modul',
        'unit_number',
        'order_number',
        'title',
        'attachment',
        'description',
    ];
}

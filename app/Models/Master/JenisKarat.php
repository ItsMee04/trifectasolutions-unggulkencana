<?php

namespace App\Models\Master;

use App\Models\Master\Karat;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JenisKarat extends Model
{
    use HasFactory;
    protected $hidden = ['created_at', 'updated_at', 'deleted_at'];
    protected $table = 'jeniskarat';
    protected $fillable = ['karat_id', 'jenis', 'status'];

    /**
     * Get the karat that owns the JenisKarat
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function karat(): BelongsTo
    {
        return $this->belongsTo(Karat::class, 'karat_id', 'id');
    }
}

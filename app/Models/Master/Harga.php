<?php

namespace App\Models\Master;

use App\Models\Master\Karat;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Harga extends Model
{
    use HasFactory;
    protected $hidden = ['created_at', 'updated_at', 'deleted_at'];
    protected $table = 'harga';
    protected $fillable = ['karat_id', 'jeniskarat_id', 'harga', 'status'];

    /**
     * Get the karat that owns the Harga
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function karat(): BelongsTo
    {
        return $this->belongsTo(Karat::class, 'karat_id', 'id');
    }

    /**
     * Get the jeniskarat that owns the Harga
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function jeniskarat(): BelongsTo
    {
        return $this->belongsTo(JenisKarat::class, 'jeniskarat_id', 'id');
    }
}

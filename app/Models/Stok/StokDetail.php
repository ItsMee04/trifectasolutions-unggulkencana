<?php

namespace App\Models\Stok;

use App\Models\Master\JenisProduk;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StokDetail extends Model
{
    use HasFactory;
    protected $hidden = ['created_at', 'updated_at', 'deleted_at'];
    protected $table = 'stokdetail';
    protected $fillable = ['kode', 'jenisproduk_id', 'potong', 'berat', 'status'];

    /**
     * Get the stok that owns the StokDetail
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function stok(): BelongsTo
    {
        return $this->belongsTo(Stok::class, 'kode', 'kode');
    }

    /**
     * Get the jenisproduk that owns the StokDetail
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function jenisproduk(): BelongsTo
    {
        return $this->belongsTo(JenisProduk::class, 'jenisproduk_id', 'id');
    }
}

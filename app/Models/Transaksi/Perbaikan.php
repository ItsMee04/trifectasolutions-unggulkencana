<?php

namespace App\Models\Transaksi;

use App\Models\Master\Kondisi;
use App\Models\Master\Produk;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Perbaikan extends Model
{
    use HasFactory;
    protected $hidden = ['created_at', 'updated_at', 'deleted_at'];
    protected $table = 'perbaikan';
    protected $fillable = [
        'kode',
        'produk_id',
        'kondisi_id',
        'keterangan',
        'tanggalmasuk',
        'tanggalkeluar',
        'oleh',
        'status'
    ];

    /**
     * Get the produk that owns the Perbaikan
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function produk(): BelongsTo
    {
        return $this->belongsTo(Produk::class, 'produk_id', 'id');
    }

    /**
     * Get the kondisi that owns the Perbaikan
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function kondisi(): BelongsTo
    {
        return $this->belongsTo(Kondisi::class, 'kondisi_id', 'id');
    }

    /**
     * Get the oleh that owns the Perbaikan
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function oleh(): BelongsTo
    {
        return $this->belongsTo(User::class, 'oleh', 'id');
    }
}

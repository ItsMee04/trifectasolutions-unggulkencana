<?php

namespace App\Models\Master;

use App\Models\Master\JenisProduk;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Produk extends Model
{
    use HasFactory;
    protected $hidden = ['created_at', 'updated_at', 'deleted_at']; // Menyembunyikan created_at dan updated_at secara global
    protected $table    = 'produk';
    protected $fillable =
    [
        'kodeproduk',
        'nama',
        'berat',
        'jenisproduk_id',
        'karat_id',
        'jeniskarat_id',
        'harga_id',
        'harga_beli',
        'lingkar',
        'panjang',
        'keterangan',
        'kondisi_id',
        'image',
        'status'
    ];

    /**
     * Get the jenisproduk that owns the Produk
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function jenisproduk(): BelongsTo
    {
        return $this->belongsTo(JenisProduk::class, 'jenisproduk_id', 'id');
    }

    /**
     * Get the karat that owns the Produk
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function karat(): BelongsTo
    {
        return $this->belongsTo(Karat::class, 'karat_id', 'id');
    }

    /**
     * Get the jeniskarat that owns the Produk
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function jeniskarat(): BelongsTo
    {
        return $this->belongsTo(JenisKarat::class, 'jeniskarat_id', 'id');
    }

    /**
     * Get the harga that owns the Produk
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function harga(): BelongsTo
    {
        return $this->belongsTo(Harga::class, 'harga_id', 'id');
    }

    /**
     * Get the kondisi that owns the Produk
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function kondisi(): BelongsTo
    {
        return $this->belongsTo(Kondisi::class, 'kondisi_id', 'id');
    }
}

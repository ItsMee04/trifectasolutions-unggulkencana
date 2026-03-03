<?php

namespace App\Models\Transaksi;

use App\Models\Master\Kondisi;
use App\Models\Master\Produk;
use App\Models\Transaksi\Transaksi;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PembelianDetail extends Model
{
    use HasFactory;
    protected $hidden = ['created_at', 'updated_at', 'deleted_at'];
    protected $table = 'pembeliandetail';
    protected $fillable = [
        'kodetransaksi',
        'kode',
        'produk_id',
        'hargabeli',
        'berat',
        'karat',
        'lingkar',
        'panjang',
        'kondisi_id',
        'jenis',
        'jenis_hargabeli',
        'total',
        'terbilang',
        'keterangan',
        'oleh',
        'status'
    ];

    /**
     * Get the kodetransaksi that owns the PembelianDetail
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function kodetransaksi(): BelongsTo
    {
        return $this->belongsTo(Transaksi::class, 'kodetransaksi', 'kode');
    }

    /**
     * Get the produk that owns the PembelianDetail
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function produk(): BelongsTo
    {
        return $this->belongsTo(Produk::class, 'produk_id', 'id');
    }

    /**
     * Get the kondisi that owns the PembelianDetail
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function kondisi(): BelongsTo
    {
        return $this->belongsTo(Kondisi::class, 'kondisi_id', 'id');
    }

    /**
     * Get the oleh that owns the PembelianDetail
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function oleh(): BelongsTo
    {
        return $this->belongsTo(User::class, 'oleh', 'id');
    }

    /**
     * Get the pembelian that owns the PembelianDetail
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function pembelian(): BelongsTo
    {
        return $this->belongsTo(Pembelian::class, 'kode', 'kode');
    }
}

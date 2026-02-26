<?php

namespace App\Models\Transaksi;

use App\Models\Master\Produk;
use App\Models\Transaksi\Transaksi;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TransaksiDetail extends Model
{
    use HasFactory;
    protected $hidden = ['created_at', 'updated_at', 'deleted_at'];
    protected $table = 'transaksidetail';
    protected $fillable = ['kode', 'produk_id', 'hargajual',  'berat',  'karat',  'lingkar',  'panjang', 'total', 'terbilang', 'oleh', 'status'];

    /**
     * Get the produk that owns the TransaksiDetail
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function produk(): BelongsTo
    {
        return $this->belongsTo(Produk::class, 'produk_id', 'id');
    }

    /**
     * Get the kode that owns the TransaksiDetail
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function kode(): BelongsTo
    {
        return $this->belongsTo(Transaksi::class, 'kode', 'kode');
    }

    /**
     * Get the oleh that owns the TransaksiDetail
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function oleh(): BelongsTo
    {
        return $this->belongsTo(User::class, 'oleh', 'id');
    }

    /**
     * Get the transaksi that owns the TransaksiDetail
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function transaksi(): BelongsTo
    {
        return $this->belongsTo(Transaksi::class, 'kode', 'kode');
    }
}

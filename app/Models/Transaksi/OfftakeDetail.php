<?php

namespace App\Models\Transaksi;

use App\Models\Master\Produk;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OfftakeDetail extends Model
{
    use HasFactory;
    protected $hidden = ['created_at', 'updated_at', 'deleted_at'];
    protected $table = 'offtakedetail';
    protected $fillable = [
        'kode',
        'produk_id',
        'hargajual',
        'berat',
        'karat',
        'langkar',
        'panjang',
        'total',
        'terbilang',
        'oleh',
        'status'
    ];

    /**
     * Get the kode that owns the OfftakeDetail
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function kode(): BelongsTo
    {
        return $this->belongsTo(Offtake::class, 'kode', 'kode');
    }

    /**
     * Get the produk that owns the OfftakeDetail
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function produk(): BelongsTo
    {
        return $this->belongsTo(Produk::class, 'produk_id', 'id');
    }

    /**
     * Get the oleh that owns the OfftakeDetail
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function oleh(): BelongsTo
    {
        return $this->belongsTo(User::class, 'oleh', 'id');
    }
}

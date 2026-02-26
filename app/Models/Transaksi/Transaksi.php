<?php

namespace App\Models\Transaksi;

use App\Models\Master\Diskon;
use App\Models\Master\Pelanggan;
use App\Models\Transaksi\TransaksiDetail;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Transaksi extends Model
{
    use HasFactory;
    protected $hidden = ['created_at', 'updated_at', 'deleted_at'];
    protected $table = 'transaksi';
    protected $fillable = ['kode', 'pelanggan_id', 'diskon_id',  'total',  'terbilang',  'tanggal',  'oleh',  'status'];

    /**
     * Get the pelanggan that owns the Transaksi
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function pelanggan(): BelongsTo
    {
        return $this->belongsTo(Pelanggan::class, 'pelanggan_id', 'id');
    }

    /**
     * Get the diskon that owns the Transaksi
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function diskon(): BelongsTo
    {
        return $this->belongsTo(Diskon::class, 'diskon_id', 'id');
    }

    /**
     * Get the oleh that owns the Transaksi
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function oleh(): BelongsTo
    {
        return $this->belongsTo(User::class, 'oleh', 'id');
    }

    /**
     * Get the transaksidetail associated with the Transaksi
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasOne
     */
    public function transaksidetail(): HasOne
    {
        return $this->hasOne(TransaksiDetail::class, 'kode', 'kode');
    }
}

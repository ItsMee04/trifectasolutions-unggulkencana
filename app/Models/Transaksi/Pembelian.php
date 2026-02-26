<?php

namespace App\Models\Transaksi;

use App\Models\Master\Pelanggan;
use App\Models\Master\Suplier;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Pembelian extends Model
{
    use HasFactory;
    protected $hidden = ['created_at', 'updated_at', 'deleted_at'];
    protected $table = 'pembelian';
    protected $fillable = [
        'kode',
        'suplier_id',
        'pelanggan_id',
        'tanggal',
        'jenis',
        'total',
        'terbilang',
        'keterangan',
        'oleh',
        'status'
    ];

    /**
     * Get the suplier that owns the Pembelian
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function suplier(): BelongsTo
    {
        return $this->belongsTo(Suplier::class, 'suplier_id', 'id');
    }

    /**
     * Get the pelanggan that owns the Pembelian
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function pelanggan(): BelongsTo
    {
        return $this->belongsTo(Pelanggan::class, 'pelanggan_id', 'id');
    }
}

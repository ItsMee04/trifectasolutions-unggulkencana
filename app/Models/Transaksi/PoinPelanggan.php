<?php

namespace App\Models\Transaksi;

use App\Models\Master\Pelanggan;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PoinPelanggan extends Model
{
    use HasFactory;
    protected $hidden = ['created_at', 'updated_at', 'deleted_at'];
    protected $table = 'poinpelanggan';
    protected $fillable = [
        'pelanggan_id',
        'kode',
        'jumlah',
        'oleh',
        'status'
    ];

    /**
     * Get the pelanggan that owns the PoinPelanggan
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function pelanggan(): BelongsTo
    {
        return $this->belongsTo(Pelanggan::class, 'pelanggan_id', 'id');
    }

    /**
     * Get the transaksi that owns the PoinPelanggan
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function transaksi(): BelongsTo
    {
        return $this->belongsTo(Transaksi::class, 'kode', 'kode');
    }

    /**
     * Get the oleh that owns the PoinPelanggan
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function oleh(): BelongsTo
    {
        return $this->belongsTo(User::class, 'oleh', 'id');
    }
}

<?php

namespace App\Models\Keuangan;

use App\Models\Keuangan\Saldo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MutasiSaldo extends Model
{
    use HasFactory;
    protected $hidden = ['created_at', 'updated_at', 'deleted_at'];
    protected $table = 'mutasisaldo';
    protected $fillable = ['saldo_id', 'tanggal', 'keterangan', 'jenis', 'jumlah', 'oleh', 'status'];

    /**
     * Get the saldo that owns the MustasiModal
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function saldo(): BelongsTo
    {
        return $this->belongsTo(Saldo::class, 'saldo_id', 'id');
    }
}

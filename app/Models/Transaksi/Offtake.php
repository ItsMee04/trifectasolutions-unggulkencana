<?php

namespace App\Models\Transaksi;

use App\Models\Master\Suplier;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Offtake extends Model
{
    use HasFactory;
    protected $hidden = ['created_at', 'updated_at', 'deleted_at'];
    protected $table = 'offtake';
    protected $fillable = [
        'kode',
        'tanggal',
        'suplier_id',
        'total',
        'terbilang',
        'hargatotal',
        'keterangan',
        'oleh',
        'status'
    ];

    /**
     * Get the suplier that owns the Offtake
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function suplier(): BelongsTo
    {
        return $this->belongsTo(Suplier::class, 'suplier_id', 'id');
    }

    /**
     * Get the oleh that owns the Offtake
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function oleh(): BelongsTo
    {
        return $this->belongsTo(User::class, 'oleh', 'id');
    }
}

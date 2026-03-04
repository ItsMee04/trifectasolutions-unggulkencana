<?php

namespace App\Models\Inventori;

use App\Models\Inventori\StokHarian;
use App\Models\Master\Nampan;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StokHarianDetail extends Model
{
    use HasFactory;
    protected $hidden = ['created_at', 'updated_at', 'deleted_at'];
    protected $table = 'stokhariandetail';
    protected $fillable = ['kode', 'nampan_id', 'oleh', 'status'];

    /**
     * Get the stokharian that owns the StokHarianDetail
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function stokharian(): BelongsTo
    {
        return $this->belongsTo(StokHarian::class, 'kode', 'kode');
    }

    /**
     * Get the nampan that owns the StokHarianDetail
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function nampan(): BelongsTo
    {
        return $this->belongsTo(Nampan::class, 'nampan_id', 'id');
    }

    /**
     * Get the oleh that owns the StokHarianDetail
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function oleh(): BelongsTo
    {
        return $this->belongsTo(User::class, 'oleh', 'id');
    }
}

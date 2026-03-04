<?php

namespace App\Models\Inventori;

use App\Models\Inventori\StokHarianDetail;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StokHarian extends Model
{
    use HasFactory;
    protected $hidden = ['created_at', 'updated_at', 'deleted_at'];
    protected $table = 'stokharian';
    protected $fillable = ['kode', 'periode', 'oleh', 'status'];

    /**
     * Get all of the stokhariandetail for the StokHarian
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function stokhariandetail(): HasMany
    {
        return $this->hasMany(StokHarianDetail::class, 'kode', 'kode');
    }

    /**
     * Get the oleh that owns the StokHarian
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function oleh(): BelongsTo
    {
        return $this->belongsTo(User::class, 'oleh', 'id');
    }
}

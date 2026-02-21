<?php

namespace App\Models\Master;

use App\Models\Master\Nampan;
use App\Models\Master\Produk;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NampanProduk extends Model
{
    use HasFactory;
    protected $hidden = ['created_at', 'updated_at', 'deleted_at'];
    protected $table = 'nampanproduk';
    protected $fillable = ['nampan_id', 'produk_id', 'jenis', 'tanggal', 'oleh', 'status'];

    /**
     * Get the nampan that owns the NampanProduk
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function nampan(): BelongsTo
    {
        return $this->belongsTo(Nampan::class, 'nampan_id', 'id');
    }

    /**
     * Get the produk that owns the NampanProduk
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function produk(): BelongsTo
    {
        return $this->belongsTo(Produk::class, 'produk_id', 'id');
    }

    /**
     * Get the users that owns the NampanProduk
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function users(): BelongsTo
    {
        return $this->belongsTo(User::class, 'oleh', 'id');
    }
}

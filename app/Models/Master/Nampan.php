<?php

namespace App\Models\Master;

use App\Models\Master\JenisProduk;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Nampan extends Model
{
    use HasFactory;
    protected $hidden = ['created_at', 'updated_at', 'deleted_at'];
    protected $table = 'nampan';
    protected $fillable = ['jenisproduk_id', 'nampan', 'tanggal', 'status'];

    /**
     * Get the jenisproduk that owns the Nampan
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function jenisproduk(): BelongsTo
    {
        return $this->belongsTo(JenisProduk::class, 'jenisproduk_id', 'id');
    }
}

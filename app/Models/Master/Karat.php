<?php

namespace App\Models\Master;

use App\Models\Master\JenisKarat;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Karat extends Model
{
    use HasFactory;
    protected $hidden = ['created_at', 'updated_at', 'deleted_at'];
    protected $table = 'karat';
    protected $fillable = ['karat', 'status'];

    /**
     * Get all of the jeniskarat for the Karat
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function jeniskarat(): HasMany
    {
        return $this->hasMany(JenisKarat::class, 'id', 'karat_id');
    }
}

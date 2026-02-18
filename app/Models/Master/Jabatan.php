<?php

namespace App\Models\Master;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Jabatan extends Model
{
    use HasFactory;
    protected $hidden = ['created_at', 'updated_at', 'deleted_at'];
    protected $table = 'jabatan';
    protected $fillable = ['jabatan', 'status'];

    /**
     * Get all of the pegawai for the Jabatan
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function pegawai(): HasMany
    {
        return $this->hasMany(Pegawai::class, 'jabatan_id', 'id');
    }
}

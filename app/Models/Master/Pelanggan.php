<?php

namespace App\Models\Master;

use App\Models\Transaksi\PoinPelanggan;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Pelanggan extends Model
{
    use HasFactory;
    protected $hidden = ['created_at', 'updated_at', 'deleted_at'];
    protected $table = 'pelanggan';
    protected $fillable = ['kode', 'nama', 'kontak', 'alamat', 'tanggal', 'status'];

    /**
     * Get all of the poin for the Pelanggan
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function poin(): HasMany
    {
        return $this->hasMany(PoinPelanggan::class, 'pelanggan_id', 'id');
    }
}

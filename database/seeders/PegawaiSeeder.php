<?php

namespace Database\Seeders;

use App\Models\Master\Pegawai;
use Illuminate\Database\Seeder;

class PegawaiSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Pegawai::create([
            'nama'          =>  'Admin Trifecta',
            'nip'           =>  '0110001',
            'alamat'        =>  'Purwokerto',
            'kontak'        =>  '081390469322',
            'jabatan_id'    =>  1,
            'image'         =>  'admin.png',
            'status'        =>  1,
        ]);
    }
}

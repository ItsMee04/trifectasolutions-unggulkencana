<?php

namespace Database\Seeders;

use App\Models\Master\Permission;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Daftar menu sesuai dengan key di Sidebar.vue Anda
        $menus = [
            'dashboard',
            'usermanagement',
            'jabatan',
            'pegawai',
            'role',
            'users',
            'product',
            'kondisi',
            'karat',
            'jeniskarat',
            'harga',
            'diskon',
            'jenisproduk',
            'produk',
            'nampan',
            'nampanproduk',
            'pelanggan',
            'suplier',
            'pesan',
            'saldo',
            'mutasisaldo',
            'pos',
            'offtake',
            'pembelian',
            'pembeliandaritoko',
            'pembeliandariluartoko',
            'perbaikan',
            'transaksipenjualan',
            'transaksipembelian',
            'transaksiofftake',
            'iventory',
            'laporantransaksi'
        ];

        foreach ($menus as $menu) {
            Permission::updateOrCreate(
                ['role_id' => 1, 'menu_name' => $menu], // Role 1 = ADMIN
                ['can_view' => 1]
            );
        }
    }
}

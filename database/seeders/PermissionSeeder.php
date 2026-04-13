<?php

namespace Database\Seeders;

// use App\Models\Master\Permission;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Daftar menu sesuai dengan key di Sidebar.vue Anda
        $permissions = [
            ['id' => 1, 'role_id' => 1, 'menu_name' => 'dashboard', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 1],
            ['id' => 2, 'role_id' => 1, 'menu_name' => 'jabatan', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 1],
            ['id' => 3, 'role_id' => 1, 'menu_name' => 'pegawai', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 1],
            ['id' => 4, 'role_id' => 1, 'menu_name' => 'role', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 1],
            ['id' => 5, 'role_id' => 1, 'menu_name' => 'users', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 1],
            ['id' => 6, 'role_id' => 1, 'menu_name' => 'kondisi', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 1],
            ['id' => 7, 'role_id' => 1, 'menu_name' => 'karat', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 1],
            ['id' => 8, 'role_id' => 1, 'menu_name' => 'jeniskarat', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 1],
            ['id' => 9, 'role_id' => 1, 'menu_name' => 'harga', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 1],
            ['id' => 10, 'role_id' => 1, 'menu_name' => 'diskon', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 1],
            ['id' => 11, 'role_id' => 1, 'menu_name' => 'jenisproduk', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 1],
            ['id' => 12, 'role_id' => 1, 'menu_name' => 'produk', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 1],
            ['id' => 13, 'role_id' => 1, 'menu_name' => 'nampan', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 1],
            ['id' => 14, 'role_id' => 1, 'menu_name' => 'nampanproduk', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 1],
            ['id' => 15, 'role_id' => 1, 'menu_name' => 'pelanggan', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 1],
            ['id' => 16, 'role_id' => 1, 'menu_name' => 'suplier', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 1],
            ['id' => 17, 'role_id' => 1, 'menu_name' => 'pesan', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 1],
            ['id' => 18, 'role_id' => 1, 'menu_name' => 'saldo', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 1],
            ['id' => 19, 'role_id' => 1, 'menu_name' => 'mutasisaldo', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 1],
            ['id' => 20, 'role_id' => 1, 'menu_name' => 'transaksi', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 1],
            ['id' => 21, 'role_id' => 1, 'menu_name' => 'offtake', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 1],
            ['id' => 22, 'role_id' => 1, 'menu_name' => 'pembeliandaritoko', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 1],
            ['id' => 23, 'role_id' => 1, 'menu_name' => 'pembeliandariluartoko', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 1],
            ['id' => 24, 'role_id' => 1, 'menu_name' => 'perbaikan', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 1],
            ['id' => 25, 'role_id' => 1, 'menu_name' => 'transaksipenjualan', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 1],
            ['id' => 26, 'role_id' => 1, 'menu_name' => 'transaksipembelian', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 1],
            ['id' => 27, 'role_id' => 1, 'menu_name' => 'transaksiofftake', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 1],
            ['id' => 28, 'role_id' => 1, 'menu_name' => 'inventory', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 1],
            ['id' => 29, 'role_id' => 1, 'menu_name' => 'laporantransaksi', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 1],
            ['id' => 30, 'role_id' => 2, 'menu_name' => 'dashboard', 'can_view' => 1, 'can_create' => 0, 'can_edit' => 0, 'can_delete' => 0],
            ['id' => 31, 'role_id' => 2, 'menu_name' => 'jabatan', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 1],
            ['id' => 32, 'role_id' => 2, 'menu_name' => 'pegawai', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 1],
            ['id' => 33, 'role_id' => 2, 'menu_name' => 'role', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 1],
            ['id' => 34, 'role_id' => 2, 'menu_name' => 'users', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 1],
            ['id' => 35, 'role_id' => 2, 'menu_name' => 'kondisi', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 1],
            ['id' => 36, 'role_id' => 2, 'menu_name' => 'karat', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 1],
            ['id' => 37, 'role_id' => 2, 'menu_name' => 'jeniskarat', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 1],
            ['id' => 38, 'role_id' => 2, 'menu_name' => 'harga', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 1],
            ['id' => 39, 'role_id' => 2, 'menu_name' => 'diskon', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 1],
            ['id' => 40, 'role_id' => 2, 'menu_name' => 'jenisproduk', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 1],
            ['id' => 41, 'role_id' => 2, 'menu_name' => 'produk', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 1],
            ['id' => 42, 'role_id' => 2, 'menu_name' => 'nampan', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 1],
            ['id' => 43, 'role_id' => 2, 'menu_name' => 'nampanproduk', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 1],
            ['id' => 44, 'role_id' => 2, 'menu_name' => 'pelanggan', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 1],
            ['id' => 45, 'role_id' => 2, 'menu_name' => 'suplier', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 1],
            ['id' => 46, 'role_id' => 2, 'menu_name' => 'pesan', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 1],
            ['id' => 47, 'role_id' => 2, 'menu_name' => 'saldo', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 1],
            ['id' => 48, 'role_id' => 2, 'menu_name' => 'mutasisaldo', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 1],
            ['id' => 49, 'role_id' => 2, 'menu_name' => 'transaksi', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 1],
            ['id' => 50, 'role_id' => 2, 'menu_name' => 'offtake', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 1],
            ['id' => 51, 'role_id' => 2, 'menu_name' => 'pembeliandaritoko', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 1],
            ['id' => 52, 'role_id' => 2, 'menu_name' => 'pembeliandariluartoko', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 1],
            ['id' => 53, 'role_id' => 2, 'menu_name' => 'perbaikan', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 1],
            ['id' => 54, 'role_id' => 2, 'menu_name' => 'transaksipenjualan', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 1],
            ['id' => 55, 'role_id' => 2, 'menu_name' => 'transaksipembelian', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 1],
            ['id' => 56, 'role_id' => 2, 'menu_name' => 'transaksiofftake', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 1],
            ['id' => 57, 'role_id' => 2, 'menu_name' => 'inventory', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 1],
            ['id' => 58, 'role_id' => 2, 'menu_name' => 'laporantransaksi', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 1],
            ['id' => 59, 'role_id' => 3, 'menu_name' => 'dashboard', 'can_view' => 1, 'can_create' => 0, 'can_edit' => 0, 'can_delete' => 0],
            ['id' => 60, 'role_id' => 3, 'menu_name' => 'jabatan', 'can_view' => 1, 'can_create' => 0, 'can_edit' => 0, 'can_delete' => 0],
            ['id' => 61, 'role_id' => 3, 'menu_name' => 'pegawai', 'can_view' => 1, 'can_create' => 0, 'can_edit' => 0, 'can_delete' => 0],
            ['id' => 62, 'role_id' => 3, 'menu_name' => 'role', 'can_view' => 1, 'can_create' => 0, 'can_edit' => 0, 'can_delete' => 0],
            ['id' => 63, 'role_id' => 3, 'menu_name' => 'users', 'can_view' => 1, 'can_create' => 0, 'can_edit' => 0, 'can_delete' => 0],
            ['id' => 64, 'role_id' => 3, 'menu_name' => 'kondisi', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 0],
            ['id' => 65, 'role_id' => 3, 'menu_name' => 'karat', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 0],
            ['id' => 66, 'role_id' => 3, 'menu_name' => 'jeniskarat', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 0],
            ['id' => 67, 'role_id' => 3, 'menu_name' => 'harga', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 0],
            ['id' => 68, 'role_id' => 3, 'menu_name' => 'diskon', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 0],
            ['id' => 69, 'role_id' => 3, 'menu_name' => 'jenisproduk', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 0],
            ['id' => 70, 'role_id' => 3, 'menu_name' => 'produk', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 0],
            ['id' => 71, 'role_id' => 3, 'menu_name' => 'nampan', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 0],
            ['id' => 72, 'role_id' => 3, 'menu_name' => 'nampanproduk', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 0],
            ['id' => 73, 'role_id' => 3, 'menu_name' => 'pelanggan', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 0],
            ['id' => 74, 'role_id' => 3, 'menu_name' => 'suplier', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 0],
            ['id' => 75, 'role_id' => 3, 'menu_name' => 'pesan', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 0],
            ['id' => 76, 'role_id' => 3, 'menu_name' => 'saldo', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 0],
            ['id' => 77, 'role_id' => 3, 'menu_name' => 'mutasisaldo', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 0],
            ['id' => 78, 'role_id' => 3, 'menu_name' => 'transaksi', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 1],
            ['id' => 79, 'role_id' => 3, 'menu_name' => 'offtake', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 1],
            ['id' => 80, 'role_id' => 3, 'menu_name' => 'pembeliandaritoko', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 1],
            ['id' => 81, 'role_id' => 3, 'menu_name' => 'pembeliandariluartoko', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 1],
            ['id' => 82, 'role_id' => 3, 'menu_name' => 'perbaikan', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 1],
            ['id' => 83, 'role_id' => 3, 'menu_name' => 'transaksipenjualan', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 0],
            ['id' => 84, 'role_id' => 3, 'menu_name' => 'transaksipembelian', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 0],
            ['id' => 85, 'role_id' => 3, 'menu_name' => 'transaksiofftake', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 0],
            ['id' => 86, 'role_id' => 3, 'menu_name' => 'inventory', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 0],
            ['id' => 87, 'role_id' => 3, 'menu_name' => 'laporantransaksi', 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 0],
        ];

        foreach ($permissions as $permission) {
            DB::table('permissions')->updateOrInsert(
                ['id' => $permission['id']],
                array_merge($permission, [
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }
    }
}

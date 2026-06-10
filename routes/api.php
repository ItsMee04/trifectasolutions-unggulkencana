<?php

use App\Http\Controllers\Authentication\AuthController;
use App\Http\Controllers\Authentication\PermissionController;
use App\Http\Controllers\Home\HomeController;
use App\Http\Controllers\Inventori\StokController;
use App\Http\Controllers\Keuangan\MutasiSaldoController;
use App\Http\Controllers\Keuangan\SaldoController;
use App\Http\Controllers\Laporan\CompailReportController;
use App\Http\Controllers\Laporan\LaporanController;
use App\Http\Controllers\Master\DiskonController;
use App\Http\Controllers\Master\HargaController;
use App\Http\Controllers\Master\JabatanController;
use App\Http\Controllers\Master\JenisKaratController;
use App\Http\Controllers\Master\JenisProdukController;
use App\Http\Controllers\Master\KaratController;
use App\Http\Controllers\Master\KondisiController;
use App\Http\Controllers\Master\NampanController;
use App\Http\Controllers\Master\NampanProdukController;
use App\Http\Controllers\Master\PegawaiController;
use App\Http\Controllers\Master\PelangganController;
use App\Http\Controllers\Master\PesanController;
use App\Http\Controllers\Master\ProdukController;
use App\Http\Controllers\Master\RoleController;
use App\Http\Controllers\Master\SuplierController;
use App\Http\Controllers\Master\UserController;
use App\Http\Controllers\Transaksi\OfftakeController;
use App\Http\Controllers\Transaksi\PembelianController;
use App\Http\Controllers\Transaksi\PerbaikanController;
use App\Http\Controllers\Transaksi\TransaksiController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware(['guest'])->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
});

Route::middleware(['auth:sanctum'])->group(function () {

    Route::get('me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('dashboard/getTotalSaldoMasuk', [HomeController::class, 'getTotalSaldoMasuk'])->middleware('check.permission:dashboard,can_view');
    Route::get('dashboard/getTotalSaldoKeluar', [HomeController::class, 'getTotalSaldoKeluar'])->middleware('check.permission:dashboard,can_view');
    Route::get('dashboard/getTotalPenjualanMasuk', [HomeController::class, 'getTotalPenjualanMasuk'])->middleware('check.permission:dashboard,can_view');
    Route::get('dashboard/getTotalPenjualanKeluar', [HomeController::class, 'getTotalPenjualanKeluar'])->middleware('check.permission:dashboard,can_view');
    Route::get('dashboard/getTotalPelanggan', [HomeController::class, 'getTotalPelanggan'])->middleware('check.permission:dashboard,can_view');
    Route::get('dashboard/getTotalSuplier', [HomeController::class, 'getTotalSuplier'])->middleware('check.permission:dashboard,can_view');
    Route::get('dashboard/getTotalPenjualan', [HomeController::class, 'getTotalPenjualan'])->middleware('check.permission:dashboard,can_view');
    Route::get('dashboard/getTotalPembelian', [HomeController::class, 'getTotalPembelian'])->middleware('check.permission:dashboard,can_view');
    Route::get('dashboard/getSalesChart', [HomeController::class, 'getSalesChart'])->middleware('check.permission:dashboard,can_view');
    Route::get('dashboard/getSalesChartPembelian', [HomeController::class, 'getSalesChartPembelian'])->middleware('check.permission:dashboard,can_view');
    Route::get('dashboard/getHargaEmas', [HomeController::class, 'getHargaEmas'])->middleware('check.permission:dashboard,can_view');
    Route::get('dashboard/getProdukPerbaikan', [HomeController::class, 'getProdukPerbaikan'])->middleware('check.permission:dashboard,can_view');
    Route::get('dashboard/getProduk', [HomeController::class, 'getTotalProduk'])->middleware('check.permission:dashboard,can_view');
    Route::get('dashboard/getTotalPenjualanHariIni', [HomeController::class, 'getTotalPenjualanHariIni'])->middleware('check.permission:dashboard,can_view');
    Route::get('dashboard/getTotalPembelianHariIni', [HomeController::class, 'getTotalPembelianHariIni'])->middleware('check.permission:dashboard,can_view');

    Route::get('jabatan/getJabatan', [JabatanController::class, 'getJabatan'])->middleware('check.permission:jabatan,can_view');
    Route::post('jabatan/storeJabatan', [JabatanController::class, 'storeJabatan'])->middleware('check.permission:jabatan,can_create');
    Route::post('jabatan/updateJabatan', [JabatanController::class, 'updateJabatan'])->middleware('check.permission:jabatan,can_edit');
    Route::post('jabatan/deleteJabatan', [JabatanController::class, 'deleteJabatan'])->middleware('check.permission:jabatan,can_delete');

    Route::get('pegawai/getPegawai', [PegawaiController::class, 'getPegawai'])->middleware('check.permission:pegawai,can_view');
    Route::post('pegawai/storePegawai', [PegawaiController::class, 'storePegawai'])->middleware('check.permission:pegawai,can_create');
    Route::post('pegawai/updatePegawai', [PegawaiController::class, 'updatePegawai'])->middleware('check.permission:pegawai,can_edit');
    Route::post('pegawai/deletePegawai', [PegawaiController::class, 'deletePegawai'])->middleware('check.permission:pegawai,can_delete');

    Route::get('role/getRole', [RoleController::class, 'getRole'])->middleware('check.permission:role,can_view');
    Route::post('role/storeRole', [RoleController::class, 'storeRole'])->middleware('check.permission:role,can_create');
    Route::post('role/updateRole', [RoleController::class, 'updateRole'])->middleware('check.permission:role,can_edit');
    Route::post('role/deleteRole', [RoleController::class, 'deleteRole'])->middleware('check.permission:role,can_delete');

    // api.php
    Route::prefix('permissions')->group(function () {
        // Biarkan semua user login bisa mengambil data ini untuk keperluan UI/Sidebar
        Route::get('getPermissionsByRole/{roleId}', [PermissionController::class, 'getPermissionsByRole']);

        // Tetap proteksi fungsi update hanya untuk yang punya akses edit role
        Route::post('updatePermission', [PermissionController::class, 'updatePermission'])
            ->middleware('check.permission:role,can_edit');
    });

    Route::get('users/getUsers', [UserController::class, 'getUser'])->middleware('check.permission:users,can_view');
    Route::post('users/updateUsers', [UserController::class, 'updateUser'])->middleware('check.permission:users,can_edit');

    Route::get('kondisi/getKondisi', [KondisiController::class, 'getKondisi'])->middleware('check.permission:kondisi,can_view');
    Route::post('kondisi/storeKondisi', [KondisiController::class, 'storeKondisi'])->middleware('check.permission:kondisi,can_create');
    Route::post('kondisi/updateKondisi', [KondisiController::class, 'updateKondisi'])->middleware('check.permission:kondisi,can_edit');
    Route::post('kondisi/deleteKondisi', [KondisiController::class, 'deleteKondisi'])->middleware('check.permission:kondisi,can_delete');

    Route::get('karat/getKarat', [KaratController::class, 'getKarat'])->middleware('check.permission:karat,can_view');
    Route::post('karat/storeKarat', [KaratController::class, 'storeKarat'])->middleware('check.permission:karat,can_create');
    Route::post('karat/updateKarat', [KaratController::class, 'updateKarat'])->middleware('check.permission:karat,can_edit');
    Route::post('karat/deleteKarat', [KaratController::class, 'deleteKarat'])->middleware('check.permission:karat,can_delete');

    Route::get('jeniskarat/getJenisKarat', [JenisKaratController::class, 'getJenisKarat'])->middleware('check.permission:jeniskarat,can_view');
    Route::post('jeniskarat/storeJenisKarat', [JenisKaratController::class, 'storeJenisKarat'])->middleware('check.permission:jeniskarat,can_create');
    Route::post('jeniskarat/updateJenisKarat', [JenisKaratController::class, 'updateJenisKarat'])->middleware('check.permission:jeniskarat,can_edit');
    Route::post('jeniskarat/deleteJenisKarat', [JenisKaratController::class, 'deleteJenisKarat'])->middleware('check.permission:jeniskarat,can_delete');

    Route::get('harga/getHarga', [HargaController::class, 'getHarga'])->middleware('check.permission:harga,can_view');
    Route::post('harga/storeHarga', [HargaController::class, 'storeHarga'])->middleware('check.permission:harga,can_create');
    Route::post('harga/updateHarga', [HargaController::class, 'updateHarga'])->middleware('check.permission:harga,can_edit');
    Route::post('harga/deleteHarga', [HargaController::class, 'deleteHarga'])->middleware('check.permission:harga,can_delete');

    Route::get('diskon/getDiskon', [DiskonController::class, 'getDiskon'])->middleware('check.permission:diskon,can_view');
    Route::post('diskon/storeDiskon', [DiskonController::class, 'storeDiskon'])->middleware('check.permission:diskon,can_create');
    Route::post('diskon/updateDiskon', [DiskonController::class, 'updateDiskon'])->middleware('check.permission:diskon,can_edit');
    Route::post('diskon/deleteDiskon', [DiskonController::class, 'deleteDiskon'])->middleware('check.permission:diskon,can_delete');

    Route::get('jenisproduk/getJenisProduk', [JenisProdukController::class, 'getJenisProduk'])->middleware('check.permission:jenisproduk,can_view');
    Route::post('jenisproduk/storeJenisProduk', [JenisProdukController::class, 'storeJenisProduk'])->middleware('check.permission:jenisproduk,can_create');
    Route::post('jenisproduk/updateJenisProduk', [JenisProdukController::class, 'updateJenisProduk'])->middleware('check.permission:jenisproduk,can_edit');
    Route::post('jenisproduk/deleteJenisProduk', [JenisProdukController::class, 'deleteJenisProduk'])->middleware('check.permission:jenisproduk,can_delete');

    Route::get('produk/getProduk', [ProdukController::class, 'getProduk'])->middleware('check.permission:produk,can_view');
    Route::post('produk/storeProduk', [ProdukController::class, 'storeProduk'])->middleware('check.permission:produk,can_create');
    Route::post('produk/updateProduk', [ProdukController::class, 'updateProduk'])->middleware('check.permission:produk,can_edit');
    Route::post('produk/deleteProduk', [ProdukController::class, 'deleteProduk'])->middleware('check.permission:produk,can_delete');
    Route::post('produk/getProdukByKode', [ProdukController::class, 'getProdukByKode'])->middleware('check.permission:produk,can_view');

    Route::get('nampan/getNampan', [NampanController::class, 'getNampan'])->middleware('check.permission:nampan,can_view');
    Route::post('nampan/storeNampan', [NampanController::class, 'storeNampan'])->middleware('check.permission:nampan,can_create');
    Route::post('nampan/updateNampan', [NampanController::class, 'updateNampan'])->middleware('check.permission:nampan,can_edit');
    Route::post('nampan/deleteNampan', [NampanController::class, 'deleteNampan'])->middleware('check.permission:nampan,can_delete');

    Route::get('nampanproduk/getNampanProduk', [NampanProdukController::class, 'getNampanProduk'])->middleware('check.permission:nampanproduk,can_view');
    Route::post('nampanproduk/getNampanProdukByNampan', [NampanProdukController::class, 'getNampanProdukByNampan'])->middleware('check.permission:nampanproduk,can_view');
    Route::post('nampanproduk/getProdukByJenisNampan', [NampanProdukController::class, 'getProdukByJenisNampan'])->middleware('check.permission:nampanproduk,can_view');
    Route::post('nampanproduk/storeNampanProduk', [NampanProdukController::class, 'storeNampanProduk'])->middleware('check.permission:nampanproduk,can_create');
    Route::post('nampanproduk/pindahNampanProduk', [NampanProdukController::class, 'pindahNampanProduk'])->middleware('check.permission:nampanproduk,can_edit');
    Route::post('nampanproduk/deleteNampanProduk', [NampanProdukController::class, 'deleteNampanProduk'])->middleware('check.permission:nampanproduk,can_delete');
    Route::post('nampanproduk/getProdukInNampanByJenis', [NampanProdukController::class, 'getProdukInNampanByJenis'])->middleware('check.permission:nampanproduk,can_view');

    Route::get('pelanggan/getPelanggan', [PelangganController::class, 'getPelanggan'])->middleware('check.permission:pelanggan,can_view');
    Route::post('pelanggan/storePelanggan', [PelangganController::class, 'storePelanggan'])->middleware('check.permission:pelanggan,can_create');
    Route::post('pelanggan/updatePelanggan', [PelangganController::class, 'updatePelanggan'])->middleware('check.permission:pelanggan,can_edit');
    Route::post('pelanggan/deletePelanggan', [PelangganController::class, 'deletePelanggan'])->middleware('check.permission:pelanggan,can_delete');
    Route::get('pelanggan/getPelangganUlangTahun', [PelangganController::class, 'getPelangganUlangTahun'])->middleware('check.permission:pelanggan,can_view');

    Route::get('suplier/getSuplier', [SuplierController::class, 'getSuplier'])->middleware('check.permission:suplier,can_view');
    Route::post('suplier/storeSuplier', [SuplierController::class, 'storeSuplier'])->middleware('check.permission:suplier,can_create');
    Route::post('suplier/updateSuplier', [SuplierController::class, 'updateSuplier'])->middleware('check.permission:suplier,can_edit');
    Route::post('suplier/deleteSuplier', [SuplierController::class, 'deleteSuplier'])->middleware('check.permission:suplier,can_delete');

    Route::get('pesan/getPesan', [PesanController::class, 'getPesan'])->middleware('check.permission:pesan,can_view');
    Route::post('pesan/storePesan', [PesanController::class, 'storePesan'])->middleware('check.permission:pesan,can_create');
    Route::post('pesan/updatePesan', [PesanController::class, 'updatePesan'])->middleware('check.permission:pesan,can_edit');
    Route::post('pesan/deletePesan', [PesanController::class, 'deletePesan'])->middleware('check.permission:pesan,can_delete');

    Route::get('saldo/getSaldo', [SaldoController::class, 'getSaldo'])->middleware('check.permission:saldo,can_view');
    Route::post('saldo/storeSaldo', [SaldoController::class, 'storeSaldo'])->middleware('check.permission:saldo,can_create');
    Route::post('saldo/updateSaldo', [SaldoController::class, 'updateSaldo'])->middleware('check.permission:saldo,can_edit');
    Route::post('saldo/deleteSaldo', [SaldoController::class, 'deleteSaldo'])->middleware('check.permission:saldo,can_delete');

    Route::get('mutasisaldo/getMutasiSaldo', [MutasiSaldoController::class, 'getMutasiSaldo'])->middleware('check.permission:mutasisaldo,can_view');
    Route::post('mutasisaldo/storeMutasiSaldo', [MutasiSaldoController::class, 'storeMutasiSaldo'])->middleware('check.permission:mutasisaldo,can_create');
    Route::post('mutasisaldo/updateMutasiSaldo', [MutasiSaldoController::class, 'updateMutasiSaldo'])->middleware('check.permission:mutasisaldo,can_edit');
    Route::post('mutasisaldo/deleteMutasiSaldo', [MutasiSaldoController::class, 'deleteMutasiSaldo'])->middleware('check.permission:mutasisaldo,can_delete');

    Route::get('transaksi/getKodeTransaksi', [TransaksiController::class, 'getKodeTransaksi'])->middleware('check.permission:transaksi,can_view');
    Route::post('transaksi/storeProdukToTransaksiDetail', [TransaksiController::class, 'storeProdukToTransaksiDetail'])->middleware('check.permission:transaksi,can_create');
    Route::get('transaksi/getTransaksiDetail', [TransaksiController::class, 'getTransaksiDetail'])->middleware('check.permission:transaksi,can_view');
    Route::post('transaksi/batalTransaksiDetail', [TransaksiController::class, 'batalTransaksiDetail'])->middleware('check.permission:transaksi,can_edit');
    Route::post('transaksi/paymentTransaksi', [TransaksiController::class, 'paymentTransaksi'])->middleware('check.permission:transaksi,can_create');
    Route::post('/transaksi/getSignedNotaPenjualanUrl', [TransaksiController::class, 'getSignedNotaPenjualanUrl'])->middleware('check.permission:transaksi,can_view');
    Route::post('telegram/sendnotification', [TransaksiController::class, 'sendTelegramNotification'])->middleware('check.permission:transaksi,can_create');

    Route::get('offtake/getKodeTransaksi', [OfftakeController::class, 'getKodeTransaksi'])->middleware('check.permission:offtake,can_view');
    Route::post('offtake/storeProdukToOfftakeDetail', [OfftakeController::class, 'storeProdukToOfftakeDetail'])->middleware('check.permission:offtake,can_create');
    Route::get('offtake/getOfftakeDetail', [OfftakeController::class, 'getOfftakeDetail'])->middleware('check.permission:offtake,can_view');
    Route::post('offtake/batalOfftakeDetail', [OfftakeController::class, 'batalOfftakeDetail'])->middleware('check.permission:offtake,can_edit');
    Route::post('offtake/paymentOfftake', [OfftakeController::class, 'paymentOfftake'])->middleware('check.permission:offtake,can_create');
    Route::post('/offtake/getSignedNotaOfftakeUrl', [OfftakeController::class, 'getSignedNotaOfftakeUrl'])->middleware('check.permission:offtake,can_view');

    Route::get('pembelian/getKodeTransaksi', [PembelianController::class, 'getKodeTransaksi'])->middleware('check.permission:pembelian,can_view');
    Route::post('pembelian/getTransaksiByKode', [PembelianController::class, 'getTransaksiByKode'])->middleware('check.permission:pembelian,can_view');
    Route::post('pembelian/storeProdukToPembelianDetail', [PembelianController::class, 'storeProdukToPembelianDetail'])->middleware('check.permission:pembelian,can_create');
    Route::get('pembelian/getPembelianDetail', [PembelianController::class, 'getPembelianDetail'])->middleware('check.permission:pembelian,can_view');
    Route::post('pembelian/updatePembelianDetail', [PembelianController::class, 'updatePembelianDetail'])->middleware('check.permission:pembelian,can_edit');
    Route::post('pembelian/batalPembelianDetail', [PembelianController::class, 'batalPembelianDetail'])->middleware('check.permission:pembelian,can_edit');
    Route::post('pembelian/paymentPembelian', [PembelianController::class, 'paymentPembelian'])->middleware('check.permission:pembelian,can_create');
    Route::post('/pembelian/getSignedNotaPembelianUrl', [PembelianController::class, 'getSignedNotaPembelianUrl'])->middleware('check.permission:pembelian,can_view');

    Route::get('pembelianluar/getPembelianDetailDariLuar', [PembelianController::class, 'getPembelianDetailDariLuar'])->middleware('check.permission:pembelian,can_view');
    Route::post('pembelianluar/storeProdukToPembelianDetailDariLuar', [PembelianController::class, 'storeProdukToPembelianDetailDariLuar'])->middleware('check.permission:pembelian,can_create');
    Route::post('pembelianluar/updatePembelianDetailDariLuar', [PembelianController::class, 'updatePembelianDetailDariLuar'])->middleware('check.permission:pembelian,can_edit');
    Route::post('pembelianluar/batalPembelianDetailDariLuar', [PembelianController::class, 'batalPembelianDetailDariLuar'])->middleware('check.permission:pembelian,can_edit');
    Route::post('pembelianluar/paymentPembelianDariLuar', [PembelianController::class, 'paymentPembelianDariLuar'])->middleware('check.permission:pembelian,can_create');

    Route::get('perbaikan/getPerbaikan', [PerbaikanController::class, 'getPerbaikan'])->middleware('check.permission:perbaikan,can_view');
    Route::post('perbaikan/finalPerbaikan', [PerbaikanController::class, 'finalPerbaikan'])->middleware('check.permission:perbaikan,can_edit');
    Route::post('perbaikan/batalPerbaikan', [PerbaikanController::class, 'batalPerbaikan'])->middleware('check.permission:perbaikan,can_edit');

    Route::get('transaksipenjualan/getTransaksiPenjualan', [TransaksiController::class, 'getTransaksiPenjualan'])->middleware('check.permission:penjualan,can_view');
    Route::post('transaksipenjualan/batalTransaksi', [TransaksiController::class, 'batalTransaksi'])->middleware('check.permission:penjualan,can_edit');

    Route::get('transaksipembelian/getTransaksiPembelian', [PembelianController::class, 'getTransaksiPembelian'])->middleware('check.permission:pembelian,can_view');
    Route::post('transaksipembelian/batalTransaksi', [PembelianController::class, 'batalTransaksi'])->middleware('check.permission:pembelian,can_edit');

    Route::get('transaksiofftake/getTransaksiOfftake', [OfftakeController::class, 'getTransaksiOfftake'])->middleware('check.permission:offtake,can_view');
    Route::post('transaksiofftake/batalTransaksi', [OfftakeController::class, 'batalTransaksi'])->middleware('check.permission:offtake,can_edit');

    Route::get('inventory/getPeriodeStok', [StokController::class, 'getPeriodeStok'])->middleware('check.permission:inventory,can_view');
    Route::post('inventory/storePeriodeStok', [StokController::class, 'storePeriodeStok'])->middleware('check.permission:inventory,can_create');
    Route::post('inventory/getNampanProdukByPeriodeStok', [StokController::class, 'getNampanProdukByPeriodeStok'])->middleware('check.permission:inventory,can_view');
    Route::post('inventory/getRekapStokByPeriode', [StokController::class, 'getRekapStokByPeriode'])->middleware('check.permission:inventory,can_view');
    Route::post('inventory/finalPeriodeStok', [StokController::class, 'finalPeriodeStok'])->middleware('check.permission:inventory,can_edit');
    Route::post('inventory/getSignedLaporanStokUrl', [StokController::class, 'getSignedLaporanStokUrl'])->middleware('check.permission:inventory,can_view');

    Route::post('laporan/getsignedurl-cetaklaporanpenjualan', [LaporanController::class, 'getSignedCetakLaporanPenjualanUrl'])->middleware('check.permission:laporan,can_view');
    Route::post('laporan/getsignedurl-cetaklaporanpembelian', [LaporanController::class, 'getSignedCetakLaporanPembelianUrl'])->middleware('check.permission:laporan,can_view');
    Route::post('laporan/getsignedurl-cetaklaporanofftake', [LaporanController::class, 'getSignedCetakLaporanOfftakeUrl'])->middleware('check.permission:laporan,can_view');
    Route::post('laporan/getsignedurl-cetaklaporanperbaikan', [LaporanController::class, 'getSignedCetakLaporanPerbaikanUrl'])->middleware('check.permission:laporan,can_view');
    Route::post('laporan/getsignedurl-cetaklaporanmutasisaldo', [LaporanController::class, 'getSignedCetakLaporanMutasiSaldoUrl'])->middleware('check.permission:laporan,can_view');
    Route::post('laporan/getsignedurl-cetaklaporanstokbulanan', [LaporanController::class, 'getSignedCetakLaporanStokBulananUrl'])->middleware('check.permission:laporan,can_view');
    Route::post('laporan/getsignedurl-cetaklaporannampan', [LaporanController::class, 'getSignedCetakLaporanNampanUrl'])->middleware('check.permission:laporan,can_view');
    Route::post('laporan/getsignedurl-cetaklaporanproduk', [LaporanController::class, 'getSignedCetakLaporanProdukUrl'])->middleware('check.permission:laporan,can_view');
});

Route::get('/transaksi/CetakNotaPenjualan', [TransaksiController::class, 'CetakNotaPenjualan'])->name('produk.cetak_notapenjualan');
Route::get('/pembelian/CetakNotaPembelian', [PembelianController::class, 'CetakNotaPembelian'])->name('produk.cetak_notapembelian');
Route::get('/offtake/CetakNotaOfftake', [OfftakeController::class, 'CetakNotaOfftake'])->name('produk.cetak_notaofftake');
Route::get('/inventory/CetakLaporanStok', [StokController::class, 'CetakLaporanStok'])->name('produk.cetak_laporanstok');

Route::get('/laporan/cetaklaporanpenjualan', [LaporanController::class, 'CetakLaporanPenjualan'])->name('produk.cetak_laporanpenjualan');
Route::get('/laporan/cetaklaporanpembelian', [LaporanController::class, 'CetakLaporanPembelian'])->name('produk.cetak_laporanpembelian');
Route::get('/laporan/cetaklaporanofftake', [LaporanController::class, 'CetakLaporanOfftake'])->name('produk.cetak_laporanofftake');
Route::get('/laporan/cetaklaporanperbaikan', [LaporanController::class, 'CetakLaporanPerbaikan'])->name('produk.cetak_laporanperbaikan');
Route::get('/laporan/cetaklaporanmutasisaldo', [LaporanController::class, 'CetakLaporanMutasiSaldo'])->name('produk.cetak_laporanmutasisaldo');
Route::get('/laporan/cetaklaporanstokbulanan', [LaporanController::class, 'CetakLaporanStokBulanan'])->name('produk.cetak_laporanstokbulanan');
Route::get('/laporan/cetaklaporannampan', [LaporanController::class, 'CetakLaporanNampan'])->name('produk.cetak_laporannampan');
Route::get('/laporan/cetaklaporanproduk', [LaporanController::class, 'CetakLaporanProduk'])->name('produk.cetak_laporanproduk');

Route::post('laporan/CompileReports', [CompailReportController::class, 'CompileReports']);

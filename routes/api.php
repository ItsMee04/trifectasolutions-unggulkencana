<?php

use App\Http\Controllers\Authentication\AuthController;
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

    Route::get('jabatan/getJabatan', [JabatanController::class, 'getJabatan']);
    Route::post('jabatan/storeJabatan', [JabatanController::class, 'storeJabatan']);
    Route::post('jabatan/updateJabatan', [JabatanController::class, 'updateJabatan']);
    Route::post('jabatan/deleteJabatan', [JabatanController::class, 'deleteJabatan']);

    Route::get('pegawai/getPegawai', [PegawaiController::class, 'getPegawai']);
    Route::post('pegawai/storePegawai', [PegawaiController::class, 'storePegawai']);
    Route::post('pegawai/updatePegawai', [PegawaiController::class, 'updatePegawai']);
    Route::post('pegawai/deletePegawai', [PegawaiController::class, 'deletePegawai']);

    Route::get('role/getRole', [RoleController::class, 'getRole']);
    Route::post('role/storeRole', [RoleController::class, 'storeRole']);
    Route::post('role/updateRole', [RoleController::class, 'updateRole']);
    Route::post('role/deleteRole', [RoleController::class, 'deleteRole']);

    Route::get('users/getUsers', [UserController::class, 'getUser']);
    Route::post('users/updateUsers', [UserController::class, 'updateUser']);

    Route::get('kondisi/getKondisi', [KondisiController::class, 'getKondisi']);
    Route::post('kondisi/storeKondisi', [KondisiController::class, 'storeKondisi']);
    Route::post('kondisi/updateKondisi', [KondisiController::class, 'updateKondisi']);
    Route::post('kondisi/deleteKondisi', [KondisiController::class, 'deleteKondisi']);

    Route::get('karat/getKarat', [KaratController::class, 'getKarat']);
    Route::post('karat/storeKarat', [KaratController::class, 'storeKarat']);
    Route::post('karat/updateKarat', [KaratController::class, 'updateKarat']);
    Route::post('karat/deleteKarat', [KaratController::class, 'deleteKarat']);

    Route::get('jeniskarat/getJenisKarat', [JenisKaratController::class, 'getJenisKarat']);
    Route::post('jeniskarat/storeJenisKarat', [JenisKaratController::class, 'storeJenisKarat']);
    Route::post('jeniskarat/updateJenisKarat', [JenisKaratController::class, 'updateJenisKarat']);
    Route::post('jeniskarat/deleteJenisKarat', [JenisKaratController::class, 'deleteJenisKarat']);

    Route::get('harga/getHarga', [HargaController::class, 'getHarga']);
    Route::post('harga/storeHarga', [HargaController::class, 'storeHarga']);
    Route::post('harga/updateHarga', [HargaController::class, 'updateHarga']);
    Route::post('harga/deleteHarga', [HargaController::class, 'deleteHarga']);

    Route::get('diskon/getDiskon', [DiskonController::class, 'getDiskon']);
    Route::post('diskon/storeDiskon', [DiskonController::class, 'storeDiskon']);
    Route::post('diskon/updateDiskon', [DiskonController::class, 'updateDiskon']);
    Route::post('diskon/deleteDiskon', [DiskonController::class, 'deleteDiskon']);

    Route::get('jenisproduk/getJenisProduk', [JenisProdukController::class, 'getJenisProduk']);
    Route::post('jenisproduk/storeJenisProduk', [JenisProdukController::class, 'storeJenisProduk']);
    Route::post('jenisproduk/updateJenisProduk', [JenisProdukController::class, 'updateJenisProduk']);
    Route::post('jenisproduk/deleteJenisProduk', [JenisProdukController::class, 'deleteJenisProduk']);

    Route::get('produk/getProduk', [ProdukController::class, 'getProduk']);
    Route::post('produk/storeProduk', [ProdukController::class, 'storeProduk']);
    Route::post('produk/updateProduk', [ProdukController::class, 'updateProduk']);
    Route::post('produk/deleteProduk', [ProdukController::class, 'deleteProduk']);

    Route::get('nampan/getNampan', [NampanController::class, 'getNampan']);
    Route::post('nampan/storeNampan', [NampanController::class, 'storeNampan']);
    Route::post('nampan/updateNampan', [NampanController::class, 'updateNampan']);
    Route::post('nampan/deleteNampan', [NampanController::class, 'deleteNampan']);

    Route::get('nampanproduk/getNampanProduk', [NampanProdukController::class, 'getNampanProduk']);
    Route::post('nampanproduk/getNampanProdukByNampan', [NampanProdukController::class, 'getNampanProdukByNampan']);
    Route::post('nampanproduk/getProdukByJenisNampan', [NampanProdukController::class, 'getProdukByJenisNampan']);
    Route::post('nampanproduk/storeNampanProduk', [NampanProdukController::class, 'storeNampanProduk']);
    Route::post('nampanproduk/pindahNampanProduk', [NampanProdukController::class, 'pindahNampanProduk']);
    Route::post('nampanproduk/deleteNampanProduk', [NampanProdukController::class, 'deleteNampanProduk']);
    Route::post('nampanproduk/getProdukInNampanByJenis', [NampanProdukController::class, 'getProdukInNampanByJenis']);


    Route::get('pelanggan/getPelanggan', [PelangganController::class, 'getPelanggan']);
    Route::post('pelanggan/storePelanggan', [PelangganController::class, 'storePelanggan']);
    Route::post('pelanggan/updatePelanggan', [PelangganController::class, 'updatePelanggan']);
    Route::post('pelanggan/deletePelanggan', [PelangganController::class, 'deletePelanggan']);

    Route::get('suplier/getSuplier', [SuplierController::class, 'getSuplier']);
    Route::post('suplier/storeSuplier', [SuplierController::class, 'storeSuplier']);
    Route::post('suplier/updateSuplier', [SuplierController::class, 'updateSuplier']);
    Route::post('suplier/deleteSuplier', [SuplierController::class, 'deleteSuplier']);

    Route::get('pesan/getPesan', [PesanController::class, 'getPesan']);
    Route::post('pesan/storePesan', [PesanController::class, 'storePesan']);
    Route::post('pesan/updatePesan', [PesanController::class, 'updatePesan']);
    Route::post('pesan/deletePesan', [PesanController::class, 'deletePesan']);

    Route::get('saldo/getSaldo', [SaldoController::class, 'getSaldo']);
    Route::post('saldo/storeSaldo', [SaldoController::class, 'storeSaldo']);
    Route::post('saldo/updateSaldo', [SaldoController::class, 'updateSaldo']);
    Route::post('saldo/deleteSaldo', [SaldoController::class, 'deleteSaldo']);

    Route::get('mutasisaldo/getMutasiSaldo', [MutasiSaldoController::class, 'getMutasiSaldo']);
    Route::post('mutasisaldo/storeMutasiSaldo', [MutasiSaldoController::class, 'storeMutasiSaldo']);
    Route::post('mutasisaldo/updateMutasiSaldo', [MutasiSaldoController::class, 'updateMutasiSaldo']);
    Route::post('mutasisaldo/deleteMutasiSaldo', [MutasiSaldoController::class, 'deleteMutasiSaldo']);

    Route::get('transaksi/getKodeTransaksi', [TransaksiController::class, 'getKodeTransaksi']);
    Route::post('transaksi/storeProdukToTransaksiDetail', [TransaksiController::class, 'storeProdukToTransaksiDetail']);
    Route::get('transaksi/getTransaksiDetail', [TransaksiController::class, 'getTransaksiDetail']);
    Route::post('transaksi/batalTransaksiDetail', [TransaksiController::class, 'batalTransaksiDetail']);
    Route::post('transaksi/paymentTransaksi', [TransaksiController::class, 'paymentTransaksi']);
    Route::post('/transaksi/getSignedNotaPenjualanUrl', [TransaksiController::class, 'getSignedNotaPenjualanUrl']);

    Route::get('offtake/getKodeTransaksi', [OfftakeController::class, 'getKodeTransaksi']);
    Route::post('offtake/storeProdukToOfftakeDetail', [OfftakeController::class, 'storeProdukToOfftakeDetail']);
    Route::get('offtake/getOfftakeDetail', [OfftakeController::class, 'getOfftakeDetail']);
    Route::post('offtake/batalOfftakeDetail', [OfftakeController::class, 'batalOfftakeDetail']);
    Route::post('offtake/paymentOfftake', [OfftakeController::class, 'paymentOfftake']);
    Route::post('/offtake/getSignedNotaOfftakeUrl', [OfftakeController::class, 'getSignedNotaOfftakeUrl']);

    Route::get('pembelian/getKodeTransaksi', [PembelianController::class, 'getKodeTransaksi']);
    Route::post('pembelian/getTransaksiByKode', [PembelianController::class, 'getTransaksiByKode']);
    Route::post('pembelian/storeProdukToPembelianDetail', [PembelianController::class, 'storeProdukToPembelianDetail']);
    Route::get('pembelian/getPembelianDetail', [PembelianController::class, 'getPembelianDetail']);
    Route::post('pembelian/updatePembelianDetail', [PembelianController::class, 'updatePembelianDetail']);
    Route::post('pembelian/batalPembelianDetail', [PembelianController::class, 'batalPembelianDetail']);
    Route::post('pembelian/paymentPembelian', [PembelianController::class, 'paymentPembelian']);
    Route::post('/pembelian/getSignedNotaPembelianUrl', [PembelianController::class, 'getSignedNotaPembelianUrl']);

    Route::get('pembelianluar/getPembelianDetailDariLuar', [PembelianController::class, 'getPembelianDetailDariLuar']);
    Route::post('pembelianluar/storeProdukToPembelianDetailDariLuar', [PembelianController::class, 'storeProdukToPembelianDetailDariLuar']);
    Route::post('pembelianluar/updatePembelianDetailDariLuar', [PembelianController::class, 'updatePembelianDetailDariLuar']);
    Route::post('pembelianluar/batalPembelianDetailDariLuar', [PembelianController::class, 'batalPembelianDetailDariLuar']);
    Route::post('pembelianluar/paymentPembelianDariLuar', [PembelianController::class, 'paymentPembelianDariLuar']);

    Route::get('perbaikan/getPerbaikan',[PerbaikanController::class, 'getPerbaikan']);
    Route::post('perbaikan/finalPerbaikan',[PerbaikanController::class, 'finalPerbaikan']);
    Route::post('perbaikan/batalPerbaikan',[PerbaikanController::class, 'batalPerbaikan']);

    Route::get('transaksipenjualan/getTransaksiPenjualan', [TransaksiController::class, 'getTransaksiPenjualan']);
    Route::post('transaksipenjualan/batalTransaksi', [TransaksiController::class, 'batalTransaksi']);

    Route::get('transaksipembelian/getTransaksiPembelian', [PembelianController::class, 'getTransaksiPembelian']);
    Route::post('transaksipembelian/batalTransaksi', [PembelianController::class, 'batalTransaksi']);

    Route::get('transaksiofftake/getTransaksiOfftake', [OfftakeController::class, 'getTransaksiOfftake']);
    Route::post('transaksiofftake/batalTransaksi', [OfftakeController::class, 'batalTransaksi']);

    Route::get('inventory/getPeriodeStok', [StokController::class, 'getPeriodeStok']);
    Route::post('inventory/storePeriodeStok', [StokController::class, 'storePeriodeStok']);
    Route::post('inventory/getNampanProdukByPeriodeStok', [StokController::class, 'getNampanProdukByPeriodeStok']);
    Route::post('inventory/getRekapStokByPeriode', [StokController::class, 'getRekapStokByPeriode']);
    Route::post('inventory/finalPeriodeStok', [StokController::class, 'finalPeriodeStok']);

    Route::post('laporan/getsignedurl-cetaklaporanpenjualan',[LaporanController::class, 'getSignedCetakLaporanPenjualanUrl']);
    Route::post('laporan/getsignedurl-cetaklaporanpembelian',[LaporanController::class, 'getSignedCetakLaporanPembelianUrl']);
});

Route::get('/transaksi/CetakNotaPenjualan', [TransaksiController::class, 'CetakNotaPenjualan'])->name('produk.cetak_notapenjualan');
Route::get('/pembelian/CetakNotaPembelian', [PembelianController::class, 'CetakNotaPembelian'])->name('produk.cetak_notapembelian');
Route::get('/offtake/CetakNotaOfftake', [OfftakeController::class, 'CetakNotaOfftake'])->name('produk.cetak_notaofftake');

Route::get('/laporan/cetaklaporanpenjualan', [LaporanController::class, 'CetakLaporanPenjualan'])->name('produk.cetak_laporanpenjualan');
Route::get('/laporan/cetaklaporanpembelian', [LaporanController::class, 'CetakLaporanPembelian'])->name('produk.cetak_laporanpembelian');

Route::post('laporan/CompileReports',[CompailReportController::class, 'CompileReports']);

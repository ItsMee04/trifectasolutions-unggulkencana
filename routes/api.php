<?php

use App\Http\Controllers\Authentication\AuthController;
use App\Http\Controllers\Master\DiskonController;
use App\Http\Controllers\Master\HargaController;
use App\Http\Controllers\Master\JabatanController;
use App\Http\Controllers\Master\JenisKaratController;
use App\Http\Controllers\Master\JenisProdukController;
use App\Http\Controllers\Master\KaratController;
use App\Http\Controllers\Master\KondisiController;
use App\Http\Controllers\Master\NampanController;
use App\Http\Controllers\Master\PegawaiController;
use App\Http\Controllers\Master\ProdukController;
use App\Http\Controllers\Master\RoleController;
use App\Http\Controllers\Master\UserController;
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
});

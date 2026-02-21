<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Master\Produk;
use App\Services\ProductService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Milon\Barcode\DNS1D;

class ProdukController extends Controller
{
    protected $productService;

    // Inject service ke controller
    public function __construct(ProductService $productService)
    {
        $this->productService = $productService;
    }

    public function getProduk()
    {
        $data = Produk::with(['jenisproduk', 'karat', 'jeniskarat', 'harga', 'kondisi'])->where('status', 1)->get();

        if ($data->isEmpty()) {
            return response()->json([
                'status' => false,
                'message' => 'Data produk tidak ditemukan',
                'data' => []
            ], 404);
        }

        return response()->json([
            'status' => true,
            'message' => 'Data produk berhasil diambil',
            'data' => $data
        ], 200);
    }

    public function storeProduk(Request $request)
    {
        // 1. Validasi dilakukan di awal.
        // Jika gagal di sini, fungsi generateUniqueCode() belum sempat dipanggil.
        $request->validate([
            'nama'          => 'required',
            'berat'         => ['required', 'regex:/^\d+\.\d{1,}$/'],
            'jenisproduk'   => 'required|exists:jenisproduk,id',
            'karat'         => 'required|exists:karat,id',
            'jeniskarat'    => 'required|exists:jeniskarat,id',
            'lingkar'       => 'nullable|integer',
            'panjang'       => 'nullable|integer',
            'harga'         => 'required|exists:hargas,id', // Sesuai diskusi, ini harga_id
            'keterangan'    => 'nullable|string',
            'image'         => 'image|mimes:jpeg,png,jpg|max:2048',
        ]);

        // 2. Gunakan Transaction untuk memastikan atomisitas
        DB::beginTransaction();

        try {
            // Generate kode hanya dilakukan SETELAH validasi request berhasil
            $kodeproduk = $this->productService->generateUniqueCode();

            /**
             * 3. Generate BARCODE
             */
            $barcodeGenerator = new DNS1D();
            // Gunakan parameter 2 (lebar) dan 25 (tinggi) agar barcode ramping [cite: 2025-10-25]
            $barcodeBase64 = $barcodeGenerator->getBarcodeJPG($kodeproduk, 'C128', 1.2, 20);
            $barcodeData = base64_decode($barcodeBase64);
            $barcodePath = 'images/barcode/' . $kodeproduk . '.jpg';

            // Simpan Barcode ke Storage
            Storage::disk('public')->put($barcodePath, $barcodeData);

            /**
             * 4. Handle Image Produk
             */
            $image = '';
            if ($request->hasFile('image')) {
                $extension = $request->file('image')->getClientOriginalExtension();
                $image = $kodeproduk . '.' . $extension;
                $request->file('image')->storeAs('images/produk', $image, 'public');
            }

            /**
             * 5. Simpan ke Database
             */
            $produk = Produk::create([
                'kodeproduk'      => $kodeproduk,
                'nama'            => strtoupper($request->nama),
                'berat'           => $request->berat,
                'jenisproduk_id'  => $request->jenisproduk,
                'karat_id'        => $request->karat,
                'jeniskarat_id'   => $request->jeniskarat,
                'lingkar'         => $request->lingkar ?? 0,
                'panjang'         => $request->panjang ?? 0,
                'harga_id'        => $request->harga,
                'keterangan'      => strtoupper($request->keterangan),
                'image'           => $image,
            ]);

            // Jika sampai sini tidak ada error, simpan permanen
            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Data produk berhasil disimpan',
                'data' => $produk
            ], 201);
        } catch (\Exception $e) {
            // Jika ada error apa pun (DB error, Disk full, dll), batalkan semua
            DB::rollBack();

            // Hapus file yang terlanjur diupload jika ada (opsional tapi bersih)
            if (isset($barcodePath)) Storage::disk('public')->delete($barcodePath);
            if ($image) Storage::disk('public')->delete('images/produk/' . $image);

            return response()->json([
                'status' => false,
                'message' => 'Gagal menyimpan data: ' . $e->getMessage()
            ], 500);
        }
    }

    public function updateProduk(Request $request)
    {
        // 1. Validasi Request
        $request->validate([
            'nama'          => 'required',
            'berat'         => ['required', 'regex:/^\d+\.\d{1,}$/'],
            'jenisproduk'   => 'required|exists:jenisproduk,id',
            'karat'         => 'required|exists:karat,id',
            'jeniskarat'    => 'required|exists:jeniskarat,id',
            'lingkar'       => 'nullable|integer',
            'panjang'       => 'nullable|integer',
            'harga'         => 'required|exists:harga,id',
            'keterangan'    => 'nullable|string',
            'image'         => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        DB::beginTransaction();

        try {
            // 2. Cari data produk yang akan diupdate
            $produk = Produk::findOrFail($request->id);
            $kodeproduk = $produk->kodeproduk; // Gunakan kode lama

            /**
             * 3. Handle Update Image Produk (Jika ada file baru)
             */
            $imageName = $produk->image; // Default ke nama file lama
            if ($request->hasFile('image')) {
                // Hapus foto lama jika ada di storage
                if ($produk->image && Storage::disk('public')->exists('images/produk/' . $produk->image)) {
                    Storage::disk('public')->delete('images/produk/' . $produk->image);
                }

                // Simpan foto baru dengan nama berdasarkan kodeproduk lama
                $extension = $request->file('image')->getClientOriginalExtension();
                $imageName = $kodeproduk . '.' . $extension;
                $request->file('image')->storeAs('images/produk', $imageName, 'public');
            }

            /**
             * 4. Update ke Database
             */
            $produk->update([
                'nama'            => strtoupper($request->nama),
                'berat'           => $request->berat,
                'jenisproduk_id'  => $request->jenisproduk,
                'karat_id'        => $request->karat,
                'jeniskarat_id'   => $request->jeniskarat,
                'lingkar'         => $request->lingkar ?? 0,
                'panjang'         => $request->panjang ?? 0,
                'harga_id'        => $request->harga,
                'keterangan'      => strtoupper($request->keterangan),
                'image'           => $imageName,
            ]);

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Data produk berhasil diperbarui',
                'data' => $produk
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'status' => false,
                'message' => 'Gagal memperbarui data: ' . $e->getMessage()
            ], 500);
        }
    }

    public function deleteProduk(Request $request)
    {
        $produk = Produk::find($request->id);

        if (!$produk) {
            return response()->json([
                'status' => false,
                'message' => 'Data produk tidak ditemukan',
                'data' => []
            ], 404);
        }

        $produk->update([
            'status' => 0
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Data produk berhasil dihapus',
            'data' => []
        ], 200);
    }
}

<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Master\Produk;
use App\Services\ProductService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Milon\Barcode\DNS1D;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Imagick\Driver;
use Intervention\Image\Interfaces\ImageInterface;

class ProdukController extends Controller
{
    protected ProductService $productService;

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
            ], 200);
        }

        return response()->json([
            'status' => true,
            'message' => 'Data produk berhasil diambil',
            'data' => $data
        ], 200);
    }

    public function storeProduk(Request $request)
    {
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

        $barcodePath = null;
        $imageNameForDb = null;

        try {
            // 🔹 Generate kode produk
            $kodeproduk = $this->productService->generateUniqueCode();

            // 🔹 Generate barcode
            $barcodeGenerator = new DNS1D();
            $barcodeBase64 = $barcodeGenerator->getBarcodePNG($kodeproduk, 'C128', 2, 40);
            $barcodeData = base64_decode($barcodeBase64);

            $barcodePath = 'images/barcode/' . $kodeproduk . '.png';
            Storage::disk('public')->put($barcodePath, $barcodeData);

            // 🔹 Handle image upload
            if ($request->hasFile('image')) {
                $file = $request->file('image');

                $imageNameForDb = $kodeproduk . '.' . $file->getClientOriginalExtension();

                $manager = new ImageManager(new Driver());

                $img = $manager->read($file->getRealPath());

                // resize + compress
                $img->scale(width: 800);
                $encoded = $img->toJpeg(75);

                Storage::disk('public')->put(
                    'images/produk/' . $imageNameForDb,
                    $encoded->toString()
                );
            }

            // 🔹 Simpan ke DB (PASTIKAN STRING, BUKAN OBJECT)
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
                'image'           => $imageNameForDb, // ✅ FIX DI SINI
            ]);

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Data produk berhasil disimpan',
                'data' => $produk
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();

            // 🔹 rollback file barcode
            if ($barcodePath && Storage::disk('public')->exists($barcodePath)) {
                Storage::disk('public')->delete($barcodePath);
            }

            // 🔹 rollback image
            if ($imageNameForDb && Storage::disk('public')->exists('images/produk/' . $imageNameForDb)) {
                Storage::disk('public')->delete('images/produk/' . $imageNameForDb);
            }

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
                // Hapus lama
                if ($produk->image && Storage::disk('public')->exists('images/produk/' . $produk->image)) {
                    Storage::disk('public')->delete('images/produk/' . $produk->image);
                }

                $file = $request->file('image');
                $imageName = $kodeproduk . '.' . $file->getClientOriginalExtension();

                $manager = new ImageManager(new Driver());

                /** @var ImageInterface $img */
                $img = $manager->read($file->getRealPath());

                $img->scale(width: 800);
                $encoded = $img->toJpeg(75);

                Storage::disk('public')->put('images/produk/' . $imageName, $encoded->toString());
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
            ], 200);
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

    public function getProdukByKode(Request $request)
    {
        $produk = Produk::with(['jenisproduk', 'karat', 'jeniskarat', 'harga', 'kondisi'])
            ->where('kodeproduk', $request->kodeproduk)
            ->where('status', 1)
            ->first();

        if (!$produk) {
            return response()->json([
                'status' => false,
                'message' => 'Data produk tidak ditemukan',
                'data' => []
            ], 200);
        }

        return response()->json([
            'status' => true,
            'message' => 'Data produk berhasil diambil',
            'data' => $produk
        ], 200);
    }
}

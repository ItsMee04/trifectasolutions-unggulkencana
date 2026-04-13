<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Master\JenisProduk;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Drivers\Imagick\Driver;
use Intervention\Image\ImageManager;
use Intervention\Image\Interfaces\ImageInterface;

class JenisProdukController extends Controller
{
    public function getJenisProduk()
    {
        $data = JenisProduk::where('status', 1)->get();

        if ($data->isEmpty()) {
            return response()->json([
                'status'    => false,
                'message'   => 'Data jenis produk tidak ditemukan',
                'data'      => []
            ], 404);
        }

        return response()->json([
            'status'    => true,
            'message'   => 'Data jenis produk berhasil diambil',
            'data'      => $data
        ], 200);
    }

    public function storeJenisProduk(Request $request)
    {
        $request->validate([
            'jenis'   => 'required|string|max:100',
            'image'   => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        $imageNameForDb = '';
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $imageNameForDb = strtoupper($request->jenis) . '.' . $file->getClientOriginalExtension();

            $manager = new ImageManager(new Driver());

            /** @var ImageInterface $image */
            $image = $manager->read($file->getRealPath());

            // Resize: Untuk jenis produk/kategori biasanya cukup 500px
            $image->scale(width: 500);

            // Encode dengan kualitas 75%
            $encoded = $image->toJpeg(75);

            Storage::disk('public')->put('images/jenisproduk/' . $imageNameForDb, $encoded->toString());
        }

        $data = JenisProduk::create([
            'jenis' => strtoupper($request->jenis),
            'image' => $imageNameForDb
        ]);

        return response()->json([
            'status'  => true,
            'message' => 'Data jenis produk berhasil disimpan',
            'data'    => $data,
        ], 201);
    }

    public function updateJenisProduk(Request $request)
    {
        $request->validate([
            'id'      => 'required|exists:jenisproduk,id',
            'jenis'   => 'required|string|max:100',
            'image'   => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        $jenisproduk = JenisProduk::findOrFail($request->id);
        $imageName = $jenisproduk->image;

        if ($request->hasFile('image')) {
            // Hapus image lama jika ada
            if ($jenisproduk->image && Storage::disk('public')->exists('images/jenisproduk/' . $jenisproduk->image)) {
                Storage::disk('public')->delete('images/jenisproduk/' . $jenisproduk->image);
            }

            $file = $request->file('image');
            $imageName = strtoupper($request->jenis) . '.' . $file->getClientOriginalExtension();

            $manager = new ImageManager(new Driver());

            /** @var ImageInterface $img */
            $img = $manager->read($file->getRealPath());

            // Resize & Compress
            $img->scale(width: 500);
            $encoded = $img->toJpeg(75);

            Storage::disk('public')->put('images/jenisproduk/' . $imageName, $encoded->toString());
        }

        $jenisproduk->update([
            'jenis' => strtoupper($request->jenis),
            'image' => $imageName
        ]);

        return response()->json([
            'status'  => true,
            'message' => 'Data jenis produk berhasil diupdate',
            'data'    => $jenisproduk,
        ], 200);
    }

    public function deleteJenisProduk(Request $request)
    {
        $jenisproduk = JenisProduk::find($request->id);

        if (!$jenisproduk) {
            return response()->json([
                'status'    => false,
                'message'   => 'Data jenis produk tidak ditemukan',
                'data'      => [],
            ], 404);
        }

        $jenisproduk->update([
            'status'    => 0,
        ]);

        return response()->json([
            'status'    => true,
            'message'   => 'Data jenis produk berhasil dihapus',
            'data'      => $jenisproduk,
        ], 200);
    }
}

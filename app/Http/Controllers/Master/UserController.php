<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function getUser()
    {
        $data = User::with(['pegawai.jabatan', 'role'])->where('status', 1)->get();

        if ($data->isEmpty()) {
            return response()->json([
                'status' => false,
                'message' => 'Data user tidak ditemukan',
                'data' => []
            ], 404);
        }

        return response()->json([
            'status' => true,
            'message' => 'Data user berhasil diambil',
            'data' => $data
        ], 200);
    }

    public function updateUser(Request $request)
    {
        $request->validate([
            'password'  => 'nullable|string|min:6',
            'role'      => 'nullable|exists:role,id',
        ]);

        $user = User::find($request->id);
        if (!$user) {
            return response()->json([
                'status' => false,
                'message' => 'Data user tidak ditemukan',
                'data' => []
            ], 404);
        }

        $hasEmail = !empty($user->email);
        $hasPassword = !empty($user->password);

        $rules = [];
        if (!$hasEmail || !$hasPassword) {
            $rules = [
                'email' => 'required|email|unique:users,email,' . $user->id,
                'password' => 'required|string|min:6',
            ];
        } else {
            if ($request->email !== $user->email) {
                $rules['email'] = 'required|email|unique:users,email,' . $user->id;
            }

            if(!empty($request->password)) {
                if(Hash::check($request->password, $user->password)) {
                    return response()->json([
                        'status' => false,
                        'message' => 'Password baru tidak boleh sama dengan password lama',
                        'data' => []
                    ], 400);
                    $rules['password'] = 'required|string|min:6';
                }
            }
        }

        $user->update([
            'email' => $request->email ?? $user->email,
            'password' => !empty($request->password) ? Hash::make($request->password) : $user->password,
            'role_id' => $request->role ?? $user->role_id,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Data user berhasil diupdate',
            'data' => $user
        ], 200);
    }

    public function deleteUser(Request $request)
    {
        $user = User::find($request->id);

        if (!$user) {
            return response()->json([
                'status' => false,
                'message' => 'Data user tidak ditemukan',
                'data' => []
            ], 404);
        }

        $user->update([
            'status' => 0
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Data user berhasil dihapus',
            'data' => []
        ], 200);
    }
}

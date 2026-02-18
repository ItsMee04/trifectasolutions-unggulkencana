<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Master\Role;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    public function getRole()
    {
        $data = Role::where('status',1)->get();

        if($data->isEmpty()){
            return response()->json([
                'status' => false,
                'message' => 'Data role tidak ditemukan',
                'data' => []
            ], 404);
        }

        return response()->json([
            'status' => true,
            'message' => 'Data role berhasil diambil',
            'data' => $data
        ], 200);
    }

    public function storeRole(Request $request)
    {
        $request->validate([
            'role' => 'required|string|max:100',
        ]);

        $role = Role::create([
            'role' => $request->role,
            'status' => 1
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Data role berhasil disimpan',
            'data' => $role
        ], 201);
    }

    public function updateRole(Request $request)
    {
        $request->validate([
            'role' => 'required|string|max:100',
        ]);

        $role = Role::find($request->id);

        if (!$role) {
            return response()->json([
                'status' => false,
                'message' => 'Data role tidak ditemukan',
                'data' => []
            ], 404);
        }

        $role->update([
            'role' => $request->role,
            'status' => 1
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Data role berhasil diupdate',
            'data' => $role
        ], 200);
    }

    public function deleteRole(Request $request)
    {
        $role = Role::find($request->id);

        if (!$role) {
            return response()->json([
                'status' => false,
                'message' => 'Data role tidak ditemukan',
                'data' => []
            ], 404);
        }

        $role->update([
            'status' => 0
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Data role berhasil dihapus',
            'data' => $role
        ], 200);
    }
}

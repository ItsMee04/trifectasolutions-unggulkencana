<?php

namespace App\Http\Controllers\Authentication;

use App\Http\Controllers\Controller;
use App\Models\Master\Permission;
use Illuminate\Http\Request;

class PermissionController extends Controller
{
    public function getPermissionsByRole($roleId)
    {
       $permissions = Permission::where('role_id', $roleId)->get();

        return response()->json($permissions);
    }

    /**
     * Update atau Create Hak Akses (Centang/Uncentang)
     */
    public function updatePermission(Request $request)
    {
        $request->validate([
            'role_id'   => 'required|integer',
            'menu_name' => 'required|string',
            'column'    => 'required|string', // Kirim 'can_view', 'can_create', dll
            'value'     => 'required|integer|in:0,1',
        ]);

        $permission = Permission::updateOrCreate(
            ['role_id' => $request->role_id, 'menu_name' => $request->menu_name],
            [$request->column => $request->value] // Mengupdate kolom secara dinamis
        );

        return response()->json(['success' => true, 'message' => 'Izin diperbarui']);
    }
}

<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string  $menu
     * @param  string  $action
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle(Request $request, Closure $next, $menu, $action): Response
    {
        // Gunakan $request->user() untuk mendapatkan user yang sedang login via Sanctum
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        /**
         * 1. BYPASS SUPERADMIN
         * Sesuai dengan response login Anda, kita cek string 'ADMIN'.
         * Jika user adalah ADMIN, dia bebas melewati pengecekan database.
         */
        if (strtoupper($user->role) === 'ADMIN' || strtoupper($user->jabatan) === 'ADMIN' || $user->role_id == 1) {
            return $next($request);
        }

        /**
         * 2. PENGECEKAN PERMISSION (Untuk Staff/User Biasa)
         */
        $hasPermission = DB::table('permissions')
            ->where('role_id', $user->role_id)
            ->where('menu_name', $menu)
            ->where($action, 1)
            ->exists();

        if (!$hasPermission) {
            return response()->json([
                'message' => "Anda tidak memiliki hak akses untuk aksi ini."
            ], 400);
        }

        return $next($request);
    }
}

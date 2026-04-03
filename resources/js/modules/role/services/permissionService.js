// src/modules/role/services/permissionService.js
import apiClient from "../../../helper/apiClient";

export const permissionService = {
    // 1. Mengambil SEMUA data permission (Object) untuk role tertentu
    // Endpoint: /api/permissions/getPermissionsByRole/{roleId}
    async getRolePermissions(roleId) {
        const response = await apiClient.get(`/permissions/getPermissionsByRole/${roleId}`);
        return response.data; // Sekarang mengembalikan [ {menu_name: 'pos', can_view: 1, can_create: 0, ...}, ... ]
    },

    // 2. Menyimpan perubahan secara dinamis untuk kolom apa pun
    // Endpoint: /api/permissions/updatePermission
    async updatePermission(roleId, menuName, column, value) {
        // Kirim sebagai satu objek payload
        const response = await apiClient.post('/permissions/updatePermission', {
            role_id: roleId,
            menu_name: menuName,
            column: column,
            value: value ? 1 : 0
        });
        return response.data;
    }
};

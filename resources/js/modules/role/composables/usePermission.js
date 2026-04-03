import { ref } from 'vue';
import { permissionService } from '../services/permissionService';
import { useAuthStore } from '../../../store/auth'; // Sesuaikan path store Anda
import toast from '../../../helper/toast'; // Sesuaikan path toast Anda

// --- SHARED STATE (Global di level module) ---
const permissions = ref([]);
const loadingPermission = ref(false);

export function usePermission() {

    const authStore = useAuthStore();
    /**
     * Mengambil data dari API dan menyimpannya ke state permissions
     */
    const fetchPermissions = async (roleId) => {
        if (!roleId) return;
        try {
            const data = await permissionService.getRolePermissions(roleId);
            permissions.value = data;
            sessionStorage.setItem('user_permissions', JSON.stringify(data));
        } catch (error) {
            console.error(error);
        }
    };

    /**
     * Fungsi untuk toggle checkbox
     */
    // src/modules/role/composables/usePermission.js

    const togglePermission = async (roleId, menuKey, column, value) => {
        try {
            await permissionService.updatePermission(roleId, menuKey, column, value);
            const item = permissions.value.find(p => p.menu_name === menuKey);
            if (item) {
                item[column] = value ? 1 : 0;
            }
            toast.success("Berhasil memperbarui hak akses");
        } catch (error) {
            toast.error("Gagal memperbarui hak akses");
        }
    };

    // Fungsi sakti untuk cek akses di UI
    const hasAccess = (menuName, action) => {
        // 1. AMBIL DARI STORE (Bukan manual storage)
        const user = authStore.user;
        if (!user) return false;

        // 2. BYPASS ADMIN (ID 1 atau String ADMIN)
        if (user.role_id == 1 || user.role?.toUpperCase() === 'ADMIN') {
            return true;
        }

        // 3. LOGIKA STAFF BIASA
        if (permissions.value.length === 0) {
            const backup = JSON.parse(sessionStorage.getItem('user_permissions') || '[]');
            permissions.value = backup;
        }

        return permissions.value.some(p => {
            const name = typeof p === 'string' ? p : p.menu_name;
            return name?.toLowerCase() === menuName?.toLowerCase();
        });
    };

    return {
        permissions,
        loadingPermission,
        fetchPermissions,
        togglePermission,
        hasAccess
    };
}

import { ref, computed, reactive } from "vue";
import toast from '../../../helper/toast'
import Swal from "sweetalert2";

import { usersService } from "../services/usersService";
import { roleService } from "../../role/services/roleService";

const users = ref([]);
const roleList = ref([])
const isLoading = ref(false);
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;
const isEdit = ref(false);
const errors = ref({});

const formUsers = reactive({
    id: null,
    nama: '',
    email: '',
    password: '',
    role: null
})

export function useUsers() {

    const fetchRole = async () => {
        try {
            const response = await roleService.getRole();
            // Map data agar formatnya { value: id, label: 'nama' } sesuai standar Multiselect
            roleList.value = response.data.map(roleList => ({
                value: roleList.id,
                label: roleList.role // Sesuaikan field 'role' dengan nama kolom di tabel roles Anda
            }));
        } catch (error) {
            console.error("Gagal memuat Role:", error);
        }
    };

    const fetchUsers = async () => {
        isLoading.value = true;
        try {
            const response = await usersService.getUsers();
            users.value = Array.isArray(response) ? response : (response.data || []);
        } catch (error) {
            users.value = [];
        } finally {
            isLoading.value = false;
        }
    }

    const validateForm = () => {
        errors.value = {};

        // Validasi Email (Tetap Wajib)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formUsers.email || formUsers.email.trim() === '') {
            errors.value.email = 'Email tidak boleh kosong';
        } else if (!emailRegex.test(formUsers.email)) {
            errors.value.email = 'Format email tidak valid';
        }

        // Validasi Password (Opsional)
        // Hanya divalidasi JIKA input password tidak kosong
        if (formUsers.password && formUsers.password.trim() !== '') {
            if (formUsers.password.length < 6) {
                errors.value.password = 'Password minimal harus 6 karakter';
            }
        }

        return Object.keys(errors.value).length === 0;
    };

    const handleEdit = (item) => {
        isEdit.value = true;
        errors.value = {};
        formUsers.nama = item.pegawai.nama;
        formUsers.id = item.id;
        formUsers.email = item.email;
        formUsers.password = null;
        // Logic Role
        const selectedRole = roleList.value.find(r => r.value === item.role_id);
        if (selectedRole) {
            formUsers.role = selectedRole;
        }
        const modal = new bootstrap.Modal(document.getElementById('usersModal'));
        modal.show();
    };

    const submitUsers = async () => {
        if (!validateForm()) return false;

        isLoading.value = true;
        try {
            const payload = {
                email: formUsers.email,
                password: formUsers.password,
                role: formUsers.role.value,
            }

            let response;
            if (isEdit.value) {
                payload.id = formUsers.id;
                response = await usersService.updateUsers(payload);
            }

            toast.success(response.message || 'Data berhasil disimpan');

            const modalElement = document.getElementById('usersModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) modalInstance.hide();

            await fetchUsers();

            return true;
        } catch (error) {
            if (error.response?.status === 422) {
                error.value = error.response.data.errors;

                const firstErrorMessage = error.response.data.message || 'Terjadi keselahan validasi';
                toast.error(firstErrorMessage);
            } else {
                console.log(error)
                toast.error(error.response?.message || 'Gagal menyimpan data');
            }

            return false;
        } finally {
            isLoading.value = false;
        }
    };

    const handleRefresh = async () => {
        await fetchUsers();
    }

    const totalPages = computed(() => {
        const query = searchQuery.value.toLowerCase(); // Ambil string pencarian
        const filteredCount = users.value.filter(item =>
            (item.email || '').toLowerCase().includes(query) ||
            (item.pegawai?.nama || '').toLowerCase().includes(query)
        ).length;

        return Math.ceil(filteredCount / itemsPerPage) || 1;
    });

    const displayedPages = computed(() => {
        const total = totalPages.value;
        const current = currentPage.value;
        const maxVisible = 5; // Jumlah nomor yang ingin ditampilkan

        let start = Math.max(current - Math.floor(maxVisible / 2), 1);
        let end = start + maxVisible - 1;

        if (end > total) {
            end = total;
            start = Math.max(end - maxVisible + 1, 1);
        }

        const pages = [];
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    });

    return {
        users,
        roleList,
        isLoading,
        searchQuery,
        currentPage,
        itemsPerPage,
        totalPages,
        displayedPages,
        isEdit,
        errors,
        formUsers,
        fetchUsers,
        fetchRole,
        handleEdit,
        handleRefresh,
        submitUsers,
        filteredUsers: computed(() => {
            return users.value.filter(item =>
                (item.email || '').toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                (item.pegawai?.nama || '').toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                (item.pegawai?.nip || '').toLowerCase().includes(searchQuery.value.toLowerCase())
            ).slice((currentPage.value - 1) * itemsPerPage, currentPage.value * itemsPerPage);
        }),
        paginatedUsers: computed(() => {
            const start = (currentPage.value - 1) * itemsPerPage;
            return (users.value.filter(item =>
                (item.email || '').toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                (item.pegawai?.nama || '').toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                (item.pegawai?.nip || '').toLowerCase().includes(searchQuery.value.toLowerCase())
            )).slice(start, start + itemsPerPage);
        }),
    }
}

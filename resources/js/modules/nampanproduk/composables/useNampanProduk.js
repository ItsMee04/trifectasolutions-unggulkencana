import { ref, computed, reactive } from "vue";
import toast from "../../../helper/toast";
import Swal from "sweetalert2";

import { nampanprodukService } from '../services/nampanprodukService';
import { nampanService } from "../../nampan/services/nampanService";
import { produkService } from '../../../modules/produk/services/produkService'

const nampanproduk = ref([]);
const nampan = ref([]);
const produk = ref([]);
const isLoading = ref(false);
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;
const isEdit = ref(false)
const errors = ref({});

const formNampanProduk = reactive({
    id: null,
    produk: ''
})

export function useNampanProduk() {

}

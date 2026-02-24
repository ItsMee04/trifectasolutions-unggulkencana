<template>
    <div class="content pos-design p-0">
        <div class="row align-items-start pos-wrapper">
            <PointOfSaleProdukList />

            <PointOfSaleKasirList />
        </div>
    </div>

    <!-- <PesanModal /> -->
</template>
<script setup>
import { onMounted } from 'vue';
// import { usePesan } from '../composables/usePesan';
import PointOfSaleProdukList from '../components/PointOfSaleProdukList.vue';
import PointOfSaleKasirList from '../components/PointOfSaleKasirList.vue';

// const { fetchPesan, handleRefresh, handleCreate } = usePesan();
// onMounted(() => {
//     fetchPesan();
// });
</script>

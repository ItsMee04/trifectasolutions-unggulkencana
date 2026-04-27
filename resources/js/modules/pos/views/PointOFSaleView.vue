<template>
    <div class="content pos-design p-0">
        <div class="row align-items-start pos-wrapper">
            <PointOfSaleProdukList />

            <PointOfSaleKasirList />
        </div>
    </div>

    <PointOfSalesPaymentSuccess />
    <PesanModal />
</template>
<script setup>
import { onMounted } from 'vue';
import PointOfSaleProdukList from '../components/PointOfSaleProdukList.vue';
import PointOfSaleKasirList from '../components/PointOfSaleKasirList.vue';
import PointOfSalesPaymentSuccess from '../components/PointOfSalesPaymentSuccess.vue'
import PesanModal from '../../pelanggan/components/PesanModal.vue';
</script>

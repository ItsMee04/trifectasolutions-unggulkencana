<template>
    <div class="col-md-12 col-lg-4 ps-0">
        <aside class="product-order-list">
            <div class="head d-flex align-items-center justify-content-between w-100">
                <div class>
                    <h5>DAFTAR ORDER</h5>
                    <span>Transaction ID : #65565</span>
                </div>
            </div>
            <div class="customer-info block-section">
                <h6>Informasi Pelanggan</h6>
                <div class="input-block d-flex align-items-center">
                    <div class="flex-grow-1">
                        <Multiselect v-model="formPOS.pelanggan" :options="PelangganList" :searchable="true"
                            label="label" track-by="value" placeholder="Pilih pelanggan" />
                        <div class="invalid-feedback" v-if="errors.pelanggan">{{ errors.pelanggan }}
                        </div>
                    </div>
                    <a href="#" class="btn btn-primary btn-icon" @click="handleCreatePelanggan">
                        <i data-feather="user-plus" class="feather-16"></i>
                    </a>
                </div>
            </div>
            <div class="product-added block-section">
                <div class="head-text d-flex align-items-center justify-content-between">
                    <h6 class="d-flex align-items-center mb-0">Produk Ditambahkan<span class="count">2</span>
                    </h6>
                    <a href="javascript:void(0);" class="d-flex align-items-center text-danger"><span class="me-1"><i
                                data-feather="x" class="feather-16"></i></span>Clear all</a>
                </div>
                <div class="product-wrap">
                    <div class="product-list d-flex align-items-center justify-content-between">
                        <div class="d-flex align-items-center product-info" data-bs-toggle="modal"
                            data-bs-target="#products">
                            <a href="javascript:void(0);" class="img-bg">
                                <img src="/public/assets/img/products/pos-product-16.png" alt="Products">
                            </a>
                            <div class="info">
                                <span>PT0005</span>
                                <h6><a href="javascript:void(0);">Red Nike Laser</a></h6>
                                <p>$2000</p>
                            </div>
                        </div>
                        <div class="qty-item text-center">
                            <a href="javascript:void(0);" class="dec d-flex justify-content-center align-items-center"
                                data-bs-toggle="tooltip" data-bs-placement="top" title="minus"><i
                                    data-feather="minus-circle" class="feather-14"></i></a>
                            <input type="text" class="form-control text-center" name="qty" value="4">
                            <a href="javascript:void(0);" class="inc d-flex justify-content-center align-items-center"
                                data-bs-toggle="tooltip" data-bs-placement="top" title="plus"><i
                                    data-feather="plus-circle" class="feather-14"></i></a>
                        </div>
                        <div class="d-flex align-items-center action">
                            <a class="btn-icon edit-icon me-2" href="#" data-bs-toggle="modal"
                                data-bs-target="#edit-product">
                                <i data-feather="edit" class="feather-14"></i>
                            </a>
                            <a class="btn-icon delete-icon confirm-text" href="javascript:void(0);">
                                <i data-feather="trash-2" class="feather-14"></i>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <div class="block-section">
                <div class="selling-info">
                    <div class="row">
                        <div class="col-12">
                            <div class="input-block">
                                <label>Diskon</label>
                                <Multiselect v-model="selectedDiskon" :options="DiskonList" :searchable="true"
                                    label="label" track-by="value" placeholder="Pilih diskon" />
                                <div class="invalid-feedback" v-if="errors.diskon">{{ errors.diskon }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="order-total">
                    <table class="table table-responsive table-borderless">
                        <tr>
                            <td>Sub Total</td>
                            <td class="text-end">$60,454</td>
                        </tr>
                        <tr>
                            <td class="danger">Diskon ({{ selectedDiskonNilai }}%)</td>
                            <td class="danger text-end">$15.21</td>
                        </tr>
                        <tr>
                            <td>Total</td>
                            <td class="text-end">$64,024.5</td>
                        </tr>
                    </table>
                </div>
            </div>
            <div class="d-grid btn-block">
                <a class="btn btn-secondary" href="javascript:void(0);">
                    Grand Total : $64,024.5
                </a>
            </div>
            <div class="btn-row d-sm-flex align-items-center justify-content-between" :disabled="isLoading">
                <a href="javascript:void(0);" class="btn btn-success btn-icon flex-fill">
                    <span class="me-1 d-flex align-items-center">
                        <i data-feather="credit-card" class="feather-16"></i>
                    </span>{{ isLoading ? 'Loading...' : ('PAYMENT') }}
                </a>
            </div>
        </aside>
    </div>
</template>
<script setup>
import { onMounted } from 'vue';
import { usePOS } from '../composables/usePOS';
import Multiselect from 'vue-multiselect';
import 'vue-multiselect/dist/vue-multiselect.css';

const {
    isLoading,
    errors,
    formPOS,
    PelangganList,
    DiskonList,
    selectedDiskon,
    selectedDiskonNilai,
    fetchPelanggan,
    fetchDiskon,
} = usePOS();

onMounted(() => {
    fetchPelanggan();
    fetchDiskon();
});
</script>

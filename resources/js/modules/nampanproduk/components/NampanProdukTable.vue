<template>
    <!-- <div class="setting-title d-flex align-items-center justify-content-between mb-3">
        <h4>Detail Isi Nampan: <span class="text-primary">Nampan Kayu Jati</span></h4>
    </div> -->

    <div class="card mb-3 border-0 shadow-sm bg-soft-primary">
        <div class="card-body p-3">
            <div class="row align-items-center text-center text-md-start">
                <div class="col-md-4 mb-2 mb-md-0">
                    <small class="text-muted d-block">Kode Nampan</small>
                    <span class="fw-bold">NP-001</span>
                </div>
                <div class="col-md-4 mb-2 mb-md-0">
                    <small class="text-muted d-block">Total Produk</small>
                    <span class="fw-bold">3 Item</span>
                </div>
                <div class="col-md-4 text-md-end">
                    <small class="text-muted d-block">Status</small>
                    <span class="badge bg-success">Aktif / Terisi</span>
                </div>
            </div>
        </div>
    </div>

    <div class="card">
        <div class="card-header bg-white border-bottom-0 pt-3 pb-0">
            <div class="row justify-content-end">
                <div class="col-md-4">
                    <div class="input-group input-group-sm mb-3">
                        <span class="input-group-text bg-transparent border-end-0">
                            <i data-feather="search" style="width: 14px; height: 14px;"></i>
                        </span>
                        <input type="text" class="form-control border-start-0 ps-0" placeholder="Cari Produk..."
                            v-model="searchQuery" />
                    </div>
                </div>
            </div>
        </div>

        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-nowrap mb-0">
                    <thead class="thead-light">
                        <tr>
                            <th class="ps-3">Nama Produk</th>
                            <th>SKU</th>
                            <th>Kategori</th>
                            <th>Stok</th>
                            <th class="text-end pe-3">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="ps-3">
                                <div class="d-flex align-items-center">
                                    <div class="bg-light p-1 rounded me-2">
                                        <i data-feather="image" style="width: 14px;"></i>
                                    </div>
                                    <span class="fw-medium">Cincin Emas 24K</span>
                                </div>
                            </td>
                            <td><span class="badge bg-light text-dark">JW-00192</span></td>
                            <td>Perhiasan</td>
                            <td>12 Pcs</td>
                            <td class="text-end pe-3">
                                <button class="btn btn-icon btn-sm text-info"><i data-feather="edit-3"
                                        style="width: 16px;"></i></button>
                                <button class="btn btn-icon btn-sm text-danger"><i data-feather="trash-2"
                                        style="width: 16px;"></i></button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="card-footer bg-white border-top-0 d-flex justify-content-between align-items-center p-3">
            <small class="text-muted">Menampilkan 1 dari 1 produk</small>
            <nav>
                <ul class="pagination pagination-xs mb-0">
                    <li class="page-item disabled"><a class="page-link" href="#">Prev</a></li>
                    <li class="page-item active"><a class="page-link" href="#">1</a></li>
                    <li class="page-item disabled"><a class="page-link" href="#">Next</a></li>
                </ul>
            </nav>
        </div>
    </div>
</template>

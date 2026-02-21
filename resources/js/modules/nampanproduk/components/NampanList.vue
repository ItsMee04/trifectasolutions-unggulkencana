<template>
    <div class="card shadow-sm border-0 mb-3">
        <div class="card-body p-0">
            <div class="p-3 border-bottom">
                <h6 class="fw-bold mb-3">Daftar Nampan</h6>
                <div class="input-group">
                    <span class="input-group-text bg-white border-end-0">
                        <i data-feather="search" style="width: 14px;"></i>
                    </span>
                    <input type="text" class="form-control border-start-0" placeholder="Cari nampan...">
                </div>
            </div>

            <div class="list-group list-group-flush">
                <a href="#" class="list-group-item list-group-item-action border-0 py-3 bg-light shadow-sm">
                    <div class="d-flex align-items-center justify-content-between">
                        <div class="d-flex align-items-center">
                            <div class="bg-soft-warning p-2 rounded me-3">
                                <i data-feather="box" class="text-warning" style="width: 18px;"></i>
                            </div>
                            <div>
                                <span class="d-block fw-bold">Nampan Kayu Jati</span>
                                <small class="text-muted">Kode: NP-001</small>
                            </div>
                        </div>
                        <i data-feather="chevron-right" class="text-warning" style="width: 16px;"></i>
                    </div>
                </a>
            </div>

            <div class="p-3 text-center">
                <nav class="d-inline-block">
                    <ul class="pagination pagination-sm mb-0">
                        <li class="page-item disabled"><a class="page-link" href="#">Prev</a></li>
                        <li class="page-item active"><a class="page-link" href="#"
                                style="background-color: #ff9f43; border-color: #ff9f43;">1</a></li>
                        <li class="page-item"><a class="page-link" href="#">Next</a></li>
                    </ul>
                </nav>
            </div>
        </div>
    </div>
</template>

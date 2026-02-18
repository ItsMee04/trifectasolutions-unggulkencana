import './bootstrap';
import { createApp } from 'vue';
import { createPinia } from 'pinia'; // 1. Impor Pinia
import App from './views/App.vue';
import router from './router';

/**
 * RENDER ASSETS
 * Mengimpor aset template dari folder public agar diproses oleh Vite
 */
import '../../public/assets/css/bootstrap.min.css';
import '../../public/assets/plugins/fontawesome/css/fontawesome.min.css';
import '../../public/assets/plugins/fontawesome/css/all.min.css';
import '../../public/assets/css/style.css';

// Inisialisasi App
const app = createApp(App);

// 2. Inisialisasi Pinia
const pinia = createPinia();

// 3. Gunakan Pinia sebelum Router (agar router guard bisa akses store jika perlu)
app.use(pinia);
app.use(router);
app.mount('#app');

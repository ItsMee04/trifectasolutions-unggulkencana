import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.js'],
            refresh: true,
        }),
        vue(),
    ],

    // server: {
    //     host: '0.0.0.0',
    //     port: 5173,
    //     hmr: {
    //         host: '127.0.0.1', // ganti dengan IP PC server
    //     },
    // },

    resolve: {
        alias: {
            'vue': 'vue/dist/vue.esm-bundler.js',
            '@': '/resources/js', // Alias agar import lebih mudah
        },
    },
});

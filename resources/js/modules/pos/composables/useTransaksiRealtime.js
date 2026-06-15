// useTransaksiRealtime.js
import { onMounted, onUnmounted } from 'vue';

export function useTransaksiRealtime(callback) {
    const listenToTransaksi = () => {
        if (!window.Echo) return;

        // Pastikan nama event sesuai dengan yang dikirim Laravel
        window.Echo.channel('transaksi-channel')
            .listen('TransaksiUpdated', (e) => {
                console.log("WebSocket: Triggering callback...");
                if (callback) callback();
            });
    };

    onMounted(() => listenToTransaksi());
    onUnmounted(() => window.Echo?.leaveChannel('transaksi-channel'));
}

import { onMounted, onUnmounted } from 'vue';

export function useTransaksiRealtime(callback) {
    const listenToTransaksi = () => {
        if (!window.Echo) {
            console.error('Echo belum diinisialisasi!');
            return;
        }

        window.Echo.channel('transaksi-channel')
            .listen('.TransaksiUpdated', (e) => { // Perhatikan titik (.)
                console.log("WebSocket: Update diterima, memuat ulang tabel...");
                if (callback) callback();
            });
    };

    const stopListening = () => {
        if (window.Echo) {
            window.Echo.leaveChannel('transaksi-channel');
        }
    };

    onMounted(() => {
        listenToTransaksi();
    });

    onUnmounted(() => {
        stopListening();
    });
}

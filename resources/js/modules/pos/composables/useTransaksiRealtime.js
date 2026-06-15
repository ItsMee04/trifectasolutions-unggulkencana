import { onMounted, onUnmounted } from 'vue';

export function useTransaksiRealtime(callback) {
    const listenToTransaksi = () => {
        if (!window.Echo) {
            console.error('Echo belum diinisialisasi!');
            return;
        }

        window.Echo.channel('transaksi-channel')
            .listen('TransaksiUpdated', (e) => { // Hapus titik (.) di depan
                console.log("WebSocket: Data diterima dari event TransaksiUpdated:", e);
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

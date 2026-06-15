import { onMounted, onUnmounted } from 'vue';

export function useTransaksiRealtime(callback) {
    const listenToTransaksi = () => {
        window.Echo.channel('transaksi-channel')
            .listen('TransaksiUpdated', (e) => {
                console.log('Event diterima, menjalankan callback...');
                if (callback) callback();
            });
    };

    const stopListening = () => {
        window.Echo.leaveChannel('transaksi-channel');
    };

    onMounted(() => {
        listenToTransaksi();
    });

    onUnmounted(() => {
        stopListening();
    });
}

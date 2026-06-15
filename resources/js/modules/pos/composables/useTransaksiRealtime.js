import { onMounted, onUnmounted } from 'vue';

export function useTransaksiRealtime(callback) {
    const channelName = 'transaksi-channel';

    const listenToTransaksi = () => {
        if (!window.Echo) {
            console.error('Laravel Echo belum terinisialisasi');
            return;
        }

        window.Echo.channel(channelName)
            .listen('.TransaksiUpdated', (event) => {
                callback?.(event);
            });
    };

    onMounted(listenToTransaksi);

    onUnmounted(() => {
        window.Echo.leaveChannel(channelName);
    });
}

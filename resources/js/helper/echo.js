import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST, // Ini akan otomatis menjadi 192.168.1.50
    wsPort: import.meta.env.VITE_REVERB_PORT, // Ini akan otomatis menjadi 8080
    wssPort: import.meta.env.VITE_REVERB_PORT,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'http') === 'https',
    enabledTransports: ['ws', 'wss'],
});

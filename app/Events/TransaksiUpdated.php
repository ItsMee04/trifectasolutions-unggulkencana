<?php

namespace App\Events;

// use Illuminate\Broadcasting\Channel;

use App\Models\Transaksi\Transaksi;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
// use Illuminate\Broadcasting\PresenceChannel;
// use Illuminate\Broadcasting\PrivateChannel;
// use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TransaksiUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    // Tambahkan properti publik di sini
    public Transaksi $transaksi;

    public function __construct(Transaksi $transaksi)
    {
        // Data transaksi akan diterima saat event di-trigger di controller
        $this->transaksi = $transaksi;
    }

    public function broadcastOn(): Channel
    {
        return new Channel('transaksi-channel');
    }
}

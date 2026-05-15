<?php

namespace App\Console\Commands;

use App\Models\Master\Pelanggan;
use App\Services\TelegramService;
use Illuminate\Console\Command;

class SendBirthdayTelegram extends Command
{
    protected $signature = 'telegram:birthday';

    protected $description = 'Kirim notifikasi ulang tahun pelanggan ke Telegram';

    public function handle()
    {
        $today = now();

        $pelanggan = Pelanggan::whereMonth('tanggal', $today->month)
            ->whereDay('tanggal', $today->day)
            ->where('status', 1)
            ->get();

        if ($pelanggan->isEmpty()) {
            $this->info('Tidak ada ulang tahun hari ini.');
            return;
        }

        $message = "🎉 <b>Ulang Tahun Pelanggan Hari Ini</b>\n\n";

        foreach ($pelanggan as $p) {

            $phone = preg_replace('/^0/', '62', preg_replace('/[^0-9]/', '', $p->kontak));

            $waLink = "https://wa.me/{$phone}";

            $message .= "👤 <b>{$p->nama}</b>\n";
            $message .= "📞 {$p->kontak}\n";
            $message .= "📲 <a href='{$waLink}'>Chat WhatsApp</a>\n\n";
        }

        app(TelegramService::class)->sendMessage($message);

        $this->info('Notifikasi Telegram berhasil dikirim.');
    }
}

<?php

namespace Database\Seeders;

use App\Models\Master\Karat;
use Illuminate\Database\Seeder;

class KaratSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $data = [
            '8',
            '9',
            '10',
        ];

        foreach ($data as $value) {
            Karat::create([
                'karat'     => $value,
                'status'    => 1
            ]);
        }
    }
}

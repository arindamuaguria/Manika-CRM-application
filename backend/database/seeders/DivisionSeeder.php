<?php

namespace Database\Seeders;

use App\Models\Division;
use Illuminate\Database\Seeder;

class DivisionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $divisions = [
            ['name' => 'Alipurduar', 'code' => 'DIV-ALIPURDUAR'],
            ['name' => 'Bankura', 'code' => 'DIV-BANKURA'],
            ['name' => 'Birbhum', 'code' => 'DIV-BIRBHUM'],
            ['name' => 'Cooch Behar', 'code' => 'DIV-COOCH-BEHAR'],
            ['name' => 'Dakshin Dinajpur', 'code' => 'DIV-DAKSHIN-DINAJPUR'],
            ['name' => 'Darjeeling', 'code' => 'DIV-DARJEELING'],
            ['name' => 'Hooghly', 'code' => 'DIV-HOOGHLY'],
            ['name' => 'Howrah', 'code' => 'DIV-HOWRAH'],
            ['name' => 'Jalpaiguri', 'code' => 'DIV-JALPAIGURI'],
            ['name' => 'Jhargram', 'code' => 'DIV-JHARGRAM'],
            ['name' => 'Kalimpong', 'code' => 'DIV-KALIMPONG'],
            ['name' => 'Kolkata', 'code' => 'DIV-KOLKATA'],
            ['name' => 'Malda', 'code' => 'DIV-MALDA'],
            ['name' => 'Murshidabad', 'code' => 'DIV-MURSHIDABAD'],
            ['name' => 'Nadia', 'code' => 'DIV-NADIA'],
            ['name' => 'North 24 Parganas', 'code' => 'DIV-NORTH-24-PARGANAS'],
            ['name' => 'Paschim Bardhaman', 'code' => 'DIV-PASCHIM-BARDHAMAN'],
            ['name' => 'Paschim Medinipur', 'code' => 'DIV-PASCHIM-MEDINIPUR'],
            ['name' => 'Purba Bardhaman', 'code' => 'DIV-PURBA-BARDHAMAN'],
            ['name' => 'Purba Medinipur', 'code' => 'DIV-PURBA-MEDINIPUR'],
            ['name' => 'Purulia', 'code' => 'DIV-PURULIA'],
            ['name' => 'South 24 Parganas', 'code' => 'DIV-SOUTH-24-PARGANAS'],
            ['name' => 'Uttar Dinajpur', 'code' => 'DIV-UTTAR-DINAJPUR'],
        ];

        foreach ($divisions as $division) {
            Division::firstOrCreate(
                ['code' => $division['code']],
                [
                    'name' => $division['name'],
                    'description' => "Division of {$division['name']}",
                    'is_active' => true,
                ]
            );
        }
    }
}

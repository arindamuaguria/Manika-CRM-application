<?php

namespace Database\Seeders;

use App\Models\Division;
use App\Models\Territory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class TerritorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $data = [
            'Kolkata' => [
                'Chowrangee',
                'Entally',
                'Beleghata',
                'Jorasanko',
                'Shyampukur',
                'Maniktala',
                'Kashipur-Belgachhia',
                'Kolkata Port',
                'Bhabanipur',
                'Rashbehari',
                'Ballygunge',
            ],
            'North 24 Parganas' => [
                'Bagda',
                'Bangaon Uttar',
                'Bangaon Dakshin',
                'Gaighata',
                'Swarupnagar',
                'Baduria',
                'Habra',
                'Ashoknagar',
                'Amdanga',
                'Bijpur',
                'Naihati',
                'Bhatpara',
                'Jagatdal',
                'Noapara',
                'Barrackpore',
                'Khardaha',
                'Dum Dum North',
                'Panihati',
                'Kamarhati',
                'Baranagar',
                'Dum Dum',
                'Rajarhat New Town',
                'Bidhannagar',
                'Rajarhat Gopalpur',
                'Madhyamgram',
                'Barasat',
                'Deganga',
                'Haroa',
                'Minakhan',
                'Sandeshkhali',
                'Basirhat Dakshin',
                'Basirhat Uttar',
                'Hingalganj',
            ],
            'South 24 Parganas' => [
                'Gosaba',
                'Basanti',
                'Kultali',
                'Patharpratima',
                'Kakdwip',
                'Sagar',
                'Kulpi',
                'Raidighi',
                'Mandirbazar',
                'Jaynagar',
                'Baruipur Purba',
                'Canning Paschim',
                'Canning Purba',
                'Baruipur Paschim',
                'Magrahat Purba',
                'Magrahat Paschim',
                'Diamond Harbour',
                'Falta',
                'Satgachia',
                'Bishnupur',
                'Sonarpur Dakshin',
                'Bhangar',
                'Kasba',
                'Jadavpur',
                'Sonarpur Uttar',
                'Tollygunge',
                'Behala Purba',
                'Behala Paschim',
                'Maheshtala',
                'Budge Budge',
                'Metiabruz',
            ],
            'Howrah' => [
                'Udaynarayanpur',
                'Amta',
                'Jagatballavpur',
                'Panchla',
                'Uluberia Purba',
                'Uluberia Uttar',
                'Uluberia Dakshin',
                'Shyampur',
                'Bagnan',
                'Amta Paschim',
                'Bally',
                'Howrah Uttar',
                'Howrah Madhya',
                'Shibpur',
                'Howrah Dakshin',
                'Sankrail',
            ],
        ];

        foreach ($data as $divisionName => $territories) {
            $division = Division::where('name', $divisionName)->first();

            if (!$division) {
                $this->command->warn("Division not found: {$divisionName}");
                continue;
            }

            foreach ($territories as $territoryName) {
                $code = 'TERR-' . Str::upper(Str::slug($territoryName));
                
                Territory::firstOrCreate(
                    ['code' => $code],
                    [
                        'division_id' => $division->id,
                        'name' => $territoryName,
                        'description' => "Territory {$territoryName} under {$divisionName} division",
                        'is_active' => true,
                    ]
                );
            }
        }
    }
}

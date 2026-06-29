<?php

namespace Database\Factories;

use App\Models\Division;
use App\Models\Territory;
use Illuminate\Database\Eloquent\Factories\Factory;

class TerritoryFactory extends Factory
{
    protected $model = Territory::class;

    public function definition(): array
    {
        $name = $this->faker->unique()->city();

        return [
            'division_id' => Division::factory(),
            'name' => $name,
            'code' => 'TERR-'.strtoupper(substr($name, 0, 3)).'-'.$this->faker->unique()->numberBetween(100, 999),
            'description' => $this->faker->sentence(),
            'boundaries' => [
                'type' => 'Polygon',
                'coordinates' => [[
                    [77.0, 28.0],
                    [78.0, 28.0],
                    [78.0, 29.0],
                    [77.0, 29.0],
                    [77.0, 28.0],
                ]],
            ],
            'is_active' => true,
        ];
    }
}

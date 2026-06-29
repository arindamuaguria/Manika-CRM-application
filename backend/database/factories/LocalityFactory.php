<?php

namespace Database\Factories;

use App\Models\Locality;
use App\Models\Territory;
use Illuminate\Database\Eloquent\Factories\Factory;

class LocalityFactory extends Factory
{
    protected $model = Locality::class;

    public function definition(): array
    {
        $name = $this->faker->unique()->streetName();

        return [
            'territory_id' => Territory::factory(),
            'name' => $name,
            'code' => 'LOC-'.strtoupper(substr($name, 0, 3)).'-'.$this->faker->unique()->numberBetween(100, 999),
            'description' => $this->faker->sentence(),
            'polygon' => [
                'type' => 'Polygon',
                'coordinates' => [[
                    [77.1, 28.1],
                    [77.2, 28.1],
                    [77.2, 28.2],
                    [77.1, 28.2],
                    [77.1, 28.1],
                ]],
            ],
            'is_active' => true,
        ];
    }
}

<?php

namespace Database\Factories;

use App\Models\Division;
use Illuminate\Database\Eloquent\Factories\Factory;

class DivisionFactory extends Factory
{
    protected $model = Division::class;

    public function definition(): array
    {
        $name = $this->faker->unique()->state();

        return [
            'name' => $name,
            'code' => 'DIV-'.strtoupper(substr($name, 0, 3)).'-'.$this->faker->unique()->numberBetween(100, 999),
            'description' => $this->faker->sentence(),
            'is_active' => true,
        ];
    }
}

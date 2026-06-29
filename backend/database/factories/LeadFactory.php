<?php

namespace Database\Factories;

use App\Models\Lead;
use Illuminate\Database\Eloquent\Factories\Factory;

class LeadFactory extends Factory
{
    protected $model = Lead::class;

    public function definition(): array
    {
        return [
            'title' => $this->faker->company().' Lead',
            'contact_name' => $this->faker->name(),
            'contact_email' => $this->faker->unique()->safeEmail(),
            'contact_mobile' => '9'.$this->faker->unique()->numerify('#########'),
            'address' => $this->faker->address(),
            'latitude' => $this->faker->latitude(28.0, 29.0),
            'longitude' => $this->faker->longitude(77.0, 78.0),
            'locality_id' => null,
            'territory_id' => null,
            'division_id' => null,
            'assigned_bdm_id' => null,
            'source' => $this->faker->randomElement(['web', 'referral', 'cold_call', 'social']),
            'status' => 'new',
            'priority' => $this->faker->randomElement(['low', 'medium', 'high']),
            'notes' => $this->faker->paragraph(),
            'is_mapped' => false,
        ];
    }
}

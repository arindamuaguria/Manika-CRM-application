<?php

namespace Database\Factories;

use App\Models\Deal;
use App\Models\Lead;
use App\Models\Territory;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class DealFactory extends Factory
{
    protected $model = Deal::class;

    public function definition(): array
    {
        return [
            'lead_id' => Lead::factory(),
            'title' => $this->faker->company().' Deal',
            'description' => $this->faker->sentence(),
            'value' => $this->faker->randomFloat(2, 10000, 500000),
            'status' => 'draft',
            'assigned_bdm_id' => User::factory(),
            'territory_id' => Territory::factory(),
            'verification_status' => 'pending',
            'approval_status' => 'pending',
        ];
    }
}

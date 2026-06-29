<?php

namespace Database\Factories;

use App\Models\Deal;
use App\Models\Locality;
use App\Models\Partner;
use App\Models\Territory;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class PartnerFactory extends Factory
{
    protected $model = Partner::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'deal_id' => Deal::factory(),
            'partner_type' => $this->faker->randomElement(['seller', 'service_person']),
            'business_name' => $this->faker->company(),
            'business_address' => $this->faker->address(),
            'latitude' => $this->faker->latitude(28.0, 29.0),
            'longitude' => $this->faker->longitude(77.0, 78.0),
            'locality_id' => Locality::factory(),
            'territory_id' => Territory::factory(),
            'contact_name' => $this->faker->name(),
            'contact_email' => $this->faker->unique()->safeEmail(),
            'contact_mobile' => '9'.$this->faker->unique()->numerify('#########'),
            'status' => 'active',
            'onboarded_at' => now(),
        ];
    }
}

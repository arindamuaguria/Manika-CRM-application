<?php

namespace Database\Factories;

use App\Models\CrmNotification;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class CrmNotificationFactory extends Factory
{
    protected $model = CrmNotification::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'type' => $this->faker->randomElement(['lead_assigned', 'document_uploaded', 'document_verified']),
            'title' => $this->faker->sentence(3),
            'message' => $this->faker->paragraph(1),
            'data' => null,
            'channel' => 'in_app',
            'is_read' => false,
        ];
    }
}

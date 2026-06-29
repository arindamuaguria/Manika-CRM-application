<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed roles and permissions
        $this->seed(RolePermissionSeeder::class);
    }

    #[Test]
    public function user_can_login_with_valid_credentials()
    {
        $user = User::factory()->create([
            'email' => 'test@manika.com',
            'password' => Hash::make('password123'),
            'is_active' => true,
        ]);
        $user->assignRole('Admin');

        $response = $this->postJson('/api/auth/login', [
            'email' => 'test@manika.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'user' => [
                        'id',
                        'name',
                        'email',
                        'is_active',
                        'roles',
                    ],
                    'token',
                ],
            ]);

        $this->assertNotEmpty($response->json('data.token'));
    }

    #[Test]
    public function user_cannot_login_with_invalid_password()
    {
        $user = User::factory()->create([
            'email' => 'test@manika.com',
            'password' => Hash::make('password123'),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'test@manika.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    #[Test]
    public function inactive_user_cannot_login()
    {
        $user = User::factory()->create([
            'email' => 'test@manika.com',
            'password' => Hash::make('password123'),
            'is_active' => false,
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'test@manika.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(422);
    }

    #[Test]
    public function authenticated_user_can_retrieve_profile()
    {
        $user = User::factory()->create();
        $user->assignRole('Admin');

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/me');

        $response->assertStatus(200)
            ->assertJsonPath('data.email', $user->email);
    }

    #[Test]
    public function unauthenticated_user_cannot_retrieve_profile()
    {
        $response = $this->getJson('/api/me');

        $response->assertStatus(401);
    }

    #[Test]
    public function user_can_logout()
    {
        $user = User::factory()->create();
        $user->assignRole('Admin');
        $token = $user->createToken('test_token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/auth/logout');

        $response->assertStatus(200);
        $this->assertCount(0, $user->tokens);
    }
}

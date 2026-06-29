<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class RbacTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected User $bdm;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed roles and permissions
        $this->seed(RolePermissionSeeder::class);

        // Create Admin user
        $this->admin = User::factory()->create();
        $this->admin->assignRole('Admin');

        // Create BDM user
        $this->bdm = User::factory()->create();
        $this->bdm->assignRole('BDM');
    }

    #[Test]
    public function admin_can_list_users()
    {
        $response = $this->actingAs($this->admin, 'sanctum')->getJson('/api/users');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'data',
                    'current_page',
                    'last_page',
                ],
            ]);
    }

    #[Test]
    public function bdm_cannot_list_users()
    {
        $response = $this->actingAs($this->bdm, 'sanctum')->getJson('/api/users');

        $response->assertStatus(403);
    }

    #[Test]
    public function admin_can_create_user_with_role()
    {
        $response = $this->actingAs($this->admin, 'sanctum')->postJson('/api/users', [
            'name' => 'John Seller',
            'email' => 'john@seller.com',
            'phone' => '1234567890',
            'password' => 'password123',
            'role' => 'Seller',
        ]);

        $response->assertStatus(201) // 201 Created
            ->assertJsonPath('data.email', 'john@seller.com');

        $newUser = User::where('email', 'john@seller.com')->first();
        $this->assertNotNull($newUser);
        $this->assertTrue($newUser->hasRole('Seller'));
    }

    #[Test]
    public function admin_can_update_user_and_role()
    {
        $user = User::factory()->create();
        $user->assignRole('BDM');

        $response = $this->actingAs($this->admin, 'sanctum')->putJson("/api/users/{$user->id}", [
            'name' => 'Updated Name',
            'email' => $user->email,
            'phone' => '9999999999',
            'role' => 'Seller',
            'is_active' => true,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.name', 'Updated Name');

        $user = $user->fresh();
        $this->assertTrue($user->hasRole('Seller'));
        $this->assertFalse($user->hasRole('BDM'));
    }

    #[Test]
    public function admin_can_deactivate_user()
    {
        $user = User::factory()->create(['is_active' => true]);

        $response = $this->actingAs($this->admin, 'sanctum')->deleteJson("/api/users/{$user->id}");

        $response->assertStatus(200);
        $this->assertFalse($user->fresh()->is_active);
    }

    #[Test]
    public function admin_cannot_deactivate_self()
    {
        $response = $this->actingAs($this->admin, 'sanctum')->deleteJson("/api/users/{$this->admin->id}");

        $response->assertStatus(403);
    }

    #[Test]
    public function admin_can_list_roles()
    {
        $response = $this->actingAs($this->admin, 'sanctum')->getJson('/api/roles');

        $response->assertStatus(200)
            ->assertJsonCount(4, 'data'); // Admin, BDM, Seller, Service Person
    }

    #[Test]
    public function admin_can_create_role_with_permissions()
    {
        $response = $this->actingAs($this->admin, 'sanctum')->postJson('/api/roles', [
            'name' => 'Custom Role',
            'permissions' => ['leads.view', 'leads.create'],
        ]);

        $response->assertStatus(201); // 201 Created

        $role = Role::where('name', 'Custom Role')->first();
        $this->assertNotNull($role);
        $this->assertTrue($role->hasPermissionTo('leads.view'));
    }

    #[Test]
    public function admin_can_list_permissions()
    {
        $response = $this->actingAs($this->admin, 'sanctum')->getJson('/api/permissions');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'guard_name',
                    ],
                ],
            ]);
    }
}

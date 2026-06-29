<?php

namespace Tests\Feature;

use App\Models\Division;
use App\Models\Locality;
use App\Models\Territory;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class GeographyTest extends TestCase
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
    public function admin_can_crud_divisions()
    {
        // 1. Create
        $response = $this->actingAs($this->admin, 'sanctum')->postJson('/api/divisions', [
            'name' => 'North Division',
            'code' => 'DIV-NORTH',
            'description' => 'North India territories',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.code', 'DIV-NORTH');

        $divisionId = $response->json('data.id');

        // 2. Read List
        $response = $this->actingAs($this->admin, 'sanctum')->getJson('/api/divisions');
        $response->assertStatus(200)
            ->assertJsonCount(1, 'data.data');

        // 3. Read Single
        $response = $this->actingAs($this->admin, 'sanctum')->getJson("/api/divisions/{$divisionId}");
        $response->assertStatus(200)
            ->assertJsonPath('data.name', 'North Division');

        // 4. Update
        $response = $this->actingAs($this->admin, 'sanctum')->putJson("/api/divisions/{$divisionId}", [
            'name' => 'North Division Updated',
            'code' => 'DIV-NORTH-UPDATED',
            'is_active' => true,
        ]);
        $response->assertStatus(200)
            ->assertJsonPath('data.name', 'North Division Updated');

        // 5. Delete
        $response = $this->actingAs($this->admin, 'sanctum')->deleteJson("/api/divisions/{$divisionId}");
        $response->assertStatus(200);

        $this->assertSoftDeleted('divisions', ['id' => $divisionId]);
    }

    #[Test]
    public function admin_can_assign_bdm_to_territory()
    {
        $division = Division::create([
            'name' => 'East Division',
            'code' => 'DIV-EAST',
        ]);

        $territory = Territory::create([
            'division_id' => $division->id,
            'name' => 'Kolkata Territory',
            'code' => 'TERR-KOLKATA',
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')->postJson("/api/territories/{$territory->id}/assign-bdm", [
            'user_id' => $this->bdm->id,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.active_assignment.user_id', $this->bdm->id);

        $this->assertDatabaseHas('territory_bdm_assignments', [
            'territory_id' => $territory->id,
            'user_id' => $this->bdm->id,
            'is_active' => true,
        ]);
    }

    #[Test]
    public function geo_matching_identifies_correct_locality_and_chain()
    {
        $division = Division::create(['name' => 'West Division', 'code' => 'DIV-WEST']);
        $territory = Territory::create(['division_id' => $division->id, 'name' => 'Mumbai', 'code' => 'TERR-MUMBAI']);

        // Define a square polygon around Mumbai area: [lng, lat]
        // Coordinates: (72.8, 19.0) to (73.0, 19.2)
        $polygon = [
            'type' => 'Polygon',
            'coordinates' => [[
                [72.8, 19.0],
                [73.0, 19.0],
                [73.0, 19.2],
                [72.8, 19.2],
                [72.8, 19.0],
            ]],
        ];

        $locality = Locality::create([
            'territory_id' => $territory->id,
            'name' => 'Bandra',
            'code' => 'LOC-BANDRA',
            'polygon' => $polygon,
        ]);

        // Assign BDM to territory
        $territory->assignments()->create([
            'user_id' => $this->bdm->id,
            'is_active' => true,
        ]);

        // Test point inside polygon: Lat 19.1, Lng 72.9
        $response = $this->actingAs($this->admin, 'sanctum')->postJson('/api/geo/identify', [
            'latitude' => 19.1,
            'longitude' => 72.9,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.locality.id', $locality->id)
            ->assertJsonPath('data.territory.id', $territory->id)
            ->assertJsonPath('data.bdm.id', $this->bdm->id)
            ->assertJsonPath('data.is_mapped', true);

        // Test point outside polygon: Lat 18.5, Lng 72.5
        $response = $this->actingAs($this->admin, 'sanctum')->postJson('/api/geo/identify', [
            'latitude' => 18.5,
            'longitude' => 72.5,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.is_mapped', false)
            ->assertJsonPath('data.locality', null);
    }
}

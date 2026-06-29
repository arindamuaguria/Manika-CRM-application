<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Division;
use App\Models\Territory;
use App\Models\Locality;
use App\Models\Lead;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class LeadTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $bdm1;
    protected User $bdm2;
    protected Locality $locality;
    protected Territory $territory;
    protected Division $division;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed roles and permissions
        $this->seed(RolePermissionSeeder::class);

        // Create Users
        $this->admin = User::factory()->create();
        $this->admin->assignRole('Admin');

        $this->bdm1 = User::factory()->create();
        $this->bdm1->assignRole('BDM');

        $this->bdm2 = User::factory()->create();
        $this->bdm2->assignRole('BDM');

        // Create Geography
        $this->division = Division::create(['name' => 'West', 'code' => 'DIV-WEST']);
        $this->territory = Territory::create(['division_id' => $this->division->id, 'name' => 'Mumbai', 'code' => 'TERR-MUMBAI']);
        
        // Define a square polygon around Mumbai: [lng, lat]
        $polygon = [
            'type' => 'Polygon',
            'coordinates' => [[
                [72.8, 19.0],
                [73.0, 19.0],
                [73.0, 19.2],
                [72.8, 19.2],
                [72.8, 19.0]
            ]]
        ];

        $this->locality = Locality::create([
            'territory_id' => $this->territory->id,
            'name' => 'Bandra',
            'code' => 'LOC-BANDRA',
            'polygon' => $polygon,
        ]);

        // Assign BDM1 to Mumbai territory
        $this->territory->assignments()->create([
            'user_id' => $this->bdm1->id,
            'is_active' => true,
        ]);
    }

    #[Test]
    public function lead_creation_auto_assigns_to_bdm_via_geo()
    {
        // Coordinates inside Bandra: Lat 19.1, Lng 72.9
        $response = $this->actingAs($this->admin, 'sanctum')->postJson('/api/leads', [
            'title' => 'New Office Lead',
            'contact_name' => 'Aravind Shah',
            'contact_mobile' => '9876543210',
            'contact_email' => 'aravind@shah.com',
            'latitude' => 19.1,
            'longitude' => 72.9,
            'priority' => 'high',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.locality_id', $this->locality->id)
            ->assertJsonPath('data.territory_id', $this->territory->id)
            ->assertJsonPath('data.division_id', $this->division->id)
            ->assertJsonPath('data.assigned_bdm_id', $this->bdm1->id)
            ->assertJsonPath('data.status', 'assigned')
            ->assertJsonPath('data.is_mapped', true);
    }

    #[Test]
    public function lead_creation_outside_localities_remains_new()
    {
        // Coordinates outside Bandra: Lat 18.0, Lng 72.0
        $response = $this->actingAs($this->admin, 'sanctum')->postJson('/api/leads', [
            'title' => 'Remote Lead',
            'contact_name' => 'Vijay Kumar',
            'contact_mobile' => '9876543211',
            'latitude' => 18.0,
            'longitude' => 72.0,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.locality_id', null)
            ->assertJsonPath('data.assigned_bdm_id', null)
            ->assertJsonPath('data.status', 'new')
            ->assertJsonPath('data.is_mapped', false);
    }

    #[Test]
    public function duplicate_mobile_number_fails_validation()
    {
        // Create initial lead
        Lead::create([
            'title' => 'First Lead',
            'contact_name' => 'Duplicate Test',
            'contact_mobile' => '9999999999',
            'latitude' => 19.1,
            'longitude' => 72.9,
        ]);

        // Attempt to create second lead with same mobile
        $response = $this->actingAs($this->admin, 'sanctum')->postJson('/api/leads', [
            'title' => 'Second Lead',
            'contact_name' => 'Another Person',
            'contact_mobile' => '9999999999',
            'latitude' => 19.1,
            'longitude' => 72.9,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['contact_mobile']);
    }

    #[Test]
    public function bdm_can_only_see_their_own_leads()
    {
        // Lead for BDM1
        $lead1 = Lead::create([
            'title' => 'BDM 1 Lead',
            'contact_name' => 'Client One',
            'contact_mobile' => '9111111111',
            'assigned_bdm_id' => $this->bdm1->id,
            'latitude' => 19.1,
            'longitude' => 72.9,
        ]);

        // Lead for BDM2
        $lead2 = Lead::create([
            'title' => 'BDM 2 Lead',
            'contact_name' => 'Client Two',
            'contact_mobile' => '9222222222',
            'assigned_bdm_id' => $this->bdm2->id,
            'latitude' => 19.1,
            'longitude' => 72.9,
        ]);

        // BDM1 fetches leads
        $response = $this->actingAs($this->bdm1, 'sanctum')->getJson('/api/leads');
        $response->assertStatus(200)
            ->assertJsonCount(1, 'data.data')
            ->assertJsonPath('data.data.0.id', $lead1->id);
    }

    #[Test]
    public function bdm_cannot_access_other_bdm_leads()
    {
        // Lead for BDM2
        $lead2 = Lead::create([
            'title' => 'BDM 2 Lead',
            'contact_name' => 'Client Two',
            'contact_mobile' => '9222222222',
            'assigned_bdm_id' => $this->bdm2->id,
            'latitude' => 19.1,
            'longitude' => 72.9,
        ]);

        // BDM1 tries to view BDM2's lead
        $response = $this->actingAs($this->bdm1, 'sanctum')->getJson("/api/leads/{$lead2->id}");
        $response->assertStatus(403);

        // BDM1 tries to update BDM2's lead
        $response = $this->actingAs($this->bdm1, 'sanctum')->putJson("/api/leads/{$lead2->id}", [
            'title' => 'Hacked Title',
            'contact_name' => 'Client Two',
            'contact_mobile' => '9222222222',
            'latitude' => 19.1,
            'longitude' => 72.9,
            'status' => 'new',
            'priority' => 'low',
        ]);
        $response->assertStatus(403);
    }
}

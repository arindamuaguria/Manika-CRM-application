<?php

namespace Tests\Feature;

use App\Models\Division;
use App\Models\Locality;
use App\Models\Partner;
use App\Models\Territory;
use App\Models\TerritoryBdmAssignment;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class GeoDashboardTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $bdm;
    protected User $sellerUser;
    protected Division $division;
    protected Territory $territory1;
    protected Territory $territory2;
    protected Locality $locality1;
    protected Locality $locality2;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolePermissionSeeder::class);

        $this->admin = User::factory()->create();
        $this->admin->assignRole('Admin');

        $this->bdm = User::factory()->create();
        $this->bdm->assignRole('BDM');

        $this->sellerUser = User::factory()->create();
        $this->sellerUser->assignRole('Seller');

        // Setup Geography Data
        $this->division = Division::create(['name' => 'East Division', 'code' => 'DIV-EAST']);
        
        $this->territory1 = Territory::create([
            'division_id' => $this->division->id,
            'name' => 'Kolkata North',
            'code' => 'TERR-KOL-NTH',
            'boundaries' => ['type' => 'Polygon', 'coordinates' => [[[88.3, 22.5], [88.4, 22.5], [88.4, 22.6], [88.3, 22.6], [88.3, 22.5]]]]
        ]);

        $this->territory2 = Territory::create([
            'division_id' => $this->division->id,
            'name' => 'Howrah',
            'code' => 'TERR-HOW',
            'boundaries' => ['type' => 'Polygon', 'coordinates' => [[[88.1, 22.5], [88.2, 22.5], [88.2, 22.6], [88.1, 22.6], [88.1, 22.5]]]]
        ]);

        $this->locality1 = Locality::create([
            'territory_id' => $this->territory1->id,
            'name' => 'Shyampukur',
            'code' => 'LOC-SHYAMP',
            'polygon' => ['type' => 'Polygon', 'coordinates' => [[[88.36, 22.59], [88.37, 22.59], [88.37, 22.60], [88.36, 22.60], [88.36, 22.59]]]]
        ]);

        $this->locality2 = Locality::create([
            'territory_id' => $this->territory2->id,
            'name' => 'Liluah',
            'code' => 'LOC-LILUAH',
            'polygon' => ['type' => 'Polygon', 'coordinates' => [[[88.16, 22.59], [88.17, 22.59], [88.17, 22.60], [88.16, 22.60], [88.16, 22.59]]]]
        ]);

        // Assign Territory 1 to BDM
        TerritoryBdmAssignment::create([
            'territory_id' => $this->territory1->id,
            'user_id' => $this->bdm->id,
            'is_active' => true
        ]);

        // Create Sellers and Service Persons
        Partner::create([
            'partner_type' => 'seller',
            'business_name' => 'North Seller Store',
            'business_address' => '12 Shyampukur St',
            'latitude' => 22.595,
            'longitude' => 88.365,
            'locality_id' => $this->locality1->id,
            'territory_id' => $this->territory1->id,
            'contact_name' => 'Seller One',
            'contact_mobile' => '9876543210',
            'status' => 'active'
        ]);

        Partner::create([
            'partner_type' => 'service_person',
            'business_name' => 'Howrah Service Hub',
            'business_address' => 'Liluah Bazar',
            'latitude' => 22.592,
            'longitude' => 88.162,
            'locality_id' => $this->locality2->id,
            'territory_id' => $this->territory2->id,
            'contact_name' => 'Service One',
            'contact_mobile' => '9876543211',
            'status' => 'active'
        ]);
    }

    #[Test]
    public function admin_can_view_all_geo_dashboard_data()
    {
        $response = $this->actingAs($this->admin, 'sanctum')->getJson('/api/geo-dashboard');

        $response->assertStatus(200)
            ->assertJsonPath('data.kpis.total_territories', 2)
            ->assertJsonPath('data.kpis.total_localities', 2)
            ->assertJsonPath('data.kpis.total_bdms', 1)
            ->assertJsonCount(2, 'data.territories')
            ->assertJsonCount(2, 'data.localities')
            ->assertJsonCount(1, 'data.sellers')
            ->assertJsonCount(1, 'data.service_persons');
    }

    #[Test]
    public function bdm_can_only_view_assigned_territory_data()
    {
        $response = $this->actingAs($this->bdm, 'sanctum')->getJson('/api/geo-dashboard');

        // BDM is assigned only to Territory 1 (Kolkata North), so Howrah data is scoped out
        $response->assertStatus(200)
            ->assertJsonPath('data.kpis.total_territories', 1) // Only Territory 1
            ->assertJsonPath('data.kpis.total_localities', 1)  // Only Locality 1
            ->assertJsonCount(1, 'data.territories')
            ->assertJsonCount(1, 'data.localities')
            ->assertJsonCount(1, 'data.sellers') // Seller 1 in Territory 1
            ->assertJsonCount(0, 'data.service_persons'); // Service Person 2 is in Territory 2
    }

    #[Test]
    public function seller_cannot_access_geo_dashboard()
    {
        $response = $this->actingAs($this->sellerUser, 'sanctum')->getJson('/api/geo-dashboard');

        $response->assertStatus(403);
    }

    #[Test]
    public function geo_dashboard_can_filter_by_territory()
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/geo-dashboard?territory_id=' . $this->territory2->id);

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data.territories')
            ->assertJsonPath('data.territories.0.id', $this->territory2->id)
            ->assertJsonCount(0, 'data.sellers') // Seller is in Territory 1
            ->assertJsonCount(1, 'data.service_persons'); // Service Person is in Territory 2
    }

    #[Test]
    public function geo_dashboard_can_filter_by_search_query()
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/geo-dashboard?search=Kolkata');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data.territories')
            ->assertJsonPath('data.territories.0.name', 'Kolkata North');
    }
}

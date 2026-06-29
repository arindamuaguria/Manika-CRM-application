<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Lead;
use App\Models\Deal;
use App\Models\Partner;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $bdm;
    protected User $seller;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolePermissionSeeder::class);

        $this->admin = User::factory()->create();
        $this->admin->assignRole('Admin');

        $this->bdm = User::factory()->create();
        $this->bdm->assignRole('BDM');

        $this->seller = User::factory()->create();
        $this->seller->assignRole('Seller');

        // Create some sample data
        Lead::create([
            'title' => 'Lead One',
            'contact_name' => 'John Doe',
            'contact_mobile' => '9999999991',
            'assigned_bdm_id' => $this->bdm->id,
            'status' => 'won',
        ]);

        Deal::create([
            'lead_id' => 1,
            'title' => 'Deal One',
            'value' => 25000.00,
            'status' => 'won',
            'assigned_bdm_id' => $this->bdm->id,
        ]);
    }

    #[Test]
    public function admin_can_view_admin_dashboard()
    {
        $response = $this->actingAs($this->admin, 'sanctum')->getJson('/api/dashboard');

        $response->assertStatus(200)
            ->assertJsonPath('data.role', 'Admin')
            ->assertJsonPath('data.kpis.total_leads', 1)
            ->assertJsonPath('data.kpis.total_deals', 1)
            ->assertJsonPath('data.kpis.total_revenue', 25000);
    }

    #[Test]
    public function bdm_can_view_bdm_dashboard()
    {
        $response = $this->actingAs($this->bdm, 'sanctum')->getJson('/api/dashboard');

        $response->assertStatus(200)
            ->assertJsonPath('data.role', 'BDM')
            ->assertJsonPath('data.kpis.total_leads', 1)
            ->assertJsonPath('data.kpis.total_revenue', 25000);
    }

    #[Test]
    public function seller_cannot_view_dashboard()
    {
        $response = $this->actingAs($this->seller, 'sanctum')->getJson('/api/dashboard');

        $response->assertStatus(403);
    }
}

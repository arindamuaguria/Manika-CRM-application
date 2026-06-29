<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Lead;
use App\Models\Deal;
use App\Models\Partner;
use App\Models\Territory;
use App\Models\Division;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class ReportTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $bdm;
    protected Territory $territory;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolePermissionSeeder::class);

        $this->admin = User::factory()->create();
        $this->admin->assignRole('Admin');

        $this->bdm = User::factory()->create();
        $this->bdm->assignRole('BDM');

        $division = Division::create(['name' => 'West', 'code' => 'DIV-WEST']);
        $this->territory = Territory::create(['division_id' => $division->id, 'name' => 'Mumbai', 'code' => 'TERR-MUMBAI']);

        // Create mock data
        $lead = Lead::create([
            'title' => 'Mumbai Store',
            'contact_name' => 'Amit Shah',
            'contact_mobile' => '9820011223',
            'status' => 'won',
            'territory_id' => $this->territory->id,
            'assigned_bdm_id' => $this->bdm->id,
        ]);

        $deal = Deal::create([
            'lead_id' => $lead->id,
            'title' => 'Mumbai Deal',
            'value' => 60000.00,
            'status' => 'won',
            'verification_status' => 'verified',
            'approval_status' => 'approved',
            'territory_id' => $this->territory->id,
            'assigned_bdm_id' => $this->bdm->id,
        ]);

        Partner::create([
            'user_id' => $this->bdm->id,
            'deal_id' => $deal->id,
            'partner_type' => 'seller',
            'business_name' => 'Amit Traders',
            'business_address' => 'Andheri, Mumbai',
            'contact_name' => 'Amit Shah',
            'contact_mobile' => '9820011223',
            'status' => 'active',
            'territory_id' => $this->territory->id,
        ]);
    }

    #[Test]
    public function admin_can_preview_reports()
    {
        // 1. Leads report preview
        $response = $this->actingAs($this->admin, 'sanctum')->getJson('/api/reports/leads');
        $response->assertStatus(200)
            ->assertJsonPath('data.total', 1)
            ->assertJsonPath('data.data.0.title', 'Mumbai Store');

        // 2. Deals report preview
        $response = $this->actingAs($this->admin, 'sanctum')->getJson('/api/reports/deals');
        $response->assertStatus(200)
            ->assertJsonPath('data.total', 1)
            ->assertJsonPath('data.data.0.title', 'Mumbai Deal');

        // 3. Partners report preview
        $response = $this->actingAs($this->admin, 'sanctum')->getJson('/api/reports/partners');
        $response->assertStatus(200)
            ->assertJsonPath('data.total', 1)
            ->assertJsonPath('data.data.0.business_name', 'Amit Traders');
    }

    #[Test]
    public function admin_can_export_reports_to_csv()
    {
        // 1. Export Leads
        $response = $this->actingAs($this->admin, 'sanctum')->get('/api/reports/leads/export');
        $response->assertStatus(200)
            ->assertHeader('Content-Type', 'text/csv; charset=UTF-8')
            ->assertHeader('Content-Disposition', 'attachment; filename="leads_report_' . now()->format('YmdHis') . '.csv"');
        $this->assertStringContainsString('Mumbai Store', $response->streamedContent());

        // 2. Export Deals
        $response = $this->actingAs($this->admin, 'sanctum')->get('/api/reports/deals/export');
        $response->assertStatus(200)
            ->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
        $this->assertStringContainsString('Mumbai Deal', $response->streamedContent());

        // 3. Export Partners
        $response = $this->actingAs($this->admin, 'sanctum')->get('/api/reports/partners/export');
        $response->assertStatus(200)
            ->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
        $this->assertStringContainsString('Amit Traders', $response->streamedContent());
    }

    #[Test]
    public function bdm_scoping_applied_to_reports()
    {
        $otherBdm = User::factory()->create();
        $otherBdm->assignRole('BDM');

        // BDM 1 (who owns the deal/lead) sees 1 lead
        $response = $this->actingAs($this->bdm, 'sanctum')->getJson('/api/reports/leads');
        $response->assertStatus(200)->assertJsonPath('data.total', 1);

        // BDM 2 sees 0 leads (due to scoping)
        $response = $this->actingAs($otherBdm, 'sanctum')->getJson('/api/reports/leads');
        $response->assertStatus(200)->assertJsonPath('data.total', 0);
    }
}

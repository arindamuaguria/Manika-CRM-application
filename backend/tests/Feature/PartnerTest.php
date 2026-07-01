<?php

namespace Tests\Feature;

use App\Models\Deal;
use App\Models\Division;
use App\Models\Lead;
use App\Models\Locality;
use App\Models\Partner;
use App\Models\Territory;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class PartnerTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected User $bdm;

    protected Deal $approvedDeal;

    protected Deal $draftDeal;

    protected Locality $locality;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolePermissionSeeder::class);

        $this->admin = User::factory()->create();
        $this->admin->assignRole('Admin');

        $this->bdm = User::factory()->create();
        $this->bdm->assignRole('BDM');

        $division = Division::create(['name' => 'South', 'code' => 'DIV-SOUTH']);
        $territory = Territory::create(['division_id' => $division->id, 'name' => 'Chennai', 'code' => 'TERR-CHENNAI']);

        $this->locality = Locality::create([
            'territory_id' => $territory->id,
            'name' => 'Adyar',
            'code' => 'LOC-ADYAR',
        ]);

        $lead = Lead::create([
            'title' => 'Chennai Store Lead',
            'contact_name' => 'Karthik Raja',
            'contact_mobile' => '9840012345',
            'contact_email' => 'karthik@raja.com',
            'assigned_bdm_id' => $this->bdm->id,
            'territory_id' => $territory->id,
            'locality_id' => $this->locality->id,
            'division_id' => $division->id,
            'latitude' => 13.0012,
            'longitude' => 80.2564,
            'status' => 'won',
        ]);

        // Approved Deal
        $this->approvedDeal = Deal::create([
            'lead_id' => $lead->id,
            'title' => 'Chennai Coffee Machine Deal',
            'value' => 75000.00,
            'assigned_bdm_id' => $this->bdm->id,
            'status' => 'won',
            'verification_status' => 'verified',
            'approval_status' => 'approved',
        ]);

        // Draft Deal
        $this->draftDeal = Deal::create([
            'lead_id' => $lead->id,
            'title' => 'Chennai Coffee Machine Deal Draft',
            'value' => 75000.00,
            'assigned_bdm_id' => $this->bdm->id,
            'status' => 'draft',
            'verification_status' => 'pending',
            'approval_status' => 'pending',
        ]);
    }

    #[Test]
    public function admin_can_convert_approved_deal_to_partner()
    {
        $response = $this->actingAs($this->admin, 'sanctum')->postJson('/api/partners', [
            'deal_id' => $this->approvedDeal->id,
            'partner_type' => 'seller',
            'business_name' => 'Karthik Retailers',
            'business_address' => '12, Adyar Main Rd, Chennai',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.business_name', 'Karthik Retailers')
            ->assertJsonPath('data.partner_type', 'seller')
            ->assertJsonPath('data.latitude', 13.0012)
            ->assertJsonPath('data.locality_id', $this->locality->id);

        $this->assertDatabaseHas('users', [
            'email' => 'karthik@raja.com',
            'phone' => '9840012345',
        ]);

        $newUser = User::where('email', 'karthik@raja.com')->first();
        $this->assertNotNull($newUser);
        $this->assertTrue($newUser->hasRole('Seller'));
    }

    #[Test]
    public function cannot_convert_draft_deal_to_partner()
    {
        $response = $this->actingAs($this->admin, 'sanctum')->postJson('/api/partners', [
            'deal_id' => $this->draftDeal->id,
            'partner_type' => 'seller',
            'business_name' => 'Draft Retailers',
            'business_address' => '12, Adyar Main Rd, Chennai',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['deal_id']);
    }

    #[Test]
    public function admin_can_sync_partner_service_coverage()
    {
        $partner = Partner::create([
            'user_id' => $this->admin->id,
            'deal_id' => $this->approvedDeal->id,
            'partner_type' => 'service_person',
            'business_name' => 'Chennai Services',
            'business_address' => 'Adyar',
            'contact_name' => 'Karthik Raja',
            'contact_mobile' => '9840012345',
            'status' => 'active',
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')->postJson("/api/partners/{$partner->id}/coverage", [
            'locality_ids' => [$this->locality->id],
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('partner_service_coverage_localities', [
            'partner_id' => $partner->id,
            'locality_id' => $this->locality->id,
            'is_active' => true,
        ]);
    }

    #[Test]
    public function test_public_partner_registration_creates_pending_partner(): void
    {
        Mail::fake();

        $data = [
            'contact_name' => 'Test Partner',
            'contact_email' => 'test@partner.com',
            'contact_mobile' => '9876543210',
            'partner_type' => 'seller',
            'business_name' => 'Test Business',
            'business_address' => '123 Test Street',
            'business_type' => 'Retailer',
            'appointment_datetime' => now()->addDays(3)->format('Y-m-d H:i:s'),
        ];

        $response = $this->postJson('/api/partners/public/register', $data);

        $response->assertStatus(201)
                 ->assertJsonPath('data.status', 'pending')
                 ->assertJsonPath('data.registration_source', 'public');
    }

    #[Test]
    public function test_public_partner_registration_validates_required_fields(): void
    {
        $response = $this->postJson('/api/partners/public/register', []);
        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['contact_name', 'contact_email', 'contact_mobile', 'partner_type', 'appointment_datetime']);
    }

    #[Test]
    public function test_public_bdm_registration_requires_education_level(): void
    {
        $data = [
            'contact_name' => 'BDM Applicant',
            'contact_email' => 'bdm@test.com',
            'contact_mobile' => '9876543210',
            'partner_type' => 'bdm',
            'appointment_datetime' => now()->addDays(3)->format('Y-m-d H:i:s'),
        ];

        $response = $this->postJson('/api/partners/public/register', $data);
        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['education_level']);
    }

    #[Test]
    public function public_can_list_territories(): void
    {
        $response = $this->getJson('/api/territories/public');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'success',
                     'message',
                     'data' => [
                         'data',
                         'current_page',
                     ]
                 ]);
    }
}

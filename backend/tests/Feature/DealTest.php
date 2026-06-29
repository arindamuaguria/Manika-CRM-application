<?php

namespace Tests\Feature;

use App\Models\Deal;
use App\Models\DealDocument;
use App\Models\Division;
use App\Models\Lead;
use App\Models\Territory;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class DealTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected User $bdm1;

    protected User $bdm2;

    protected Lead $lead;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolePermissionSeeder::class);

        $this->admin = User::factory()->create();
        $this->admin->assignRole('Admin');

        $this->bdm1 = User::factory()->create();
        $this->bdm1->assignRole('BDM');

        $this->bdm2 = User::factory()->create();
        $this->bdm2->assignRole('BDM');

        $division = Division::create(['name' => 'North', 'code' => 'DIV-NORTH']);
        $territory = Territory::create(['division_id' => $division->id, 'name' => 'Delhi', 'code' => 'TERR-DELHI']);

        $this->lead = Lead::create([
            'title' => 'Delhi Lead',
            'contact_name' => 'Rajesh Kumar',
            'contact_mobile' => '9988776655',
            'assigned_bdm_id' => $this->bdm1->id,
            'territory_id' => $territory->id,
            'division_id' => $division->id,
            'status' => 'assigned',
        ]);
    }

    #[Test]
    public function bdm_can_create_deal_from_assigned_lead()
    {
        $response = $this->actingAs($this->bdm1, 'sanctum')->postJson('/api/deals', [
            'lead_id' => $this->lead->id,
            'title' => 'Delhi Coffee Deal',
            'value' => 50000.00,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.status', 'draft')
            ->assertJsonPath('data.assigned_bdm_id', $this->bdm1->id)
            ->assertJsonPath('data.value', 50000);

        $this->assertEquals('deal_created', $this->lead->fresh()->status);
    }

    #[Test]
    public function bdm_can_upload_deal_documents()
    {
        Storage::fake('public');

        $deal = Deal::create([
            'lead_id' => $this->lead->id,
            'title' => 'Delhi Coffee Deal',
            'value' => 50000.00,
            'assigned_bdm_id' => $this->bdm1->id,
            'status' => 'draft',
        ]);

        $file = UploadedFile::fake()->create('agreement.pdf', 500, 'application/pdf');

        $response = $this->actingAs($this->bdm1, 'sanctum')->postJson("/api/deals/{$deal->id}/documents", [
            'document_type' => 'Agreement',
            'file' => $file,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.document_type', 'Agreement');

        $this->assertEquals('documentation', $deal->fresh()->status);
        Storage::disk('public')->assertExists($response->json('data.file_path'));
    }

    #[Test]
    public function admin_can_verify_and_approve_deal()
    {
        Storage::fake('public');

        $deal = Deal::create([
            'lead_id' => $this->lead->id,
            'title' => 'Delhi Coffee Deal',
            'value' => 50000.00,
            'assigned_bdm_id' => $this->bdm1->id,
            'status' => 'draft',
            'verification_status' => 'pending',
        ]);

        // 1. Upload doc
        $doc = DealDocument::create([
            'deal_id' => $deal->id,
            'document_type' => 'ID Proof',
            'file_path' => 'deals/test.jpg',
            'file_name' => 'test.jpg',
            'verification_status' => 'pending',
        ]);

        // 2. Admin verifies doc
        $response = $this->actingAs($this->admin, 'sanctum')->postJson("/api/deals/{$deal->id}/documents/{$doc->id}/verify", [
            'status' => 'verified',
            'notes' => 'ID is clear and valid',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.verification_status', 'verified');

        $this->assertEquals('verified', $deal->fresh()->verification_status);
        $this->assertEquals('approval', $deal->fresh()->status);

        // 3. Admin approves deal
        $response = $this->actingAs($this->admin, 'sanctum')->postJson("/api/deals/{$deal->id}/approve", [
            'action' => 'approve',
            'notes' => 'Approved by Regional Manager',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'won')
            ->assertJsonPath('data.approval_status', 'approved');
    }

    #[Test]
    public function bdm_cannot_access_other_bdm_deals()
    {
        $deal = Deal::create([
            'lead_id' => $this->lead->id,
            'title' => 'Delhi Coffee Deal',
            'value' => 50000.00,
            'assigned_bdm_id' => $this->bdm2->id,
            'status' => 'draft',
        ]);

        $response = $this->actingAs($this->bdm1, 'sanctum')->getJson("/api/deals/{$deal->id}");
        $response->assertStatus(403);
    }
}

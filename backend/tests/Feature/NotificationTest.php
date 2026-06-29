<?php

namespace Tests\Feature;

use App\Models\CrmNotification;
use App\Models\Deal;
use App\Models\DealDocument;
use App\Models\Lead;
use App\Models\User;
use App\Modules\CRM\Lead\Services\LeadService;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class NotificationTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected User $bdm;

    protected Lead $lead;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolePermissionSeeder::class);

        $this->admin = User::factory()->create();
        $this->admin->assignRole('Admin');

        $this->bdm = User::factory()->create();
        $this->bdm->assignRole('BDM');

        $this->lead = Lead::create([
            'title' => 'Delhi Coffee Shop',
            'contact_name' => 'Amit Kumar',
            'contact_mobile' => '9999999981',
            'status' => 'new',
        ]);
    }

    #[Test]
    public function bdm_receives_notification_on_lead_assignment()
    {
        resolve(LeadService::class)->updateLead($this->lead->id, [
            'title' => 'Delhi Coffee Shop',
            'contact_name' => 'Amit Kumar',
            'contact_mobile' => '9999999981',
            'assigned_bdm_id' => $this->bdm->id,
        ]);

        // Assert that a notification was created for BDM
        $this->assertDatabaseHas('crm_notifications', [
            'user_id' => $this->bdm->id,
            'type' => 'lead_assigned',
        ]);
    }

    #[Test]
    public function admin_receives_notification_on_document_upload()
    {
        Storage::fake('public');

        $deal = Deal::create([
            'lead_id' => $this->lead->id,
            'title' => 'Delhi Coffee Shop Deal',
            'value' => 45000.00,
            'assigned_bdm_id' => $this->bdm->id,
            'status' => 'draft',
        ]);

        $file = UploadedFile::fake()->create('contract.pdf', 500, 'application/pdf');

        $this->actingAs($this->bdm, 'sanctum')->postJson("/api/deals/{$deal->id}/documents", [
            'document_type' => 'Agreement',
            'file' => $file,
        ]);

        // Assert that a notification was created for Admin
        $this->assertDatabaseHas('crm_notifications', [
            'user_id' => $this->admin->id,
            'type' => 'document_uploaded',
        ]);
    }

    #[Test]
    public function bdm_receives_notification_on_document_verification_and_approval()
    {
        $deal = Deal::create([
            'lead_id' => $this->lead->id,
            'title' => 'Delhi Coffee Shop Deal',
            'value' => 45000.00,
            'assigned_bdm_id' => $this->bdm->id,
            'status' => 'draft',
            'verification_status' => 'pending',
        ]);

        $doc = DealDocument::create([
            'deal_id' => $deal->id,
            'document_type' => 'ID Proof',
            'file_path' => 'deals/test.jpg',
            'file_name' => 'test.jpg',
            'verification_status' => 'pending',
        ]);

        // 1. Admin verifies document
        $this->actingAs($this->admin, 'sanctum')->postJson("/api/deals/{$deal->id}/documents/{$doc->id}/verify", [
            'status' => 'verified',
            'notes' => 'Valid ID',
        ]);

        // Assert BDM notified
        $this->assertDatabaseHas('crm_notifications', [
            'user_id' => $this->bdm->id,
            'type' => 'document_verified',
        ]);

        // 2. Admin approves deal
        $this->actingAs($this->admin, 'sanctum')->postJson("/api/deals/{$deal->id}/approve", [
            'action' => 'approve',
            'notes' => 'Looks good',
        ]);

        // Assert BDM notified of deal approval
        $this->assertDatabaseHas('crm_notifications', [
            'user_id' => $this->bdm->id,
            'type' => 'deal_approval',
        ]);
    }

    #[Test]
    public function user_can_list_and_mark_notifications_as_read()
    {
        $notif = CrmNotification::create([
            'user_id' => $this->bdm->id,
            'type' => 'test_notif',
            'title' => 'Test Notification',
            'message' => 'This is a test notification.',
            'is_read' => false,
        ]);

        // 1. List notifications
        $response = $this->actingAs($this->bdm, 'sanctum')->getJson('/api/notifications');
        $response->assertStatus(200)
            ->assertJsonPath('data.data.0.id', $notif->id);

        // 2. Mark as read
        $response = $this->actingAs($this->bdm, 'sanctum')->postJson("/api/notifications/{$notif->id}/read");
        $response->assertStatus(200);

        $this->assertTrue($notif->fresh()->is_read);

        // 3. Mark all as read
        CrmNotification::create([
            'user_id' => $this->bdm->id,
            'type' => 'test_notif_2',
            'title' => 'Test Notification 2',
            'message' => 'This is another test notification.',
            'is_read' => false,
        ]);

        $response = $this->actingAs($this->bdm, 'sanctum')->postJson('/api/notifications/read-all');
        $response->assertStatus(200);

        $this->assertEquals(0, CrmNotification::where('user_id', $this->bdm->id)->where('is_read', false)->count());
    }
}

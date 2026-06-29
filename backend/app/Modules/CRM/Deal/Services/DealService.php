<?php

namespace App\Modules\CRM\Deal\Services;

use App\Repositories\DealRepository;
use App\Models\Deal;
use App\Models\DealDocument;
use App\Models\Lead;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class DealService
{
    protected DealRepository $dealRepository;
    protected \App\Modules\Notification\Services\NotificationService $notificationService;

    public function __construct(
        DealRepository $dealRepository,
        \App\Modules\Notification\Services\NotificationService $notificationService
    ) {
        $this->dealRepository = $dealRepository;
        $this->notificationService = $notificationService;
    }

    /**
     * Create a deal from a lead.
     */
    public function createDeal(array $data): Deal
    {
        $lead = Lead::findOrFail($data['lead_id']);

        // Check if lead already has a deal
        if (Deal::where('lead_id', $lead->id)->exists()) {
            throw ValidationException::withMessages([
                'lead_id' => ['A deal has already been created for this lead.'],
            ]);
        }

        // Inherit BDM and Territory from lead
        $data['assigned_bdm_id'] = $lead->assigned_bdm_id;
        $data['territory_id'] = $lead->territory_id;
        $data['status'] = 'draft';
        $data['verification_status'] = 'pending';
        $data['approval_status'] = 'pending';
        $data['created_by'] = auth()->id();

        $deal = $this->dealRepository->create($data);

        // Update lead status to deal_created
        $lead->update(['status' => 'deal_created']);

        return $deal;
    }

    /**
     * Upload a document for a deal.
     */
    public function uploadDocument(int $dealId, string $docType, UploadedFile $file): DealDocument
    {
        $deal = Deal::findOrFail($dealId);

        // Store file in public/deals directory
        $path = $file->store('deals', 'public');

        $document = DealDocument::create([
            'deal_id' => $deal->id,
            'document_type' => $docType,
            'file_path' => $path,
            'file_name' => $file->getClientOriginalName(),
            'file_size' => $file->getSize(),
            'mime_type' => $file->getClientMimeType(),
            'verification_status' => 'pending',
            'uploaded_by' => auth()->id(),
        ]);

        // Transition deal status to documentation if it was draft
        if ($deal->status === 'draft') {
            $deal->update(['status' => 'documentation']);
        }

        // Notify Admins
        $this->notificationService->sendToRole(
            'Admin',
            'document_uploaded',
            'Deal Document Uploaded',
            "A new document '{$docType}' has been uploaded for deal '{$deal->title}'."
        );

        return $document;
    }

    /**
     * Verify a document (Admin only).
     */
    public function verifyDocument(int $dealId, int $docId, string $status, ?string $notes): DealDocument
    {
        $deal = Deal::findOrFail($dealId);
        $document = DealDocument::where('deal_id', $deal->id)->findOrFail($docId);

        $document->update([
            'verification_status' => $status,
            'notes' => $notes,
            'verified_by' => auth()->id(),
            'verified_at' => now(),
        ]);

        // Recalculate deal verification status
        $this->updateDealVerificationStatus($deal);

        // Notify BDM
        if ($deal->assigned_bdm_id) {
            $this->notificationService->sendNotification(
                $deal->assigned_bdm_id,
                'document_verified',
                'Document Verification Updated',
                "Your document '{$document->document_type}' for deal '{$deal->title}' has been marked as {$status}."
            );
        }

        return $document;
    }

    /**
     * Approve or reject a deal (Admin only).
     */
    public function approveDeal(int $dealId, string $action, ?string $notes): Deal
    {
        $deal = Deal::findOrFail($dealId);

        // A deal can only be approved if verification is completed
        if ($deal->verification_status !== 'verified') {
            throw ValidationException::withMessages([
                'deal' => ['The deal documents must be verified before approval.'],
            ]);
        }

        if ($action === 'approve') {
            $deal->update([
                'status' => 'won',
                'approval_status' => 'approved',
                'approved_by' => auth()->id(),
                'approved_at' => now(),
                'notes' => $notes,
            ]);
        } else {
            $deal->update([
                'status' => 'lost',
                'approval_status' => 'rejected',
                'approved_by' => auth()->id(),
                'approved_at' => now(),
                'notes' => $notes,
            ]);
        }

        // Notify BDM
        if ($deal->assigned_bdm_id) {
            $statusWord = $action === 'approve' ? 'approved' : 'rejected';
            $this->notificationService->sendNotification(
                $deal->assigned_bdm_id,
                'deal_approval',
                'Deal Approval Updated',
                "Your deal '{$deal->title}' has been {$statusWord}."
            );
        }

        return $deal;
    }

    /**
     * Recalculate and update the verification status of a deal.
     */
    protected function updateDealVerificationStatus(Deal $deal): void
    {
        $docs = $deal->documents;

        if ($docs->isEmpty()) {
            $deal->update(['verification_status' => 'pending']);
            return;
        }

        $hasRejected = $docs->contains('verification_status', 'rejected');
        $hasPending = $docs->contains('verification_status', 'pending');

        if ($hasRejected) {
            $deal->update([
                'verification_status' => 'rejected',
                'status' => 'verification',
            ]);
        } elseif ($hasPending) {
            $deal->update([
                'verification_status' => 'pending',
                'status' => 'verification',
            ]);
        } else {
            // All verified
            $deal->update([
                'verification_status' => 'verified',
                'status' => 'approval',
            ]);
        }
    }
}

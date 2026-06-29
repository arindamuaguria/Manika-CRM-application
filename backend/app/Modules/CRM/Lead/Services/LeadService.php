<?php

namespace App\Modules\CRM\Lead\Services;

use App\Models\Lead;
use App\Modules\Notification\Services\NotificationService;
use App\Repositories\LeadRepository;
use App\Services\GeoService;
use Illuminate\Validation\ValidationException;

class LeadService
{
    protected LeadRepository $leadRepository;

    protected GeoService $geoService;

    protected NotificationService $notificationService;

    public function __construct(
        LeadRepository $leadRepository,
        GeoService $geoService,
        NotificationService $notificationService
    ) {
        $this->leadRepository = $leadRepository;
        $this->geoService = $geoService;
        $this->notificationService = $notificationService;
    }

    /**
     * Create a new lead with duplicate detection and auto-assignment via GeoService.
     */
    public function createLead(array $data): Lead
    {
        // 1. Duplicate Detection based on mobile number
        $this->checkDuplicateMobile($data['contact_mobile']);

        // 2. Mandatory Geo-Capture and Auto-Assignment
        if (isset($data['latitude']) && isset($data['longitude'])) {
            $geoChain = $this->geoService->getFullGeoChain((float) $data['latitude'], (float) $data['longitude']);

            if ($geoChain['is_mapped']) {
                $data['locality_id'] = $geoChain['locality']?->id;
                $data['territory_id'] = $geoChain['territory']?->id;
                $data['division_id'] = $geoChain['division']?->id;

                if ($geoChain['bdm']) {
                    $data['assigned_bdm_id'] = $geoChain['bdm']->id;
                    $data['status'] = 'assigned';
                }
                $data['is_mapped'] = true;
            } else {
                $data['is_mapped'] = false;
                $data['status'] = 'new';
            }
        } else {
            $data['is_mapped'] = false;
            $data['status'] = 'new';
        }

        $data['created_by'] = auth()->id();

        $lead = $this->leadRepository->create($data);

        if ($lead->assigned_bdm_id) {
            $this->notificationService->sendNotification(
                $lead->assigned_bdm_id,
                'lead_assigned',
                'New Lead Assigned',
                "Lead '{$lead->title}' has been assigned to you."
            );
        }

        return $lead;
    }

    /**
     * Update an existing lead.
     */
    public function updateLead(int $id, array $data): Lead
    {
        $lead = Lead::findOrFail($id);
        $oldBdmId = $lead->assigned_bdm_id;

        // Duplicate Detection (excluding current lead)
        $this->checkDuplicateMobile($data['contact_mobile'], $lead->id);

        // Recalculate geo-mapping if coordinates changed
        if (
            (isset($data['latitude']) && (float) $data['latitude'] !== (float) $lead->latitude) ||
            (isset($data['longitude']) && (float) $data['longitude'] !== (float) $lead->longitude)
        ) {
            $geoChain = $this->geoService->getFullGeoChain((float) $data['latitude'], (float) $data['longitude']);

            if ($geoChain['is_mapped']) {
                $data['locality_id'] = $geoChain['locality']?->id;
                $data['territory_id'] = $geoChain['territory']?->id;
                $data['division_id'] = $geoChain['division']?->id;

                if ($geoChain['bdm']) {
                    $data['assigned_bdm_id'] = $geoChain['bdm']->id;
                    if ($lead->status === 'new') {
                        $data['status'] = 'assigned';
                    }
                }
                $data['is_mapped'] = true;
            } else {
                $data['locality_id'] = null;
                $data['territory_id'] = null;
                $data['division_id'] = null;
                $data['assigned_bdm_id'] = null;
                $data['is_mapped'] = false;
            }
        }

        $updatedLead = $this->leadRepository->update($id, $data);

        if ($updatedLead->assigned_bdm_id && $updatedLead->assigned_bdm_id !== $oldBdmId) {
            $this->notificationService->sendNotification(
                $updatedLead->assigned_bdm_id,
                'lead_assigned',
                'New Lead Assigned',
                "Lead '{$updatedLead->title}' has been assigned to you."
            );
        }

        return $updatedLead;
    }

    /**
     * Check if a lead with the same mobile number already exists.
     */
    protected function checkDuplicateMobile(string $mobile, ?int $excludeId = null): void
    {
        $query = Lead::where('contact_mobile', $mobile);
        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        if ($query->exists()) {
            throw ValidationException::withMessages([
                'contact_mobile' => ['A lead with this mobile number already exists.'],
            ]);
        }
    }
}

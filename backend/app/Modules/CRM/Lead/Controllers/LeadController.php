<?php

namespace App\Modules\CRM\Lead\Controllers;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\Lead;
use App\Modules\CRM\Lead\Requests\StoreLeadRequest;
use App\Modules\CRM\Lead\Requests\UpdateLeadRequest;
use App\Modules\CRM\Lead\Services\LeadService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class LeadController extends BaseApiController
{
    protected LeadService $leadService;

    public function __construct(LeadService $leadService)
    {
        $this->leadService = $leadService;
    }

    /**
     * List all leads (with role-based data scoping).
     */
    public function index(Request $request): JsonResponse
    {
        Gate::authorize('leads.view');

        $query = Lead::with(['locality', 'territory', 'division', 'assignedBdm']);

        // 1. Role-Based Scoping: BDM can only see leads assigned to them
        $user = auth()->user();
        if ($user && $user->hasRole('BDM')) {
            $query->where('assigned_bdm_id', $user->id);
        }

        // 2. Search & Filters
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('contact_name', 'like', "%{$search}%")
                  ->orWhere('contact_mobile', 'like', "%{$search}%");
            });
        }

        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->has('priority')) {
            $query->where('priority', $request->input('priority'));
        }

        $leads = $query->paginate($request->input('per_page', 15));
        return $this->successResponse($leads, 'Leads retrieved successfully');
    }

    /**
     * Create a new lead (triggers duplicate detection & auto-assignment).
     */
    public function store(StoreLeadRequest $request): JsonResponse
    {
        Gate::authorize('leads.create');

        $lead = $this->leadService->createLead($request->validated());

        activity()
            ->performedOn($lead)
            ->log("Created lead: {$lead->title} (Status: {$lead->status})");

        return $this->createdResponse($lead, 'Lead created successfully');
    }

    /**
     * Show a lead.
     */
    public function show(int $id): JsonResponse
    {
        Gate::authorize('leads.view');

        $lead = Lead::with(['locality', 'territory', 'division', 'assignedBdm'])->findOrFail($id);

        // Scope check for BDM
        $user = auth()->user();
        if ($user && $user->hasRole('BDM') && $lead->assigned_bdm_id !== $user->id) {
            return $this->forbiddenResponse('You do not have access to this lead.');
        }

        return $this->successResponse($lead, 'Lead details retrieved successfully');
    }

    /**
     * Update a lead.
     */
    public function update(UpdateLeadRequest $request, int $id): JsonResponse
    {
        Gate::authorize('leads.update');

        // Scope check for BDM
        $lead = Lead::findOrFail($id);
        $user = auth()->user();
        if ($user && $user->hasRole('BDM') && $lead->assigned_bdm_id !== $user->id) {
            return $this->forbiddenResponse('You do not have access to update this lead.');
        }

        $updatedLead = $this->leadService->updateLead($id, $request->validated());

        activity()
            ->performedOn($updatedLead)
            ->log("Updated lead: {$updatedLead->title}");

        return $this->successResponse($updatedLead, 'Lead updated successfully');
    }

    /**
     * Delete a lead.
     */
    public function destroy(int $id): JsonResponse
    {
        Gate::authorize('leads.delete');

        $lead = Lead::findOrFail($id);

        // Scope check for BDM
        $user = auth()->user();
        if ($user && $user->hasRole('BDM') && $lead->assigned_bdm_id !== $user->id) {
            return $this->forbiddenResponse('You do not have access to delete this lead.');
        }

        $lead->delete();

        activity()
            ->performedOn($lead)
            ->log("Deleted lead: {$lead->title}");

        return $this->successResponse(null, 'Lead deleted successfully');
    }
}

<?php

namespace App\Modules\Partner\Controllers;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\Partner;
use App\Modules\Partner\Requests\StorePartnerRequest;
use App\Modules\Partner\Requests\UpdatePartnerRequest;
use App\Modules\Partner\Services\PartnerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class PartnerController extends BaseApiController
{
    protected PartnerService $partnerService;

    public function __construct(PartnerService $partnerService)
    {
        $this->partnerService = $partnerService;
    }

    /**
     * List all partners.
     */
    public function index(Request $request): JsonResponse
    {
        Gate::authorize('partners.view');

        $query = Partner::with(['user', 'deal', 'locality', 'territory']);

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('business_name', 'like', "%{$search}%")
                    ->orWhere('contact_name', 'like', "%{$search}%");
            });
        }

        if ($request->has('partner_type')) {
            $query->where('partner_type', $request->input('partner_type'));
        }

        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        $partners = $query->paginate($request->input('per_page', 15));

        return $this->successResponse($partners, 'Partners retrieved successfully');
    }

    /**
     * Convert an approved deal to a partner profile.
     */
    public function store(StorePartnerRequest $request): JsonResponse
    {
        Gate::authorize('partners.convert'); // Convert permission

        $partner = $this->partnerService->convertDealToPartner($request->validated());

        activity()
            ->performedOn($partner)
            ->log("Onboarded partner: {$partner->business_name} (Type: {$partner->partner_type})");

        return $this->createdResponse($partner, 'Partner onboarded successfully');
    }

    /**
     * Show a partner profile.
     */
    public function show(int $id): JsonResponse
    {
        Gate::authorize('partners.view');

        $partner = Partner::with(['user', 'deal', 'locality', 'territory', 'coverageLocalities'])->findOrFail($id);

        return $this->successResponse($partner, 'Partner details retrieved successfully');
    }

    /**
     * Update partner details.
     */
    public function update(UpdatePartnerRequest $request, int $id): JsonResponse
    {
        Gate::authorize('partners.update');

        $partner = Partner::findOrFail($id);
        $partner->update($request->validated());

        activity()
            ->performedOn($partner)
            ->log("Updated partner profile: {$partner->business_name}");

        return $this->successResponse($partner, 'Partner profile updated successfully');
    }

    /**
     * Delete a partner profile.
     */
    public function destroy(int $id): JsonResponse
    {
        Gate::authorize('partners.delete');

        $partner = Partner::findOrFail($id);
        $partner->delete();

        activity()
            ->performedOn($partner)
            ->log("Deleted partner: {$partner->business_name}");

        return $this->successResponse(null, 'Partner deleted successfully');
    }

    /**
     * Sync service coverage localities for a partner.
     */
    public function syncCoverage(Request $request, int $id): JsonResponse
    {
        Gate::authorize('partners.update');

        $request->validate([
            'locality_ids' => ['required', 'array'],
            'locality_ids.*' => ['exists:localities,id'],
        ]);

        $partner = $this->partnerService->syncCoverage($id, $request->input('locality_ids'));

        return $this->successResponse($partner, 'Service coverage updated successfully');
    }
}

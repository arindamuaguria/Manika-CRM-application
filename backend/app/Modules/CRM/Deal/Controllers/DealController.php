<?php

namespace App\Modules\CRM\Deal\Controllers;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\Deal;
use App\Modules\CRM\Deal\Requests\StoreDealRequest;
use App\Modules\CRM\Deal\Requests\UpdateDealRequest;
use App\Modules\CRM\Deal\Services\DealService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class DealController extends BaseApiController
{
    protected DealService $dealService;

    public function __construct(DealService $dealService)
    {
        $this->dealService = $dealService;
    }

    /**
     * List all deals (with role-based data scoping).
     */
    public function index(Request $request): JsonResponse
    {
        Gate::authorize('deals.view');

        $query = Deal::with(['lead', 'assignedBdm', 'territory']);

        // BDM scoping
        $user = auth()->user();
        if ($user && $user->hasRole('BDM')) {
            $query->where('assigned_bdm_id', $user->id);
        }

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where('title', 'like', "%{$search}%");
        }

        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        $deals = $query->paginate($request->input('per_page', 15));
        return $this->successResponse($deals, 'Deals retrieved successfully');
    }

    /**
     * Create a new deal.
     */
    public function store(StoreDealRequest $request): JsonResponse
    {
        Gate::authorize('deals.create');

        $deal = $this->dealService->createDeal($request->validated());

        activity()
            ->performedOn($deal)
            ->log("Created deal: {$deal->title} (Value: {$deal->value})");

        return $this->createdResponse($deal, 'Deal created successfully');
    }

    /**
     * Show a deal.
     */
    public function show(int $id): JsonResponse
    {
        Gate::authorize('deals.view');

        $deal = Deal::with(['lead', 'assignedBdm', 'territory', 'documents.uploader', 'documents.verifier'])->findOrFail($id);

        // BDM scoping check
        $user = auth()->user();
        if ($user && $user->hasRole('BDM') && $deal->assigned_bdm_id !== $user->id) {
            return $this->forbiddenResponse('You do not have access to this deal.');
        }

        return $this->successResponse($deal, 'Deal details retrieved successfully');
    }

    /**
     * Update a deal.
     */
    public function update(UpdateDealRequest $request, int $id): JsonResponse
    {
        Gate::authorize('deals.update');

        $deal = Deal::findOrFail($id);
        $user = auth()->user();
        if ($user && $user->hasRole('BDM') && $deal->assigned_bdm_id !== $user->id) {
            return $this->forbiddenResponse('You do not have access to update this deal.');
        }

        $deal->update($request->validated());

        activity()
            ->performedOn($deal)
            ->log("Updated deal: {$deal->title}");

        return $this->successResponse($deal, 'Deal updated successfully');
    }

    /**
     * Delete a deal.
     */
    public function destroy(int $id): JsonResponse
    {
        Gate::authorize('deals.delete');

        $deal = Deal::findOrFail($id);
        $user = auth()->user();
        if ($user && $user->hasRole('BDM') && $deal->assigned_bdm_id !== $user->id) {
            return $this->forbiddenResponse('You do not have access to delete this deal.');
        }

        $deal->delete();

        activity()
            ->performedOn($deal)
            ->log("Deleted deal: {$deal->title}");

        return $this->successResponse(null, 'Deal deleted successfully');
    }

    /**
     * Upload a document for a deal.
     */
    public function uploadDocument(Request $request, int $id): JsonResponse
    {
        Gate::authorize('deals.update');

        $deal = Deal::findOrFail($id);
        $user = auth()->user();
        if ($user && $user->hasRole('BDM') && $deal->assigned_bdm_id !== $user->id) {
            return $this->forbiddenResponse('You do not have access to upload documents for this deal.');
        }

        $request->validate([
            'document_type' => ['required', 'string', 'max:255'],
            'file' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png,doc,docx', 'max:10240'], // Max 10MB
        ]);

        $document = $this->dealService->uploadDocument(
            $deal->id,
            $request->input('document_type'),
            $request->file('file')
        );

        return $this->createdResponse($document, 'Document uploaded successfully');
    }

    /**
     * Verify a document (Admin only).
     */
    public function verifyDocument(Request $request, int $id, int $docId): JsonResponse
    {
        Gate::authorize('deals.approve'); // Admin approval permission

        $request->validate([
            'status' => ['required', 'string', 'in:verified,rejected'],
            'notes' => ['nullable', 'string'],
        ]);

        $document = $this->dealService->verifyDocument(
            $id,
            $docId,
            $request->input('status'),
            $request->input('notes')
        );

        return $this->successResponse($document, 'Document verification updated');
    }

    /**
     * Approve or reject a deal (Admin only).
     */
    public function approve(Request $request, int $id): JsonResponse
    {
        Gate::authorize('deals.approve');

        $request->validate([
            'action' => ['required', 'string', 'in:approve,reject'],
            'notes' => ['nullable', 'string'],
        ]);

        $deal = $this->dealService->approveDeal(
            $id,
            $request->input('action'),
            $request->input('notes')
        );

        activity()
            ->performedOn($deal)
            ->log("Deal approval status updated: {$deal->approval_status} (Deal Status: {$deal->status})");

        return $this->successResponse($deal, 'Deal approval status updated');
    }
}

<?php

namespace App\Modules\Geography\Territory\Controllers;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\Territory;
use App\Models\TerritoryBdmAssignment;
use App\Models\User;
use App\Modules\Geography\Territory\Requests\StoreTerritoryRequest;
use App\Modules\Geography\Territory\Requests\UpdateTerritoryRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;

class TerritoryController extends BaseApiController
{
    /**
     * List all territories for public onboarding selection.
     */
    public function publicIndex(Request $request): JsonResponse
    {
        $query = Territory::with(['division'])->where('is_active', true);

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            });
        }

        if ($request->has('division_id')) {
            $query->where('division_id', $request->input('division_id'));
        }

        // Return a paginated list of territories
        $territories = $query->paginate($request->input('per_page', 200));

        return $this->successResponse($territories, 'Public territories retrieved successfully');
    }

    /**
     * List all territories.
     */
    public function index(Request $request): JsonResponse
    {
        Gate::authorize('territories.view');

        $query = Territory::with(['division', 'activeAssignment.user']);

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            });
        }

        if ($request->has('division_id')) {
            $query->where('division_id', $request->input('division_id'));
        }

        // BDM role restriction: BDMs can only see their assigned territories
        $user = auth()->user();
        if ($user && $user->hasRole('BDM')) {
            $query->whereHas('assignments', function ($q) use ($user) {
                $q->where('user_id', $user->id)->where('is_active', true);
            });
        }

        $territories = $query->paginate($request->input('per_page', 15));

        return $this->successResponse($territories, 'Territories retrieved successfully');
    }

    /**
     * Create a new territory.
     */
    public function store(StoreTerritoryRequest $request): JsonResponse
    {
        Gate::authorize('territories.create');

        $data = $request->validated();
        $data['created_by'] = auth()->id();

        $territory = Territory::create($data);

        activity()
            ->performedOn($territory)
            ->log("Created territory: {$territory->code}");

        return $this->createdResponse($territory, 'Territory created successfully');
    }

    /**
     * Show a territory.
     */
    public function show(int $id): JsonResponse
    {
        Gate::authorize('territories.view');

        $territory = Territory::with(['division', 'activeAssignment.user', 'localities'])->findOrFail($id);

        return $this->successResponse($territory, 'Territory details retrieved successfully');
    }

    /**
     * Update a territory.
     */
    public function update(UpdateTerritoryRequest $request, int $id): JsonResponse
    {
        Gate::authorize('territories.update');

        $territory = Territory::findOrFail($id);
        $territory->update($request->validated());

        activity()
            ->performedOn($territory)
            ->log("Updated territory: {$territory->code}");

        return $this->successResponse($territory, 'Territory updated successfully');
    }

    /**
     * Delete a territory.
     */
    public function destroy(int $id): JsonResponse
    {
        Gate::authorize('territories.delete');

        $territory = Territory::findOrFail($id);

        if ($territory->localities()->exists()) {
            return $this->errorResponse('Cannot delete territory containing localities. Delete or reassign localities first.', 400);
        }

        $territory->delete();

        activity()
            ->performedOn($territory)
            ->log("Deleted territory: {$territory->code}");

        return $this->successResponse(null, 'Territory deleted successfully');
    }

    /**
     * Assign a BDM to the territory.
     */
    public function assignBdm(Request $request, int $id): JsonResponse
    {
        // Only Admin can assign BDM to a territory
        Gate::authorize('users.create'); // Or we can use a custom permission, but users.create is fine for admin-only task

        $territory = Territory::findOrFail($id);

        $request->validate([
            'user_id' => ['required', 'exists:users,id'],
        ]);

        $bdm = User::findOrFail($request->input('user_id'));

        if (! $bdm->hasRole('BDM')) {
            throw ValidationException::withMessages([
                'user_id' => ['The selected user is not a BDM.'],
            ]);
        }

        // Deactivate current active assignment for this territory
        TerritoryBdmAssignment::where('territory_id', $territory->id)
            ->where('is_active', true)
            ->update(['is_active' => false]);

        // Create new assignment
        $assignment = TerritoryBdmAssignment::create([
            'territory_id' => $territory->id,
            'user_id' => $bdm->id,
            'assigned_by' => auth()->id(),
            'is_active' => true,
        ]);

        activity()
            ->performedOn($territory)
            ->log("Assigned BDM: {$bdm->email} to territory: {$territory->code}");

        return $this->successResponse($territory->load('activeAssignment.user'), 'BDM assigned successfully');
    }
}

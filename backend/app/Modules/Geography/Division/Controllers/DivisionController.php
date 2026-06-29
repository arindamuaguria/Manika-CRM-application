<?php

namespace App\Modules\Geography\Division\Controllers;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\Division;
use App\Modules\Geography\Division\Requests\StoreDivisionRequest;
use App\Modules\Geography\Division\Requests\UpdateDivisionRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class DivisionController extends BaseApiController
{
    /**
     * List all divisions.
     */
    public function index(Request $request): JsonResponse
    {
        Gate::authorize('divisions.view');

        $query = Division::query();

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }

        $divisions = $query->paginate($request->input('per_page', 15));
        return $this->successResponse($divisions, 'Divisions retrieved successfully');
    }

    /**
     * Create a new division.
     */
    public function store(StoreDivisionRequest $request): JsonResponse
    {
        Gate::authorize('divisions.create');

        $data = $request->validated();
        $data['created_by'] = auth()->id();

        $division = Division::create($data);

        activity()
            ->performedOn($division)
            ->log("Created division: {$division->code}");

        return $this->createdResponse($division, 'Division created successfully');
    }

    /**
     * Show a division.
     */
    public function show(int $id): JsonResponse
    {
        Gate::authorize('divisions.view');

        $division = Division::with('territories')->findOrFail($id);
        return $this->successResponse($division, 'Division details retrieved successfully');
    }

    /**
     * Update a division.
     */
    public function update(UpdateDivisionRequest $request, int $id): JsonResponse
    {
        Gate::authorize('divisions.update');

        $division = Division::findOrFail($id);
        $division->update($request->validated());

        activity()
            ->performedOn($division)
            ->log("Updated division: {$division->code}");

        return $this->successResponse($division, 'Division updated successfully');
    }

    /**
     * Delete a division.
     */
    public function destroy(int $id): JsonResponse
    {
        Gate::authorize('divisions.delete');

        $division = Division::findOrFail($id);

        if ($division->territories()->exists()) {
            return $this->errorResponse('Cannot delete division containing territories. Delete or reassign territories first.', 400);
        }

        $division->delete();

        activity()
            ->performedOn($division)
            ->log("Deleted division: {$division->code}");

        return $this->successResponse(null, 'Division deleted successfully');
    }
}

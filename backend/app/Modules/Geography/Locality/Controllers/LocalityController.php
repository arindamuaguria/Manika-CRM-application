<?php

namespace App\Modules\Geography\Locality\Controllers;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\Locality;
use App\Modules\Geography\Locality\Requests\StoreLocalityRequest;
use App\Modules\Geography\Locality\Requests\UpdateLocalityRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class LocalityController extends BaseApiController
{
    /**
     * List all localities.
     */
    public function index(Request $request): JsonResponse
    {
        Gate::authorize('localities.view');

        $query = Locality::with('territory');

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            });
        }

        if ($request->has('territory_id')) {
            $query->where('territory_id', $request->input('territory_id'));
        }

        $localities = $query->paginate($request->input('per_page', 15));

        return $this->successResponse($localities, 'Localities retrieved successfully');
    }

    /**
     * Create a new locality.
     */
    public function store(StoreLocalityRequest $request): JsonResponse
    {
        Gate::authorize('localities.create');

        $data = $request->validated();
        $data['created_by'] = auth()->id();

        $locality = Locality::create($data);

        activity()
            ->performedOn($locality)
            ->log("Created locality: {$locality->code}");

        return $this->createdResponse($locality, 'Locality created successfully');
    }

    /**
     * Show a locality.
     */
    public function show(int $id): JsonResponse
    {
        Gate::authorize('localities.view');

        $locality = Locality::with('territory.division')->findOrFail($id);

        return $this->successResponse($locality, 'Locality details retrieved successfully');
    }

    /**
     * Update a locality.
     */
    public function update(UpdateLocalityRequest $request, int $id): JsonResponse
    {
        Gate::authorize('localities.update');

        $locality = Locality::findOrFail($id);
        $locality->update($request->validated());

        activity()
            ->performedOn($locality)
            ->log("Updated locality: {$locality->code}");

        return $this->successResponse($locality, 'Locality updated successfully');
    }

    /**
     * Delete a locality.
     */
    public function destroy(int $id): JsonResponse
    {
        Gate::authorize('localities.delete');

        $locality = Locality::findOrFail($id);
        $locality->delete();

        activity()
            ->performedOn($locality)
            ->log("Deleted locality: {$locality->code}");

        return $this->successResponse(null, 'Locality deleted successfully');
    }
}

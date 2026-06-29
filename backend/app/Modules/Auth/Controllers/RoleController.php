<?php

namespace App\Modules\Auth\Controllers;

use App\Http\Controllers\Api\BaseApiController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;

class RoleController extends BaseApiController
{
    /**
     * List all roles with their permissions.
     */
    public function index(): JsonResponse
    {
        $roles = Role::with('permissions')->get();

        return $this->successResponse($roles, 'Roles retrieved successfully');
    }

    /**
     * Create a new role.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'unique:roles,name'],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['string', 'exists:permissions,name'],
        ]);

        $role = Role::create([
            'name' => $request->input('name'),
            'guard_name' => 'web',
        ]);

        if ($request->has('permissions')) {
            $role->syncPermissions($request->input('permissions'));
        }

        activity()
            ->performedOn($role)
            ->log("Created role: {$role->name}");

        return $this->createdResponse($role->load('permissions'), 'Role created successfully');
    }

    /**
     * Update an existing role.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $role = Role::findOrFail($id);

        if ($role->name === 'Admin') {
            return $this->errorResponse('The Admin role cannot be modified.', 403);
        }

        $request->validate([
            'name' => ['required', 'string', 'unique:roles,name,'.$id],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['string', 'exists:permissions,name'],
        ]);

        $oldName = $role->name;
        $role->update([
            'name' => $request->input('name'),
        ]);

        if ($request->has('permissions')) {
            $role->syncPermissions($request->input('permissions'));
        }

        activity()
            ->performedOn($role)
            ->log("Updated role: {$oldName} to {$role->name}");

        return $this->successResponse($role->load('permissions'), 'Role updated successfully');
    }

    /**
     * Delete a role.
     */
    public function destroy(int $id): JsonResponse
    {
        $role = Role::findOrFail($id);

        if (in_array($role->name, ['Admin', 'BDM', 'Seller', 'Service Person'])) {
            return $this->errorResponse('System roles cannot be deleted.', 403);
        }

        $roleName = $role->name;
        $role->delete();

        activity()
            ->log("Deleted role: {$roleName}");

        return $this->successResponse(null, 'Role deleted successfully');
    }
}

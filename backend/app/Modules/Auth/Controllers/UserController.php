<?php

namespace App\Modules\Auth\Controllers;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends BaseApiController
{
    /**
     * List all users with their roles.
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::with('roles');

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($request->has('role')) {
            $query->role($request->input('role'));
        }

        $users = $query->paginate($request->input('per_page', 15));
        return $this->successResponse($users, 'Users retrieved successfully');
    }

    /**
     * Create a new user and assign a role.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:20'],
            'password' => ['required', 'string', 'min:8'],
            'role' => ['required', 'string', 'exists:roles,name'],
        ]);

        $user = User::create([
            'name' => $request->input('name'),
            'email' => $request->input('email'),
            'phone' => $request->input('phone'),
            'password' => Hash::make($request->input('password')),
            'is_active' => true,
        ]);

        $user->assignRole($request->input('role'));

        activity()
            ->performedOn($user)
            ->log("Created user: {$user->email} with role: {$request->input('role')}");

        return $this->createdResponse($user->load('roles'), 'User created successfully');
    }

    /**
     * Update an existing user.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $id],
            'phone' => ['nullable', 'string', 'max:20'],
            'password' => ['nullable', 'string', 'min:8'],
            'role' => ['required', 'string', 'exists:roles,name'],
            'is_active' => ['required', 'boolean'],
        ]);

        $user->update([
            'name' => $request->input('name'),
            'email' => $request->input('email'),
            'phone' => $request->input('phone'),
            'is_active' => $request->input('is_active'),
        ]);

        if ($request->filled('password')) {
            $user->password = Hash::make($request->input('password'));
            $user->save();
        }

        // Sync role
        $user->syncRoles([$request->input('role')]);

        activity()
            ->performedOn($user)
            ->log("Updated user: {$user->email}");

        return $this->successResponse($user->load('roles'), 'User updated successfully');
    }

    /**
     * Deactivate a user.
     */
    public function destroy(int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        if ($user->id === auth()->id()) {
            return $this->errorResponse('You cannot deactivate your own account.', 403);
        }

        $user->is_active = false;
        $user->save();

        activity()
            ->performedOn($user)
            ->log("Deactivated user: {$user->email}");

        return $this->successResponse($user, 'User deactivated successfully');
    }

    /**
     * Assign a role to a user.
     */
    public function assignRole(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $request->validate([
            'role' => ['required', 'string', 'exists:roles,name'],
        ]);

        $user->syncRoles([$request->input('role')]);

        activity()
            ->performedOn($user)
            ->log("Assigned role: {$request->input('role')} to user: {$user->email}");

        return $this->successResponse($user->load('roles'), 'Role assigned successfully');
    }
}

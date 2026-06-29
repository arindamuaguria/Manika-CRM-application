<?php

namespace App\Modules\Auth\Controllers;

use App\Http\Controllers\Api\BaseApiController;
use Illuminate\Http\JsonResponse;
use Spatie\Permission\Models\Permission;

class PermissionController extends BaseApiController
{
    /**
     * List all permissions.
     */
    public function index(): JsonResponse
    {
        $permissions = Permission::all();

        return $this->successResponse($permissions, 'Permissions retrieved successfully');
    }
}

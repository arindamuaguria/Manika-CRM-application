<?php

namespace App\Modules\Notification\Controllers;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\CrmNotification;
use App\Modules\Notification\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class NotificationController extends BaseApiController
{
    protected NotificationService $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * List all notifications for the authenticated user.
     */
    public function index(Request $request): JsonResponse
    {
        Gate::authorize('notifications.view');

        $user = auth()->user();
        $query = CrmNotification::where('user_id', $user->id)
            ->orderBy('is_read', 'asc')
            ->orderBy('created_at', 'desc');

        if ($request->has('unread_only') && $request->boolean('unread_only')) {
            $query->where('is_read', false);
        }

        $notifications = $query->paginate($request->input('per_page', 15));

        return $this->successResponse($notifications, 'Notifications retrieved successfully');
    }

    /**
     * Mark a single notification as read.
     */
    public function markRead(int $id): JsonResponse
    {
        $user = auth()->user();
        $notification = $this->notificationService->markAsRead($id, $user->id);

        return $this->successResponse($notification, 'Notification marked as read');
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllRead(): JsonResponse
    {
        $user = auth()->user();
        $this->notificationService->markAllAsRead($user->id);

        return $this->successResponse(null, 'All notifications marked as read');
    }
}

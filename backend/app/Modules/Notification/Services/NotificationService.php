<?php

namespace App\Modules\Notification\Services;

use App\Models\CrmNotification;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    /**
     * Send a notification to a specific user.
     */
    public function sendNotification(
        int $userId,
        string $type,
        string $title,
        string $message,
        ?array $data = null,
        string $channel = 'in_app'
    ): CrmNotification {
        $notification = CrmNotification::create([
            'user_id' => $userId,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'data' => $data,
            'channel' => $channel,
            'is_read' => false,
        ]);

        // Mock Email/SMS dispatching
        if ($channel === 'email' || $channel === 'sms') {
            Log::info("Dispatching {$channel} notification to User {$userId}: {$title} - {$message}");
        }

        return $notification;
    }

    /**
     * Send a notification to all users with a specific role.
     */
    public function sendToRole(
        string $roleName,
        string $type,
        string $title,
        string $message,
        ?array $data = null
    ): void {
        $users = User::role($roleName)->get();

        foreach ($users as $user) {
            $this->sendNotification($user->id, $type, $title, $message, $data);
        }
    }

    /**
     * Mark a notification as read.
     */
    public function markAsRead(int $notificationId, int $userId): CrmNotification
    {
        $notification = CrmNotification::where('user_id', $userId)->findOrFail($notificationId);
        
        $notification->update([
            'is_read' => true,
            'read_at' => now(),
        ]);

        return $notification;
    }

    /**
     * Mark all notifications as read for a user.
     */
    public function markAllAsRead(int $userId): void
    {
        CrmNotification::where('user_id', $userId)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);
    }
}

<?php

namespace App\Modules\Auth\Services;

use App\Models\User;
use App\Repositories\UserRepository;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;

class AuthService
{
    protected UserRepository $userRepository;

    public function __construct(UserRepository $userRepository)
    {
        $this->userRepository = $userRepository;
    }

    /**
     * Authenticate a user and return a Sanctum token.
     *
     * @throws ValidationException
     */
    public function login(array $credentials): array
    {
        $user = $this->userRepository->findByEmail($credentials['email']);

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => [__('auth.failed')],
            ]);
        }

        if (! $user->is_active) {
            throw ValidationException::withMessages([
                'email' => ['Your account is inactive.'],
            ]);
        }

        // Revoke existing tokens if needed, but Sanctum allows multiple tokens by default.
        // For security, we can keep it simple or prune old tokens.
        $token = $user->createToken('auth_token')->plainTextToken;

        // Load roles and permissions
        $user->load('roles.permissions');
        $user->permissions = $user->getAllPermissions()->pluck('name');

        // Log login activity
        activity()
            ->performedOn($user)
            ->causedBy($user)
            ->log('User logged in successfully');

        return [
            'user' => $user,
            'token' => $token,
        ];
    }

    /**
     * Log out the current user by revoking their token.
     */
    public function logout(User $user): void
    {
        $user->currentAccessToken()->delete();

        activity()
            ->performedOn($user)
            ->causedBy($user)
            ->log('User logged out');
    }

    /**
     * Send password reset link.
     *
     * @throws ValidationException
     */
    public function sendResetLink(string $email): string
    {
        $status = Password::sendResetLink(['email' => $email]);

        if ($status !== Password::RESET_LINK_SENT) {
            throw ValidationException::withMessages([
                'email' => [__($status)],
            ]);
        }

        return __($status);
    }

    /**
     * Reset the user's password.
     *
     * @throws ValidationException
     */
    public function resetPassword(array $data): string
    {
        $status = Password::reset(
            $data,
            function (User $user, string $password) {
                $user->password = Hash::make($password);
                $user->save();

                activity()
                    ->performedOn($user)
                    ->causedBy($user)
                    ->log('Password reset successfully');
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'email' => [__($status)],
            ]);
        }

        return __($status);
    }
}

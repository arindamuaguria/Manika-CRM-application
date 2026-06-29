<?php

namespace App\Modules\Auth\Controllers;

use App\Http\Controllers\Api\BaseApiController;
use App\Modules\Auth\Requests\LoginRequest;
use App\Modules\Auth\Requests\ForgotPasswordRequest;
use App\Modules\Auth\Requests\ResetPasswordRequest;
use App\Modules\Auth\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

class AuthController extends BaseApiController
{
    protected AuthService $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    /**
     * Authenticate a user and return a token.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $throttleKey = strtolower($request->input('email')) . '|' . $request->ip();

        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            return $this->errorResponse(
                'Too many login attempts. Please try again in ' . $seconds . ' seconds.',
                429
            );
        }

        try {
            $data = $this->authService->login($request->only('email', 'password'));
            RateLimiter::clear($throttleKey);
            return $this->successResponse($data, 'Logged in successfully');
        } catch (ValidationException $e) {
            RateLimiter::hit($throttleKey, 60);
            return $this->errorResponse($e->getMessage(), 422, $e->errors());
        }
    }

    /**
     * Log out the authenticated user (revoke token).
     */
    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout($request->user());
        return $this->successResponse(null, 'Logged out successfully');
    }

    /**
     * Get the authenticated user profile.
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->load('roles.permissions');
        $user->permissions = $user->getAllPermissions()->pluck('name');
        return $this->successResponse($user, 'Authenticated user profile');
    }

    /**
     * Send password reset link.
     */
    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        try {
            $message = $this->authService->sendResetLink($request->input('email'));
            return $this->successResponse(null, $message);
        } catch (ValidationException $e) {
            return $this->errorResponse($e->getMessage(), 422, $e->errors());
        }
    }

    /**
     * Reset password.
     */
    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        try {
            $message = $this->authService->resetPassword($request->only('token', 'email', 'password', 'password_confirmation'));
            return $this->successResponse(null, $message);
        } catch (ValidationException $e) {
            return $this->errorResponse($e->getMessage(), 422, $e->errors());
        }
    }
}

<?php

namespace App\Modules\Partner\Services;

use App\Models\Deal;
use App\Models\Partner;
use App\Models\User;
use App\Mail\WelcomePartnerMail;
use App\Repositories\PartnerRepository;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class PartnerService
{
    protected PartnerRepository $partnerRepository;

    public function __construct(PartnerRepository $partnerRepository)
    {
        $this->partnerRepository = $partnerRepository;
    }

    /**
     * Convert an approved deal to a partner profile.
     */
    public function convertDealToPartner(array $data): Partner
    {
        $deal = Deal::with('lead')->findOrFail($data['deal_id']);

        // 1. Validate deal status
        if ($deal->status !== 'won' || $deal->approval_status !== 'approved') {
            throw ValidationException::withMessages([
                'deal_id' => ['Only approved (won) deals can be converted to partners.'],
            ]);
        }

        // 2. Check if partner already exists for this deal
        if (Partner::where('deal_id', $deal->id)->exists()) {
            throw ValidationException::withMessages([
                'deal_id' => ['A partner profile has already been created for this deal.'],
            ]);
        }

        // 3. Create a new User account for the partner
        $roleName = $data['partner_type'] === 'seller' ? 'Seller' : 'Service Person';
        $email = $deal->lead->contact_email ?: 'partner_'.$deal->id.'@manika.com';

        // Check if user email already exists
        $user = User::where('email', $email)->first();
        if (! $user) {
            $user = User::create([
                'name' => $deal->lead->contact_name,
                'email' => $email,
                'phone' => $deal->lead->contact_mobile,
                'password' => Hash::make('password123'),
                'is_active' => true,
            ]);
            $user->assignRole($roleName);
        }

        // 4. Create the Partner profile inheriting coordinates and geo chain from lead
        $partner = $this->partnerRepository->create([
            'user_id' => $user->id,
            'deal_id' => $deal->id,
            'partner_type' => $data['partner_type'],
            'business_name' => $data['business_name'],
            'business_address' => $data['business_address'],
            'latitude' => $deal->lead->latitude,
            'longitude' => $deal->lead->longitude,
            'locality_id' => $deal->lead->locality_id,
            'territory_id' => $deal->lead->territory_id,
            'contact_name' => $deal->lead->contact_name,
            'contact_email' => $email,
            'contact_mobile' => $deal->lead->contact_mobile,
            'status' => 'active',
            'onboarded_at' => now(),
            'created_by' => auth()->id(),
        ]);

        return $partner;
    }

    /**
     * Sync service coverage localities for a partner.
     */
    public function syncCoverage(int $partnerId, array $localityIds): Partner
    {
        $partner = Partner::findOrFail($partnerId);

        // Sync localities
        $partner->coverageLocalities()->sync(
            array_fill_keys($localityIds, ['is_active' => true])
        );

        activity()
            ->performedOn($partner)
            ->log("Updated service coverage localities for partner: {$partner->business_name}");

        return $partner->load('coverageLocalities');
    }

    /**
     * Register a partner from the public onboarding portal.
     */
    public function registerPublicPartner(array $data): Partner
    {
        return DB::transaction(function () use ($data) {
            // 1. Geo-identify territory/locality from coordinates
            if (!empty($data['latitude']) && !empty($data['longitude'])) {
                $geoService = app(\App\Modules\Geography\Services\GeoService::class);
                $geoResult = $geoService->identifyPoint($data['latitude'], $data['longitude']);
                if ($geoResult['is_mapped']) {
                    $data['territory_id'] = $geoResult['territory']->id ?? null;
                    $data['locality_id'] = $geoResult['locality']->id ?? null;
                }
            }

            // 2. Set defaults
            $data['status'] = 'pending';
            $data['registration_source'] = 'public';

            if (empty($data['business_name'])) {
                $data['business_name'] = $data['contact_name'] . "'s Business";
            }

            // 3. Create partner record
            $partner = $this->partnerRepository->create($data);

            // 4. Send welcome email
            if (!empty($partner->contact_email)) {
                Mail::to($partner->contact_email)->send(new WelcomePartnerMail($partner));
            }

            // 5. Notify admins
            $notificationService = app(\App\Modules\Notification\Services\NotificationService::class);
            $notificationService->sendToRole(
                'Admin',
                'partner_application',
                'New Partner Application',
                "{$partner->contact_name} has applied as a {$partner->partner_type}.",
                ['partner_id' => $partner->id]
            );

            return $partner;
        });
    }
}

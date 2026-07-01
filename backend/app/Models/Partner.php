<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Partner extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    protected $fillable = [
        'user_id',
        'deal_id',
        'partner_type',
        'business_name',
        'business_address',
        'latitude',
        'longitude',
        'locality_id',
        'territory_id',
        'contact_name',
        'contact_email',
        'contact_mobile',
        'status',
        'onboarded_at',
        'created_by',
        // BDM-specific
        'experience_years',
        'previous_employer',
        'experience_description',
        'education_level',
        'education_institution',
        'education_field',
        'preferred_territory_ids',
        // Seller-specific
        'gst_number',
        'business_type',
        'annual_turnover',
        'product_categories',
        // Service Person-specific
        'services_offered',
        'has_driving_license',
        'driving_license_number',
        'license_type',
        'vehicle_type',
        'vehicle_registration',
        // Common
        'appointment_datetime',
        'appointment_notes',
        'registration_source',
        'utm_source',
        'utm_medium',
        'utm_campaign',
    ];

    protected $casts = [
        'latitude' => 'double',
        'longitude' => 'double',
        'onboarded_at' => 'datetime',
        'preferred_territory_ids' => 'array',
        'product_categories' => 'array',
        'services_offered' => 'array',
        'has_driving_license' => 'boolean',
        'appointment_datetime' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function deal(): BelongsTo
    {
        return $this->belongsTo(Deal::class);
    }

    public function locality(): BelongsTo
    {
        return $this->belongsTo(Locality::class);
    }

    public function territory(): BelongsTo
    {
        return $this->belongsTo(Territory::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function coverageLocalities(): BelongsToMany
    {
        return $this->belongsToMany(Locality::class, 'partner_service_coverage_localities')
            ->withPivot('is_active')
            ->withTimestamps();
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'business_name',
                'partner_type',
                'status',
                'user_id',
                'deal_id',
                'appointment_datetime',
                'registration_source',
            ])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}

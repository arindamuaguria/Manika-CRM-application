<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Partner extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

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
    ];

    protected $casts = [
        'latitude' => 'double',
        'longitude' => 'double',
        'onboarded_at' => 'datetime',
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
            ])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}

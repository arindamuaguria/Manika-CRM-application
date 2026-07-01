<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Lead extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    protected $fillable = [
        'title',
        'contact_name',
        'job_title',
        'contact_email',
        'contact_mobile',
        'alternate_mobile',
        'company_name',
        'industry',
        'company_size',
        'website',
        'linkedin_url',
        'address',
        'latitude',
        'longitude',
        'locality_id',
        'territory_id',
        'division_id',
        'assigned_bdm_id',
        'source',
        'utm_source',
        'utm_medium',
        'utm_campaign',
        'status',
        'priority',
        'estimated_deal_value',
        'preferred_contact_method',
        'notes',
        'is_mapped',
        'created_by',
    ];

    protected $casts = [
        'latitude' => 'double',
        'longitude' => 'double',
        'is_mapped' => 'boolean',
        'estimated_deal_value' => 'float',
    ];

    public function locality(): BelongsTo
    {
        return $this->belongsTo(Locality::class);
    }

    public function territory(): BelongsTo
    {
        return $this->belongsTo(Territory::class);
    }

    public function division(): BelongsTo
    {
        return $this->belongsTo(Division::class);
    }

    public function assignedBdm(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_bdm_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'title',
                'contact_name',
                'job_title',
                'contact_email',
                'contact_mobile',
                'alternate_mobile',
                'company_name',
                'industry',
                'company_size',
                'website',
                'linkedin_url',
                'status',
                'priority',
                'estimated_deal_value',
                'preferred_contact_method',
                'assigned_bdm_id',
                'is_mapped',
                'utm_source',
                'utm_medium',
                'utm_campaign',
            ])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}

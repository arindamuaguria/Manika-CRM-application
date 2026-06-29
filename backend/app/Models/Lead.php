<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Lead extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $fillable = [
        'title',
        'contact_name',
        'contact_email',
        'contact_mobile',
        'address',
        'latitude',
        'longitude',
        'locality_id',
        'territory_id',
        'division_id',
        'assigned_bdm_id',
        'source',
        'status',
        'priority',
        'notes',
        'is_mapped',
        'created_by',
    ];

    protected $casts = [
        'latitude' => 'double',
        'longitude' => 'double',
        'is_mapped' => 'boolean',
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
                'contact_email',
                'contact_mobile',
                'status',
                'priority',
                'assigned_bdm_id',
                'is_mapped',
            ])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}

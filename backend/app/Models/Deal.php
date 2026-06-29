<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Deal extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    protected $fillable = [
        'lead_id',
        'title',
        'description',
        'value',
        'status',
        'assigned_bdm_id',
        'territory_id',
        'verification_status',
        'approval_status',
        'approved_by',
        'approved_at',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'value' => 'double',
        'approved_at' => 'datetime',
    ];

    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class);
    }

    public function assignedBdm(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_bdm_id');
    }

    public function territory(): BelongsTo
    {
        return $this->belongsTo(Territory::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(DealDocument::class);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'title',
                'value',
                'status',
                'verification_status',
                'approval_status',
                'approved_by',
            ])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Territory extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $fillable = [
        'division_id',
        'name',
        'code',
        'description',
        'boundaries',
        'is_active',
        'created_by',
    ];

    protected $casts = [
        'boundaries' => 'array',
        'is_active' => 'boolean',
    ];

    public function division(): BelongsTo
    {
        return $this->belongsTo(Division::class);
    }

    public function localities(): HasMany
    {
        return $this->hasMany(Locality::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(TerritoryBdmAssignment::class);
    }

    public function activeAssignment(): HasOne
    {
        return $this->hasOne(TerritoryBdmAssignment::class)->where('is_active', true);
    }

    public function assignedBdm(): BelongsTo
    {
        // This is a helper relationship to get the BDM user directly through the active assignment
        return $this->belongsTo(User::class, 'id', 'id')->hasOne(TerritoryBdmAssignment::class)->where('is_active', true);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['division_id', 'name', 'code', 'description', 'boundaries', 'is_active'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}

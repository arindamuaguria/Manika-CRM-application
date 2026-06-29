<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Locality extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $fillable = [
        'territory_id',
        'name',
        'code',
        'description',
        'polygon',
        'geo_data',
        'is_active',
        'created_by',
    ];

    protected $casts = [
        'polygon' => 'array',
        'geo_data' => 'array',
        'is_active' => 'boolean',
    ];

    public function territory(): BelongsTo
    {
        return $this->belongsTo(Territory::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['territory_id', 'name', 'code', 'description', 'polygon', 'geo_data', 'is_active'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}

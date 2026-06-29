<?php

namespace App\Repositories;

use App\Models\Lead;

class LeadRepository extends BaseRepository
{
    public function __construct(Lead $model)
    {
        parent::__construct($model);
    }
}

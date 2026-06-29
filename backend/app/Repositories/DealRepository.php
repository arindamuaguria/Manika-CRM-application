<?php

namespace App\Repositories;

use App\Models\Deal;

class DealRepository extends BaseRepository
{
    public function __construct(Deal $model)
    {
        parent::__construct($model);
    }
}

<?php

namespace App\Repositories;

use App\Models\Territory;

class TerritoryRepository extends BaseRepository
{
    public function __construct(Territory $model)
    {
        parent::__construct($model);
    }
}

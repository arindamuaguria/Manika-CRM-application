<?php

namespace App\Repositories;

use App\Models\Locality;

class LocalityRepository extends BaseRepository
{
    public function __construct(Locality $model)
    {
        parent::__construct($model);
    }
}

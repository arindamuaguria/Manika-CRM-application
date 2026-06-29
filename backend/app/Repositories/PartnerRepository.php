<?php

namespace App\Repositories;

use App\Models\Partner;

class PartnerRepository extends BaseRepository
{
    public function __construct(Partner $model)
    {
        parent::__construct($model);
    }
}

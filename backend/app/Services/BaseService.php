<?php

namespace App\Services;

abstract class BaseService
{
    /**
     * Get the repository instance.
     */
    abstract protected function getRepository();
}

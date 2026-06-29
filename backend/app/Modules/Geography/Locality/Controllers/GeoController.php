<?php

namespace App\Modules\Geography\Locality\Controllers;

use App\Http\Controllers\Api\BaseApiController;
use App\Services\GeoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GeoController extends BaseApiController
{
    protected GeoService $geoService;

    public function __construct(GeoService $geoService)
    {
        $this->geoService = $geoService;
    }

    /**
     * Identify the locality, territory, division, and BDM for a given lat/lng.
     */
    public function identify(Request $request): JsonResponse
    {
        $request->validate([
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
        ]);

        $lat = (float) $request->input('latitude');
        $lng = (float) $request->input('longitude');

        $result = $this->geoService->getFullGeoChain($lat, $lng);

        return $this->successResponse($result, 'Geo matching completed');
    }
}

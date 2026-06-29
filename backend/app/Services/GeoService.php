<?php

namespace App\Services;

use App\Models\Division;
use App\Models\Locality;
use App\Models\Territory;
use App\Models\User;

class GeoService
{
    /**
     * Identify the locality that contains the given latitude and longitude.
     */
    public function identifyLocality(float $lat, float $lng): ?Locality
    {
        $localities = Locality::where('is_active', true)->get();

        foreach ($localities as $locality) {
            if ($locality->polygon && $this->isPointInPolygon($lat, $lng, $locality->polygon)) {
                return $locality;
            }
        }

        return null;
    }

    /**
     * Identify the territory for the given locality.
     */
    public function identifyTerritory(int $localityId): ?Territory
    {
        $locality = Locality::with('territory')->find($localityId);

        return $locality?->territory;
    }

    /**
     * Find the BDM currently assigned to the territory.
     */
    public function assignBDM(int $territoryId): ?User
    {
        $territory = Territory::with('activeAssignment.user')->find($territoryId);

        return $territory?->activeAssignment?->user;
    }

    /**
     * Get the full geo chain for a point: Locality -> Territory -> Division -> BDM.
     */
    public function getFullGeoChain(float $lat, float $lng): array
    {
        $locality = $this->identifyLocality($lat, $lng);

        if (! $locality) {
            return [
                'locality' => null,
                'territory' => null,
                'division' => null,
                'bdm' => null,
                'is_mapped' => false,
            ];
        }

        $territory = $locality->territory;
        $division = $territory?->division;
        $bdm = $territory ? $this->assignBDM($territory->id) : null;

        return [
            'locality' => $locality,
            'territory' => $territory,
            'division' => $division,
            'bdm' => $bdm,
            'is_mapped' => true,
        ];
    }

    /**
     * Ray-Casting algorithm to check if a point is inside a polygon.
     * Coordinate format in GeoJSON: [longitude, latitude]
     */
    public function isPointInPolygon(float $latitude, float $longitude, array $polygon): bool
    {
        // GeoJSON polygon coordinates structure:
        // {"type": "Polygon", "coordinates": [[[lng1, lat1], [lng2, lat2], ...]]}
        if (! isset($polygon['coordinates']) || ! is_array($polygon['coordinates'])) {
            return false;
        }

        // Get the outer ring
        $coords = $polygon['coordinates'][0];
        $verticesCount = count($coords);

        if ($verticesCount < 3) {
            return false;
        }

        $inside = false;
        for ($i = 0, $j = $verticesCount - 1; $i < $verticesCount; $j = $i++) {
            $xi = $coords[$i][1]; // latitude
            $yi = $coords[$i][0]; // longitude
            $xj = $coords[$j][1]; // latitude
            $yj = $coords[$j][0]; // longitude

            $intersect = (($yi > $longitude) != ($yj > $longitude))
                && ($latitude < ($xj - $xi) * ($longitude - $yi) / ($yj - $yi) + $xi);

            if ($intersect) {
                $inside = ! $inside;
            }
        }

        return $inside;
    }
}

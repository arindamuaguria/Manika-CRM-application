<?php

namespace App\Modules\Dashboard\Controllers;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\Locality;
use App\Models\Partner;
use App\Models\Territory;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GeoDashboardController extends BaseApiController
{
    /**
     * Get geo-dashboard data, including KPI stats and geographic layers.
     */
    public function index(Request $request): JsonResponse
    {
        $user = auth()->user();

        if (!$user->hasRole('Admin') && !$user->hasRole('BDM')) {
            return $this->forbiddenResponse('Geo dashboard not available for this role.');
        }

        $isBdm = $user->hasRole('BDM');
        $bdmId = $user->id;

        // Get assigned territory IDs if user is BDM
        $assignedTerritoryIds = [];
        if ($isBdm) {
            $assignedTerritoryIds = \App\Models\TerritoryBdmAssignment::where('user_id', $bdmId)
                ->where('is_active', true)
                ->pluck('territory_id')
                ->toArray();
        }

        // 1. Fetch KPI Counts
        $kpis = $this->getKpis($isBdm, $assignedTerritoryIds);

        // 2. Fetch Layer Data based on requested layers
        $layers = $request->input('layers', ['territory', 'locality', 'bdm', 'seller', 'service_person']);
        $data = [
            'kpis' => $kpis,
        ];

        // Filter parameters
        $search = $request->input('search');
        $territoryIdFilter = $request->input('territory_id');
        $localityIdFilter = $request->input('locality_id');
        $statusFilter = $request->input('status');

        if (in_array('territory', $layers)) {
            $query = Territory::with(['division', 'activeAssignment.user'])->where('is_active', true);
            if ($isBdm) {
                $query->whereIn('id', $assignedTerritoryIds);
            }
            if ($territoryIdFilter) {
                $query->where('id', $territoryIdFilter);
            }
            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('code', 'like', "%{$search}%");
                });
            }
            $data['territories'] = $query->get();
        }

        if (in_array('locality', $layers)) {
            $query = Locality::with('territory')->where('is_active', true);
            if ($isBdm) {
                $query->whereIn('territory_id', $assignedTerritoryIds);
            }
            if ($territoryIdFilter) {
                $query->where('territory_id', $territoryIdFilter);
            }
            if ($localityIdFilter) {
                $query->where('id', $localityIdFilter);
            }
            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('code', 'like', "%{$search}%");
                });
            }
            $data['localities'] = $query->get();
        }

        if (in_array('bdm', $layers)) {
            // Find all BDM users. If the user is BDM, they only see themselves
            $query = User::role('BDM')->where('is_active', true);
            if ($isBdm) {
                $query->where('id', $bdmId);
            }
            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            }
            
            // Eager load active assignments and their territories
            $bdms = $query->get()->map(function ($bdmUser) {
                $activeTerritories = Territory::whereHas('assignments', function ($q) use ($bdmUser) {
                    $q->where('user_id', $bdmUser->id)->where('is_active', true);
                })->get(['id', 'name', 'code']);

                return [
                    'id' => $bdmUser->id,
                    'name' => $bdmUser->name,
                    'email' => $bdmUser->email,
                    'phone' => $bdmUser->phone,
                    'territories' => $activeTerritories,
                ];
            });

            $data['bdms'] = $bdms;
        }

        if (in_array('seller', $layers)) {
            $query = Partner::where('partner_type', 'seller')
                ->whereNotNull('latitude')
                ->whereNotNull('longitude')
                ->with(['locality', 'territory', 'user']);

            if ($isBdm) {
                $query->whereIn('territory_id', $assignedTerritoryIds);
            }
            if ($territoryIdFilter) {
                $query->where('territory_id', $territoryIdFilter);
            }
            if ($localityIdFilter) {
                $query->where('locality_id', $localityIdFilter);
            }
            if ($statusFilter) {
                $query->where('status', $statusFilter);
            }
            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('business_name', 'like', "%{$search}%")
                      ->orWhere('contact_name', 'like', "%{$search}%");
                });
            }
            $data['sellers'] = $query->get();
        }

        if (in_array('service_person', $layers)) {
            $query = Partner::where('partner_type', 'service_person')
                ->whereNotNull('latitude')
                ->whereNotNull('longitude')
                ->with(['locality', 'territory', 'user', 'coverageLocalities']);

            if ($isBdm) {
                $query->whereIn('territory_id', $assignedTerritoryIds);
            }
            if ($territoryIdFilter) {
                $query->where('territory_id', $territoryIdFilter);
            }
            if ($localityIdFilter) {
                $query->where('locality_id', $localityIdFilter);
            }
            if ($statusFilter) {
                $query->where('status', $statusFilter);
            }
            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('business_name', 'like', "%{$search}%")
                      ->orWhere('contact_name', 'like', "%{$search}%");
                });
            }
            $data['service_persons'] = $query->get();
        }

        return $this->successResponse($data, 'Geo-dashboard data retrieved successfully');
    }

    /**
     * Compute KPI counts for the dashboard.
     */
    protected function getKpis(bool $isBdm, array $assignedTerritoryIds): array
    {
        $territoryQuery = Territory::where('is_active', true);
        $localityQuery = Locality::where('is_active', true);
        $bdmQuery = User::role('BDM')->where('is_active', true);
        $sellerQuery = Partner::where('partner_type', 'seller');
        $servicePersonQuery = Partner::where('partner_type', 'service_person');

        if ($isBdm) {
            $territoryQuery->whereIn('id', $assignedTerritoryIds);
            $localityQuery->whereIn('territory_id', $assignedTerritoryIds);
            $bdmQuery->where('id', auth()->id());
            $sellerQuery->whereIn('territory_id', $assignedTerritoryIds);
            $servicePersonQuery->whereIn('territory_id', $assignedTerritoryIds);
        }

        return [
            'total_territories' => $territoryQuery->count(),
            'total_localities' => $localityQuery->count(),
            'total_bdms' => $bdmQuery->count(),
            'total_sellers' => $sellerQuery->count(),
            'total_service_persons' => $servicePersonQuery->count(),
        ];
    }
}

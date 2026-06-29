<?php

namespace App\Modules\Dashboard\Controllers;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\Deal;
use App\Models\Lead;
use App\Models\Partner;
use App\Models\Territory;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Spatie\Activitylog\Models\Activity;

class DashboardController extends BaseApiController
{
    /**
     * Get dashboard analytics based on the user's role.
     */
    public function index(): JsonResponse
    {
        $user = auth()->user();

        if ($user->hasRole('Admin')) {
            return $this->getAdminDashboard();
        } elseif ($user->hasRole('BDM')) {
            return $this->getBdmDashboard($user->id);
        }

        return $this->errorResponse('Dashboard not available for this role.', 403);
    }

    /**
     * Get KPI widgets and trends for Admin.
     */
    protected function getAdminDashboard(): JsonResponse
    {
        $totalLeads = Lead::count();
        $totalDeals = Deal::count();
        $totalPartners = Partner::count();
        $totalRevenue = Deal::where('status', 'won')->sum('value');

        // Lead conversion rate: (Won + Deal Created) / Total Leads
        $convertedLeads = Lead::whereIn('status', ['deal_created', 'won'])->count();
        $conversionRate = $totalLeads > 0 ? round(($convertedLeads / $totalLeads) * 100, 2) : 0;

        // Pipeline Value: sum of open deals
        $pipelineValue = Deal::whereIn('status', ['draft', 'documentation', 'verification', 'approval'])->sum('value');

        $driver = DB::connection()->getDriverName();
        $monthFormat = $driver === 'sqlite'
            ? "strftime('%Y-%m', created_at)"
            : "DATE_FORMAT(created_at, '%Y-%m')";

        // Monthly won deals trend (last 6 months)
        $monthlyTrend = Deal::select(
            DB::raw("{$monthFormat} as month"),
            DB::raw('count(*) as count'),
            DB::raw('sum(value) as revenue')
        )
            ->where('status', 'won')
            ->groupBy('month')
            ->orderBy('month', 'asc')
            ->limit(6)
            ->get();

        // Recent Activity Logs (Spatie ActivityLog)
        $recentActivities = Activity::with('causer')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($activity) {
                return [
                    'id' => $activity->id,
                    'description' => $activity->description,
                    'causer_name' => $activity->causer ? $activity->causer->name : 'System',
                    'time_ago' => $activity->created_at->diffForHumans(),
                ];
            });

        return $this->successResponse([
            'role' => 'Admin',
            'kpis' => [
                'total_leads' => $totalLeads,
                'total_deals' => $totalDeals,
                'total_partners' => $totalPartners,
                'total_revenue' => $totalRevenue,
                'conversion_rate' => $conversionRate,
                'pipeline_value' => $pipelineValue,
            ],
            'monthly_trend' => $monthlyTrend,
            'recent_activities' => $recentActivities,
        ], 'Admin dashboard retrieved successfully');
    }

    /**
     * Get KPI widgets and territory details for BDM.
     */
    protected function getBdmDashboard(int $bdmId): JsonResponse
    {
        $myLeadsCount = Lead::where('assigned_bdm_id', $bdmId)->count();
        $myDealsCount = Deal::where('assigned_bdm_id', $bdmId)->count();
        $myWonDealsCount = Deal::where('assigned_bdm_id', $bdmId)->where('status', 'won')->count();
        $myRevenue = Deal::where('assigned_bdm_id', $bdmId)->where('status', 'won')->sum('value');

        // Open leads count (new, assigned, qualified)
        $openLeadsCount = Lead::where('assigned_bdm_id', $bdmId)
            ->whereIn('status', ['new', 'assigned', 'qualified'])
            ->count();

        // Territories assigned to BDM with locality counts
        $myTerritories = Territory::whereHas('assignments', function ($q) use ($bdmId) {
            $q->where('user_id', $bdmId)->where('is_active', true);
        })
            ->withCount('localities')
            ->get()
            ->map(function ($t) {
                return [
                    'id' => $t->id,
                    'name' => $t->name,
                    'code' => $t->code,
                    'localities_count' => $t->localities_count,
                ];
            });

        $driver = DB::connection()->getDriverName();
        $monthFormat = $driver === 'sqlite'
            ? "strftime('%Y-%m', created_at)"
            : "DATE_FORMAT(created_at, '%Y-%m')";

        // BDM monthly trend
        $monthlyTrend = Deal::select(
            DB::raw("{$monthFormat} as month"),
            DB::raw('count(*) as count'),
            DB::raw('sum(value) as revenue')
        )
            ->where('assigned_bdm_id', $bdmId)
            ->where('status', 'won')
            ->groupBy('month')
            ->orderBy('month', 'asc')
            ->limit(6)
            ->get();

        return $this->successResponse([
            'role' => 'BDM',
            'kpis' => [
                'total_leads' => $myLeadsCount,
                'total_deals' => $myDealsCount,
                'won_deals' => $myWonDealsCount,
                'total_revenue' => $myRevenue,
                'open_leads' => $openLeadsCount,
            ],
            'my_territories' => $myTerritories,
            'monthly_trend' => $monthlyTrend,
        ], 'BDM dashboard retrieved successfully');
    }
}

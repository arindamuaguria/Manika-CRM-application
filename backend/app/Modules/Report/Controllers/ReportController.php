<?php

namespace App\Modules\Report\Controllers;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\Deal;
use App\Models\Lead;
use App\Models\Partner;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends BaseApiController
{
    /**
     * Preview lead report data.
     */
    public function previewLeads(Request $request): JsonResponse
    {
        Gate::authorize('reports.view');

        $query = Lead::with(['assignedBdm', 'territory', 'locality']);
        $this->applyLeadFilters($query, $request);

        $data = $query->paginate($request->input('per_page', 15));

        return $this->successResponse($data, 'Leads report preview retrieved');
    }

    /**
     * Export leads report to CSV.
     */
    public function exportLeads(Request $request): StreamedResponse
    {
        Gate::authorize('reports.export');

        $query = Lead::with(['assignedBdm', 'territory', 'locality']);
        $this->applyLeadFilters($query, $request);

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="leads_report_'.now()->format('YmdHis').'.csv"',
        ];

        return new StreamedResponse(function () use ($query) {
            $handle = fopen('php://output', 'w');

            // Add CSV headers
            fputcsv($handle, [
                'Lead ID', 'Title', 'Contact Name', 'Mobile', 'Email',
                'Status', 'Priority', 'Assigned BDM', 'Territory', 'Locality', 'Created At',
            ]);

            $query->chunk(100, function ($leads) use ($handle) {
                foreach ($leads as $lead) {
                    fputcsv($handle, [
                        $lead->id,
                        $lead->title,
                        $lead->contact_name,
                        $lead->contact_mobile,
                        $lead->contact_email,
                        $lead->status,
                        $lead->priority,
                        $lead->assignedBdm ? $lead->assignedBdm->name : 'Unassigned',
                        $lead->territory ? $lead->territory->name : 'N/A',
                        $lead->locality ? $lead->locality->name : 'N/A',
                        $lead->created_at->toDateTimeString(),
                    ]);
                }
            });

            fclose($handle);
        }, 200, $headers);
    }

    /**
     * Preview deal report data.
     */
    public function previewDeals(Request $request): JsonResponse
    {
        Gate::authorize('reports.view');

        $query = Deal::with(['assignedBdm', 'territory', 'lead']);
        $this->applyDealFilters($query, $request);

        $data = $query->paginate($request->input('per_page', 15));

        return $this->successResponse($data, 'Deals report preview retrieved');
    }

    /**
     * Export deals report to CSV.
     */
    public function exportDeals(Request $request): StreamedResponse
    {
        Gate::authorize('reports.export');

        $query = Deal::with(['assignedBdm', 'territory', 'lead']);
        $this->applyDealFilters($query, $request);

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="deals_report_'.now()->format('YmdHis').'.csv"',
        ];

        return new StreamedResponse(function () use ($query) {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, [
                'Deal ID', 'Title', 'Value (INR)', 'Status', 'Verification Status',
                'Approval Status', 'Assigned BDM', 'Territory', 'Lead Name', 'Created At',
            ]);

            $query->chunk(100, function ($deals) use ($handle) {
                foreach ($deals as $deal) {
                    fputcsv($handle, [
                        $deal->id,
                        $deal->title,
                        $deal->value,
                        $deal->status,
                        $deal->verification_status,
                        $deal->approval_status,
                        $deal->assignedBdm ? $deal->assignedBdm->name : 'Unassigned',
                        $deal->territory ? $deal->territory->name : 'N/A',
                        $deal->lead ? $deal->lead->contact_name : 'N/A',
                        $deal->created_at->toDateTimeString(),
                    ]);
                }
            });

            fclose($handle);
        }, 200, $headers);
    }

    /**
     * Preview partner report data.
     */
    public function previewPartners(Request $request): JsonResponse
    {
        Gate::authorize('reports.view');

        $query = Partner::with(['locality', 'territory', 'user']);
        $this->applyPartnerFilters($query, $request);

        $data = $query->paginate($request->input('per_page', 15));

        return $this->successResponse($data, 'Partners report preview retrieved');
    }

    /**
     * Export partners report to CSV.
     */
    public function exportPartners(Request $request): StreamedResponse
    {
        Gate::authorize('reports.export');

        $query = Partner::with(['locality', 'territory', 'user']);
        $this->applyPartnerFilters($query, $request);

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="partners_report_'.now()->format('YmdHis').'.csv"',
        ];

        return new StreamedResponse(function () use ($query) {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, [
                'Partner ID', 'Business Name', 'Partner Type', 'Contact Name', 'Mobile',
                'Email', 'Status', 'Locality', 'Territory', 'Onboarded At',
            ]);

            $query->chunk(100, function ($partners) use ($handle) {
                foreach ($partners as $partner) {
                    fputcsv($handle, [
                        $partner->id,
                        $partner->business_name,
                        $partner->partner_type,
                        $partner->contact_name,
                        $partner->contact_mobile,
                        $partner->contact_email,
                        $partner->status,
                        $partner->locality ? $partner->locality->name : 'N/A',
                        $partner->territory ? $partner->territory->name : 'N/A',
                        $partner->onboarded_at ? $partner->onboarded_at->toDateTimeString() : 'N/A',
                    ]);
                }
            });

            fclose($handle);
        }, 200, $headers);
    }

    /**
     * Helper to apply filters to Lead query.
     */
    protected function applyLeadFilters($query, Request $request): void
    {
        $user = auth()->user();
        if ($user && $user->hasRole('BDM')) {
            $query->where('assigned_bdm_id', $user->id);
        }

        if ($request->has('status') && $request->input('status') !== '') {
            $query->where('status', $request->input('status'));
        }

        if ($request->has('territory_id') && $request->input('territory_id') !== '') {
            $query->where('territory_id', $request->input('territory_id'));
        }

        if ($request->has('date_from') && $request->input('date_from') !== '') {
            $query->whereDate('created_at', '>=', $request->input('date_from'));
        }

        if ($request->has('date_to') && $request->input('date_to') !== '') {
            $query->whereDate('created_at', '<=', $request->input('date_to'));
        }
    }

    /**
     * Helper to apply filters to Deal query.
     */
    protected function applyDealFilters($query, Request $request): void
    {
        $user = auth()->user();
        if ($user && $user->hasRole('BDM')) {
            $query->where('assigned_bdm_id', $user->id);
        }

        if ($request->has('status') && $request->input('status') !== '') {
            $query->where('status', $request->input('status'));
        }

        if ($request->has('territory_id') && $request->input('territory_id') !== '') {
            $query->where('territory_id', $request->input('territory_id'));
        }

        if ($request->has('date_from') && $request->input('date_from') !== '') {
            $query->whereDate('created_at', '>=', $request->input('date_from'));
        }

        if ($request->has('date_to') && $request->input('date_to') !== '') {
            $query->whereDate('created_at', '<=', $request->input('date_to'));
        }
    }

    /**
     * Helper to apply filters to Partner query.
     */
    protected function applyPartnerFilters($query, Request $request): void
    {
        if ($request->has('status') && $request->input('status') !== '') {
            $query->where('status', $request->input('status'));
        }

        if ($request->has('territory_id') && $request->input('territory_id') !== '') {
            $query->where('territory_id', $request->input('territory_id'));
        }

        if ($request->has('date_from') && $request->input('date_from') !== '') {
            $query->whereDate('onboarded_at', '>=', $request->input('date_from'));
        }

        if ($request->has('date_to') && $request->input('date_to') !== '') {
            $query->whereDate('onboarded_at', '<=', $request->input('date_to'));
        }
    }
}

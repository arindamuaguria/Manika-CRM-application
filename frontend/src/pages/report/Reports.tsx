import { useState, useEffect } from 'react';
import api from '@/services/api';
import type { Territory, PaginatedResponse } from '@/types';
import {
  FileText,
  Download,
  Calendar,
  MapPin,
  Tag,
  Loader2,
  Table,
} from 'lucide-react';
import { usePermission } from '@/hooks';

type ReportType = 'leads' | 'deals' | 'partners';

export default function Reports() {
  const { can } = usePermission();
  const [reportType, setReportType] = useState<ReportType>('leads');

  // Filters
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [territoryId, setTerritoryId] = useState('');
  const [status, setStatus] = useState('');

  // Dropdown options
  const [territories, setTerritories] = useState<Territory[]>([]);

  // Preview state
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const fetchTerritories = async () => {
      try {
        const res = await api.get<PaginatedResponse<Territory>>('/territories?per_page=100');
        setTerritories(res.data.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTerritories();
  }, []);

  const getFilterParams = () => {
    return {
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
      territory_id: territoryId || undefined,
      status: status || undefined,
      page: currentPage,
      per_page: 10,
    };
  };

  const handleGeneratePreview = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<PaginatedResponse<any>>(`/reports/${reportType}`, {
        params: getFilterParams(),
      });
      setPreviewData(response.data.data.data);
      setLastPage(response.data.data.last_page);
      setTotalRecords(response.data.data.total);
    } catch (err) {
      console.error(err);
      alert('Failed to generate report preview.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleGeneratePreview();
  }, [reportType, currentPage]);

  // Wait, let's just trigger the preview update when reportType or currentPage changes.
  // We can also trigger it manually when they click "Apply Filters".
  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    handleGeneratePreview();
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const response = await api.get(`/reports/${reportType}/export`, {
        params: getFilterParams(),
        responseType: 'blob',
      });

      // Trigger browser file download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportType}_report_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      alert('Failed to export CSV report.');
    } finally {
      setIsExporting(false);
    }
  };

  // Status dropdown options based on report type
  const getStatusOptions = () => {
    if (reportType === 'leads') {
      return [
        { value: 'new', label: 'New' },
        { value: 'assigned', label: 'Assigned' },
        { value: 'qualified', label: 'Qualified' },
        { value: 'deal_created', label: 'Deal Created' },
        { value: 'won', label: 'Won' },
        { value: 'lost', label: 'Lost' },
      ];
    } else if (reportType === 'deals') {
      return [
        { value: 'draft', label: 'Draft' },
        { value: 'documentation', label: 'Documentation' },
        { value: 'verification', label: 'Verification' },
        { value: 'approval', label: 'Approval' },
        { value: 'won', label: 'Won' },
        { value: 'lost', label: 'Lost' },
      ];
    } else {
      return [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'suspended', label: 'Suspended' },
      ];
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Reports & Analytics</h1>
          <p className="text-neutral-500 text-sm">Generate and export CSV reports for leads, deals, and partners.</p>
        </div>
        {can('reports.export') && (
          <button
            onClick={handleExportCSV}
            disabled={isExporting || previewData.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            {isExporting ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Download size={18} />
            )}
            Export CSV
          </button>
        )}
      </div>

      {/* Configuration & Filters Panel */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-6">
        {/* Report Type Selector */}
        <div>
          <label className="block text-xs font-semibold text-neutral-500 uppercase mb-2">
            Select Report Type
          </label>
          <div className="flex gap-4">
            {(['leads', 'deals', 'partners'] as ReportType[]).map((type) => (
              <button
                key={type}
                onClick={() => {
                  setReportType(type);
                  setStatus('');
                  setCurrentPage(1);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border font-bold text-sm transition-all cursor-pointer ${
                  reportType === type
                    ? 'bg-primary-50 border-primary-300 text-primary-750 shadow-sm'
                    : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100/50'
                }`}
              >
                <FileText size={18} />
                <span className="capitalize">{type} Report</span>
              </button>
            ))}
          </div>
        </div>

        {/* Filters Form */}
        <form onSubmit={handleApplyFilters} className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-neutral-100">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 uppercase mb-1.5">
              <Calendar size={14} /> Date From
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 uppercase mb-1.5">
              <Calendar size={14} /> Date To
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 uppercase mb-1.5">
              <MapPin size={14} /> Territory
            </label>
            <select
              value={territoryId}
              onChange={(e) => setTerritoryId(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2"
            >
              <option value="">All Territories</option>
              {territories.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 uppercase mb-1.5">
              <Tag size={14} /> Status
            </label>
            <div className="flex gap-2">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="flex-1 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2"
              >
                <option value="">All Statuses</option>
                {getStatusOptions().map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer"
              >
                Apply
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Preview Section */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between">
          <h3 className="text-sm font-bold text-neutral-850 flex items-center gap-2">
            <Table size={18} className="text-primary-600" />
            Report Preview
          </h3>
          <span className="text-xs text-neutral-500 font-medium">
            Showing {previewData.length} of {totalRecords} records
          </span>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="animate-spin text-primary-600" size={32} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            {reportType === 'leads' && (
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200 text-xs font-semibold text-neutral-500 uppercase">
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Contact Person</th>
                    <th className="px-6 py-4">Mobile</th>
                    <th className="px-6 py-4">Territory</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Created At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {previewData.map((row: any) => (
                    <tr key={row.id} className="hover:bg-neutral-50/30">
                      <td className="px-6 py-4 font-semibold text-neutral-900">{row.title}</td>
                      <td className="px-6 py-4 text-neutral-600">{row.contact_name}</td>
                      <td className="px-6 py-4 text-neutral-600">{row.contact_mobile}</td>
                      <td className="px-6 py-4 text-neutral-600">{row.territory?.name || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold uppercase bg-neutral-100 border text-neutral-650">
                          {row.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-neutral-500">
                        {new Date(row.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {reportType === 'deals' && (
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200 text-xs font-semibold text-neutral-500 uppercase">
                    <th className="px-6 py-4">Deal Title</th>
                    <th className="px-6 py-4">Value</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Verification</th>
                    <th className="px-6 py-4">BDM</th>
                    <th className="px-6 py-4">Created At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {previewData.map((row: any) => (
                    <tr key={row.id} className="hover:bg-neutral-50/30">
                      <td className="px-6 py-4 font-semibold text-neutral-900">{row.title}</td>
                      <td className="px-6 py-4 font-semibold text-neutral-900">
                        ₹{(row.value ?? 0).toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 uppercase text-xs font-semibold text-neutral-600">
                        {row.status}
                      </td>
                      <td className="px-6 py-4 uppercase text-xs font-semibold text-neutral-600">
                        {row.verification_status}
                      </td>
                      <td className="px-6 py-4 text-neutral-600">{row.assigned_bdm?.name || 'N/A'}</td>
                      <td className="px-6 py-4 text-neutral-500">
                        {new Date(row.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {reportType === 'partners' && (
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200 text-xs font-semibold text-neutral-500 uppercase">
                    <th className="px-6 py-4">Business Name</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Contact Name</th>
                    <th className="px-6 py-4">Mobile</th>
                    <th className="px-6 py-4">Territory</th>
                    <th className="px-6 py-4">Onboarded At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {previewData.map((row: any) => (
                    <tr key={row.id} className="hover:bg-neutral-50/30">
                      <td className="px-6 py-4 font-semibold text-neutral-900">{row.business_name}</td>
                      <td className="px-6 py-4 uppercase text-xs font-semibold text-neutral-605">{row.partner_type}</td>
                      <td className="px-6 py-4 text-neutral-600">{row.contact_name}</td>
                      <td className="px-6 py-4 text-neutral-600">{row.contact_mobile}</td>
                      <td className="px-6 py-4 text-neutral-600">{row.territory?.name || 'N/A'}</td>
                      <td className="px-6 py-4 text-neutral-500">
                        {row.onboarded_at ? new Date(row.onboarded_at).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {previewData.length === 0 && (
              <div className="py-16 text-center text-neutral-500 italic">
                No matching records found.
              </div>
            )}
          </div>
        )}

        {lastPage > 1 && (
          <div className="flex justify-between items-center px-6 py-4 border-t border-neutral-200 bg-neutral-50">
            <p className="text-xs text-neutral-500">
              Page {currentPage} of {lastPage}
            </p>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="px-3 py-1 bg-white border border-neutral-200 rounded text-xs font-semibold hover:bg-neutral-50 disabled:opacity-50 transition-colors"
              >
                Previous
              </button>
              <button
                disabled={currentPage === lastPage}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="px-3 py-1 bg-white border border-neutral-200 rounded text-xs font-semibold hover:bg-neutral-50 disabled:opacity-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

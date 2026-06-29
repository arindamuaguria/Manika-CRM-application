import { useState, useEffect } from 'react';
import api from '@/services/api';
import {
  TrendingUp,
  Users,
  Award,
  DollarSign,
  Activity as ActivityIcon,
  Map,
  Loader2,
  Percent,
  Compass,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

interface DashboardKpis {
  total_leads?: number;
  total_deals?: number;
  total_partners?: number;
  total_revenue?: number;
  conversion_rate?: number;
  pipeline_value?: number;
  won_deals?: number;
  open_leads?: number;
}

interface MonthlyTrendItem {
  month: string;
  count: number;
  revenue: number;
}

interface RecentActivity {
  id: number;
  description: string;
  causer_name: string;
  time_ago: string;
}

interface BdmTerritory {
  id: number;
  name: string;
  code: string;
  localities_count: number;
}

interface DashboardData {
  role: 'Admin' | 'BDM';
  kpis: DashboardKpis;
  monthly_trend: MonthlyTrendItem[];
  recent_activities?: RecentActivity[];
  my_territories?: BdmTerritory[];
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get<{ data: DashboardData }>('/dashboard');
        setData(response.data.data);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-primary-600" size={40} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20 text-neutral-500">
        Failed to load dashboard analytics.
      </div>
    );
  }

  const { kpis, monthly_trend, recent_activities, my_territories } = data;

  // Custom SVG Chart dimensions and calculations
  const chartHeight = 160;
  const chartWidth = 500;
  const maxRevenue = monthly_trend.length > 0 ? Math.max(...monthly_trend.map((d) => d.revenue)) : 1;
  const points = monthly_trend.map((d, index) => {
    const x = monthly_trend.length > 1 ? (index / (monthly_trend.length - 1)) * chartWidth : chartWidth / 2;
    const y = chartHeight - (d.revenue / maxRevenue) * (chartHeight - 30) - 15;
    return { x, y, label: d.month, value: d.revenue };
  });

  const pathD = points.length > 0
    ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map((p) => `L ${p.x} ${p.y}`).join(' ')
    : '';

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z`
    : '';

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-black text-neutral-900 tracking-tight">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-neutral-500 mt-1">
          Here is an overview of the {data.role === 'Admin' ? 'system-wide' : 'assigned territory'} performance.
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {data.role === 'Admin' ? (
          <>
            {/* KPI 1: Total Leads */}
            <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start">
                <span className="text-sm font-bold text-neutral-400 uppercase tracking-wider">Total Leads</span>
                <div className="p-3 rounded-xl bg-primary-50 text-primary-600 group-hover:scale-110 transition-transform">
                  <Users size={20} />
                </div>
              </div>
              <p className="text-3xl font-black text-neutral-900 mt-4">{kpis.total_leads ?? 0}</p>
              <p className="text-xs text-neutral-500 mt-1">Leads captured in system</p>
            </div>

            {/* KPI 2: Conversion Rate */}
            <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start">
                <span className="text-sm font-bold text-neutral-400 uppercase tracking-wider">Conversion Rate</span>
                <div className="p-3 rounded-xl bg-success-50 text-success-600 group-hover:scale-110 transition-transform">
                  <Percent size={20} />
                </div>
              </div>
              <p className="text-3xl font-black text-neutral-900 mt-4">{kpis.conversion_rate ?? 0}%</p>
              <p className="text-xs text-neutral-500 mt-1">Qualified leads converted</p>
            </div>

            {/* KPI 3: Total Partners */}
            <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start">
                <span className="text-sm font-bold text-neutral-400 uppercase tracking-wider">Onboarded Partners</span>
                <div className="p-3 rounded-xl bg-warning-50 text-warning-600 group-hover:scale-110 transition-transform">
                  <Award size={20} />
                </div>
              </div>
              <p className="text-3xl font-black text-neutral-900 mt-4">{kpis.total_partners ?? 0}</p>
              <p className="text-xs text-neutral-500 mt-1">Active Sellers & Service Persons</p>
            </div>

            {/* KPI 4: Total Revenue */}
            <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start">
                <span className="text-sm font-bold text-neutral-400 uppercase tracking-wider">Total Revenue</span>
                <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform">
                  <DollarSign size={20} />
                </div>
              </div>
              <p className="text-3xl font-black text-neutral-900 mt-4">
                ₹{(kpis.total_revenue ?? 0).toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-neutral-500 mt-1">From won deals</p>
            </div>
          </>
        ) : (
          <>
            {/* KPI 1: My Leads */}
            <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start">
                <span className="text-sm font-bold text-neutral-400 uppercase tracking-wider">My Leads</span>
                <div className="p-3 rounded-xl bg-primary-50 text-primary-600 group-hover:scale-110 transition-transform">
                  <Users size={20} />
                </div>
              </div>
              <p className="text-3xl font-black text-neutral-900 mt-4">{kpis.total_leads ?? 0}</p>
              <p className="text-xs text-neutral-500 mt-1">Assigned leads</p>
            </div>

            {/* KPI 2: Open Leads */}
            <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start">
                <span className="text-sm font-bold text-neutral-400 uppercase tracking-wider">Open Leads</span>
                <div className="p-3 rounded-xl bg-warning-50 text-warning-600 group-hover:scale-110 transition-transform">
                  <Compass size={20} />
                </div>
              </div>
              <p className="text-3xl font-black text-neutral-900 mt-4">{kpis.open_leads ?? 0}</p>
              <p className="text-xs text-neutral-500 mt-1">Awaiting qualification</p>
            </div>

            {/* KPI 3: Won Deals */}
            <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start">
                <span className="text-sm font-bold text-neutral-400 uppercase tracking-wider">Won Deals</span>
                <div className="p-3 rounded-xl bg-success-50 text-success-600 group-hover:scale-110 transition-transform">
                  <Award size={20} />
                </div>
              </div>
              <p className="text-3xl font-black text-neutral-900 mt-4">{kpis.won_deals ?? 0}</p>
              <p className="text-xs text-neutral-500 mt-1">Converted to partners</p>
            </div>

            {/* KPI 4: My Revenue */}
            <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start">
                <span className="text-sm font-bold text-neutral-400 uppercase tracking-wider">My Revenue</span>
                <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform">
                  <DollarSign size={20} />
                </div>
              </div>
              <p className="text-3xl font-black text-neutral-900 mt-4">
                ₹{(kpis.total_revenue ?? 0).toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-neutral-500 mt-1">From won deals</p>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Chart */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center border-b border-neutral-100 pb-4">
            <h3 className="text-sm font-bold text-neutral-850 flex items-center gap-2">
              <TrendingUp size={18} className="text-primary-600" />
              Revenue Trend (Won Deals)
            </h3>
            <span className="text-xs text-neutral-500 font-medium">Last 6 Months</span>
          </div>

          {monthly_trend.length > 0 ? (
            <div className="space-y-4">
              <div className="relative w-full overflow-hidden">
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto overflow-visible">
                  <defs>
                    <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {/* Grid Lines */}
                  <line x1="0" y1={chartHeight - 15} x2={chartWidth} y2={chartHeight - 15} stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="0" y1={chartHeight / 2} x2={chartWidth} y2={chartHeight / 2} stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="0" y1="15" x2={chartWidth} y2="15" stroke="#f1f5f9" strokeWidth="1" />

                  {/* Area */}
                  {areaD && <path d={areaD} fill="url(#gradient)" />}

                  {/* Line */}
                  {pathD && <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />}

                  {/* Dots & Labels */}
                  {points.map((p, i) => (
                    <g key={i}>
                      <circle cx={p.x} cy={p.y} r="5" fill="#ffffff" stroke="#3b82f6" strokeWidth="2.5" />
                      <text
                        x={p.x}
                        y={chartHeight + 10}
                        textAnchor="middle"
                        className="text-[10px] font-bold fill-neutral-400"
                      >
                        {p.label}
                      </text>
                      <text
                        x={p.x}
                        y={p.y - 10}
                        textAnchor="middle"
                        className="text-[10px] font-bold fill-primary-600"
                      >
                        ₹{(p.value / 1000).toFixed(0)}k
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            </div>
          ) : (
            <div className="h-[160px] flex items-center justify-center text-neutral-450 italic text-xs">
              No sales data recorded yet.
            </div>
          )}
        </div>

        {/* Right Panel (Activities or Territories) */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
          {data.role === 'Admin' ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-neutral-100 pb-4">
                <h3 className="text-sm font-bold text-neutral-850 flex items-center gap-2">
                  <ActivityIcon size={18} className="text-primary-600" />
                  Recent Activity
                </h3>
              </div>
              <div className="flow-root">
                <ul className="-mb-8">
                  {recent_activities?.map((activity, index) => (
                    <li key={activity.id}>
                      <div className="relative pb-8">
                        {index !== recent_activities.length - 1 ? (
                          <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-neutral-200" aria-hidden="true" />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center text-xs font-semibold text-neutral-600">
                              {activity.causer_name.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0 pt-1.5">
                            <p className="text-xs font-medium text-neutral-900">{activity.description}</p>
                            <div className="text-[10px] text-neutral-450 mt-0.5 flex justify-between">
                              <span>By {activity.causer_name}</span>
                              <span>{activity.time_ago}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                  {(!recent_activities || recent_activities.length === 0) && (
                    <p className="text-xs text-neutral-450 italic text-center py-6">No recent actions logged.</p>
                  )}
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-neutral-100 pb-4">
                <h3 className="text-sm font-bold text-neutral-850 flex items-center gap-2">
                  <Map size={18} className="text-primary-600" />
                  My Territories
                </h3>
              </div>
              <div className="divide-y divide-neutral-100">
                {my_territories?.map((t) => (
                  <div key={t.id} className="py-3 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-neutral-800">{t.name}</p>
                      <p className="text-[10px] text-neutral-500 mt-0.5">Code: {t.code}</p>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-primary-50 text-primary-700 text-xs font-semibold border border-primary-100">
                      {t.localities_count} Localities
                    </span>
                  </div>
                ))}
                {(!my_territories || my_territories.length === 0) && (
                  <p className="text-xs text-neutral-450 italic text-center py-6">No territories assigned.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

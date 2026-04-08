/**
 * Admin Dashboard View.
 * Displays overall stats and charts fetching data from the analytics API.
 */
import { useEffect, useState } from 'react';
import { analyticsApi } from '@/api/fleetApi';
import type { DashboardAnalytics } from '@/types/fleet';
import {
  Car, CalendarCheck, Clock, Percent, AlertCircle, RefreshCw
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardAnalytics | null>(null);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [dashRes, monthRes] = await Promise.all([
        analyticsApi.dashboard(),
        analyticsApi.monthly(new Date().getFullYear())
      ]);
      setData(dashRes.data);
      // Format month strings e.g., '2023-01-01T00:00:00Z' => 'Jan'
      const formattedMonth = monthRes.data.bookings.map((b: any, idx: number) => {
        const d = new Date(b.month);
        const monthName = d.toLocaleString('default', { month: 'short' });
        const c = monthRes.data.commissions[idx] || {};
        return {
          name: monthName,
          revenue: parseFloat(b.revenue) || 0,
          driverComm: parseFloat(c.driver) || 0,
          carComm: parseFloat(c.car) || 0,
          adminComm: parseFloat(c.admin) || 0,
        };
      });
      setMonthlyData(formattedMonth);
    } catch (err) {
      setError('Failed to load analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <RefreshCw size={32} className="fleet-spin" color="#f59e0b" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="fleet-error-banner" style={{ margin: 'auto', maxWidth: 400, marginTop: 40 }}>
        <AlertCircle size={20} /> {error}
      </div>
    );
  }

  return (
    <div>
      <div className="fleet-page-header">
        <div>
          <h1 className="fleet-page-title">Admin Dashboard</h1>
          <p className="fleet-page-subtitle">Overview of the entire fleet performance.</p>
        </div>
        <button className="fleet-btn fleet-btn-secondary" onClick={loadData}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className="fleet-stats-grid">
        <div className="fleet-stat-card">
          <div className="fleet-stat-icon-wrap" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
            <CalendarCheck size={24} />
          </div>
          <div className="fleet-stat-content">
            <p className="fleet-stat-label">Total Bookings</p>
            <p className="fleet-stat-value">{data.bookings.total}</p>
          </div>
          <CalendarCheck className="fleet-stat-bg-icon" />
        </div>

        <div className="fleet-stat-card">
          <div className="fleet-stat-icon-wrap" style={{ background: 'rgba(234, 179, 8, 0.15)', color: '#eab308' }}>
            <Clock size={24} />
          </div>
          <div className="fleet-stat-content">
            <p className="fleet-stat-label">Pending / Ongoing</p>
            <p className="fleet-stat-value">{data.bookings.pending_assignment} / {data.bookings.ongoing}</p>
          </div>
          <Clock className="fleet-stat-bg-icon" />
        </div>

        <div className="fleet-stat-card">
          <div className="fleet-stat-icon-wrap" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}>
            <Car size={24} />
          </div>
          <div className="fleet-stat-content">
            <p className="fleet-stat-label">Total Volume (₹)</p>
            <p className="fleet-stat-value">₹{data.commissions.total}</p>
          </div>
          <Car className="fleet-stat-bg-icon" />
        </div>

        <div className="fleet-stat-card">
          <div className="fleet-stat-icon-wrap" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' }}>
            <Percent size={24} />
          </div>
          <div className="fleet-stat-content">
            <p className="fleet-stat-label">Admin Commission</p>
            <p className="fleet-stat-value">₹{data.commissions.admin}</p>
          </div>
          <Percent className="fleet-stat-bg-icon" />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="fleet-table-container" style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 20 }}>Monthly Revenue</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a4a" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <RechartsTooltip contentStyle={{ background: '#1a1a2e', borderColor: '#2a2a4a' }} />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="fleet-table-container" style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 20 }}>Commission Splits</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a4a" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <RechartsTooltip contentStyle={{ background: '#1a1a2e', borderColor: '#2a2a4a' }} />
                <Bar dataKey="carComm" stackId="a" fill="#eab308" name="Car Owner" />
                <Bar dataKey="driverComm" stackId="a" fill="#22c55e" name="Driver" />
                <Bar dataKey="adminComm" stackId="a" fill="#a855f7" name="Admin" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

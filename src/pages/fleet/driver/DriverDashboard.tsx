/**
 * Driver Dashboard View.
 * Displays driver stats and current/pending trip tasks.
 */
import { useEffect, useState } from 'react';
import { driverApiEndpoints as driverApi } from '@/api/fleetApi';
import { MapPin, Play, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DriverDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [pRes, tRes] = await Promise.all([driverApi.profile(), driverApi.tasks()]);
        setProfile(pRes.data);
        setTasks(tRes.data.results || []);
      } catch {} finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const activeTrip = tasks.find(t => t.status === 'started');
  const upcomingTrips = tasks.filter(t => t.status === 'assigned');

  if (loading) return <div style={{textAlign: 'center', marginTop: 40}}>Loading...</div>;

  return (
    <div>
      <div className="fleet-page-header">
        <div>
          <h1 className="fleet-page-title">Welcome, {profile?.user_details?.username}</h1>
          <p className="fleet-page-subtitle">Driver Dashboard • Status: <span style={{color: profile?.is_logged_in ? '#22c55e' : '#ef4444'}}>{profile?.is_logged_in ? 'Online' : 'Offline'}</span></p>
        </div>
      </div>

      {activeTrip && (
        <div className="fleet-stat-card" style={{ background: 'linear-gradient(to right, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.2))', border: '1px solid rgba(59, 130, 246, 0.5)', marginBottom: 32 }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: 8 }}><Play size={18}/> ONGOING TRIP TASK</h3>
            <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>{activeTrip.booking_details?.pickup_location} → {activeTrip.booking_details?.drop_location}</p>
            <p style={{ color: '#94a3b8', marginTop: 8 }}>Trip No: {activeTrip.booking_details?.trip_no} • Customer: {activeTrip.booking_details?.customer_details?.name}</p>
          </div>
          <div>
            <Link to="/driver/tasks" className="fleet-btn fleet-btn-primary">View Current Task</Link>
          </div>
        </div>
      )}

      <div className="fleet-stats-grid">
        <div className="fleet-stat-card">
          <div className="fleet-stat-icon-wrap" style={{ background: 'rgba(234, 179, 8, 0.15)', color: '#eab308' }}>
            <MapPin size={24} />
          </div>
          <div className="fleet-stat-content">
            <p className="fleet-stat-label">Upcoming Tasks</p>
            <p className="fleet-stat-value">{upcomingTrips.length}</p>
          </div>
        </div>

        <div className="fleet-stat-card">
          <div className="fleet-stat-icon-wrap" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}>
            <CheckCircle size={24} />
          </div>
          <div className="fleet-stat-content">
            <p className="fleet-stat-label">Completed Tasks</p>
            <p className="fleet-stat-value">{tasks.filter(t => t.status === 'completed').length}</p>
          </div>
        </div>
      </div>

      <div className="fleet-table-container mt-8" style={{ marginTop: 32 }}>
        <h3 style={{ padding: '20px 20px 0 20px', margin: 0 }}>Upcoming Trip Assignments</h3>
        <table className="fleet-table">
          <thead>
            <tr>
              <th>Trip / Customer</th>
              <th>Pickup Area</th>
              <th>Type</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
             {upcomingTrips.length === 0 ? <tr><td colSpan={4} style={{textAlign: 'center'}}>No pending assignments.</td></tr> :
              upcomingTrips.map(t => (
                <tr key={t.id}>
                  <td>
                    <strong>{t.booking_details?.trip_no}</strong><br/>
                    <small style={{ color: '#94a3b8' }}>{t.booking_details?.customer_details?.name}</small>
                  </td>
                  <td>
                    {t.booking_details?.pickup_date} {t.booking_details?.pickup_time}<br/>
                    <small style={{ color: '#94a3b8' }}>{t.booking_details?.pickup_location}</small>
                  </td>
                  <td><span className="fleet-badge pending" style={{ textTransform: 'capitalize' }}>{t.booking_details?.type_of_trip}</span></td>
                  <td>
                    <Link to="/driver/tasks" className="fleet-btn fleet-btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Go to Tasks</Link>
                  </td>
                </tr>
              ))
             }
          </tbody>
        </table>
      </div>
    </div>
  );
}

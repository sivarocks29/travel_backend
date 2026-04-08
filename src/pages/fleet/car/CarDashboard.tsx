/**
 * Car Owner Dashboard View.
 * Shows assigned trips and earnings for the car owner.
 */
import { useEffect, useState } from 'react';
import { carApi } from '@/api/fleetApi';
import { Car, DollarSign } from 'lucide-react';

export default function CarDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [pRes, cRes] = await Promise.all([carApi.profile(), carApi.commissions()]);
        setProfile(pRes.data);
        setCommissions(cRes.data.results || []);
      } catch {} finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalEarnings = commissions.reduce((sum, c) => sum + parseFloat(c.car_amount || '0'), 0);

  if (loading) return <div style={{textAlign: 'center', marginTop: 40}}>Loading...</div>;

  return (
    <div>
      <div className="fleet-page-header">
        <div>
          <h1 className="fleet-page-title">Welcome, {profile?.owner_name || 'Car Owner'}</h1>
          <p className="fleet-page-subtitle">Vehicle: {profile?.vehicle_number}</p>
        </div>
      </div>

      <div className="fleet-stats-grid">
        <div className="fleet-stat-card">
          <div className="fleet-stat-icon-wrap" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
            <Car size={24} />
          </div>
          <div className="fleet-stat-content">
            <p className="fleet-stat-label">Your Vehicle</p>
            <p className="fleet-stat-value">{profile?.vehicle_number}</p>
          </div>
        </div>

        <div className="fleet-stat-card">
          <div className="fleet-stat-icon-wrap" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}>
            <DollarSign size={24} />
          </div>
          <div className="fleet-stat-content">
            <p className="fleet-stat-label">Total Earnings</p>
            <p className="fleet-stat-value">₹{totalEarnings.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="fleet-table-container mt-8" style={{ marginTop: 32 }}>
        <h3 style={{ padding: '20px 20px 0 20px', margin: 0 }}>Recent Completed Trips</h3>
        <table className="fleet-table">
          <thead>
            <tr>
              <th>Trip / Date</th>
              <th>Locations</th>
              <th>KM Driven</th>
              <th>Your Earnings</th>
            </tr>
          </thead>
          <tbody>
             {commissions.length === 0 ? <tr><td colSpan={4} style={{textAlign: 'center'}}>No trips completed yet.</td></tr> :
              commissions.slice(0, 5).map(c => (
                <tr key={c.id}>
                  <td>
                    <strong>{c.booking_details?.trip_no}</strong><br/>
                    <small style={{ color: '#94a3b8' }}>{c.booking_details?.pickup_date}</small>
                  </td>
                  <td>
                    {c.booking_details?.pickup_location} → {c.booking_details?.drop_location}
                  </td>
                  <td>{c.booking_details?.trip?.total_km || '—'} km</td>
                  <td style={{ color: '#22c55e', fontWeight: 600 }}>₹{c.car_amount}</td>
                </tr>
              ))
             }
          </tbody>
        </table>
      </div>
    </div>
  );
}

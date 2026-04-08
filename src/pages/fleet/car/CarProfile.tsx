/**
 * Car Owner Profile View.
 * Displays vehicle documents (RC, Insurance) and profile data.
 */
import { useEffect, useState } from 'react';
import { carApi } from '@/api/fleetApi';
import type { Car as Vehicle } from '@/types/fleet';
import { Car, User, Image as ImageIcon, FileText } from 'lucide-react';

export default function CarProfile() {
  const [profile, setProfile] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carApi.profile().then(res => {
      setProfile(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div style={{textAlign: 'center', marginTop: 40}}>Loading Profile...</div>;

  return (
    <div>
      <div className="fleet-page-header">
        <div>
          <h1 className="fleet-page-title">Vehicle Profile</h1>
          <p className="fleet-page-subtitle">Manage your car documents and details.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: 24 }}>
        {/* Left Col - Card */}
        <div className="fleet-stat-card" style={{ flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          {profile?.car_photo ? (
            <img src={profile.car_photo} alt="Car" style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', marginBottom: 16 }} />
          ) : (
            <div className="fleet-stat-icon-wrap" style={{ width: 100, height: 100, background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', marginBottom: 16 }}>
              <Car size={48} />
            </div>
          )}
          <h2 style={{ margin: '0 0 4px 0' }}>{profile?.vehicle_number}</h2>
          <p style={{ color: '#94a3b8', margin: 0 }}>ID: {profile?.vehicle_id}</p>
          <div className="fleet-badge confirmed" style={{ marginTop: 12 }}>Active Status</div>
        </div>

        {/* Right Col - Details */}
        <div className="fleet-table-container" style={{ padding: 24 }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 0 }}><User size={20} color="#f59e0b" /> Owner Details</h3>
          <div className="fleet-form-grid" style={{ marginBottom: 32 }}>
             <div><label style={{color:'#94a3b8', fontSize:'0.85rem'}}>Owner Name</label><p style={{margin:'4px 0 0 0', fontWeight:500}}>{profile?.owner_name}</p></div>
             <div><label style={{color:'#94a3b8', fontSize:'0.85rem'}}>Mobile</label><p style={{margin:'4px 0 0 0', fontWeight:500}}>{profile?.mobile_number}</p></div>
          </div>

          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, borderTop: '1px solid #2a2a4a', paddingTop: 24 }}><FileText size={20} color="#f59e0b" /> Required Documents</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <li style={{ display: 'flex', justifyContent: 'space-between', padding: 12, background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
               <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><ImageIcon size={16}/> RC Document</span>
               {profile?.rc_document ? <a href={profile.rc_document} target="_blank" style={{color: '#3b82f6'}}>View</a> : <span style={{color:'#ef4444'}}>Missing</span>}
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', padding: 12, background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
               <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><ImageIcon size={16}/> Insurance</span>
               {profile?.insurance_document ? <a href={profile.insurance_document} target="_blank" style={{color: '#3b82f6'}}>View</a> : <span style={{color:'#ef4444'}}>Missing</span>}
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', padding: 12, background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
               <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><ImageIcon size={16}/> Permit Document</span>
               {profile?.permit_document ? <a href={profile.permit_document} target="_blank" style={{color: '#3b82f6'}}>View</a> : <span style={{color:'#ef4444'}}>Missing</span>}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

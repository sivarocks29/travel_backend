import { useEffect, useState } from 'react';
import { vehicleApi } from '@/api/fleetApi';
import { RefreshCw, Plus, X } from 'lucide-react';

export default function ManageVehicles() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    vehicle_number: '', owner_name: '', mobile_number: '', username: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      // Note: vehicleApi.list must be used here
      // But we should check how vehicleApi is imported/exported in fleetApi.ts
      const res = await vehicleApi.list();
      setVehicles(res.data.results || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await vehicleApi.create({
        ...formData,
        username: formData.username || `car_${formData.vehicle_number.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      });
      setShowModal(false);
      setFormData({ vehicle_number: '', owner_name: '', mobile_number: '', username: '' });
      load();
    } catch (e) {
      console.error("Failed to create vehicle", e);
      alert("Failed to create vehicle. Please check your inputs.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="fleet-page-header">
        <div>
          <h1 className="fleet-page-title">Manage Vehicles</h1>
          <p className="fleet-page-subtitle">View and manage vehicles in your fleet.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="fleet-btn fleet-btn-secondary" onClick={load}>
            <RefreshCw size={16} /> Refresh
          </button>
          <button className="fleet-btn fleet-btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Add Vehicle
          </button>
        </div>
      </div>

      <div className="fleet-table-container">
        <table className="fleet-table">
          <thead>
            <tr>
              <th>Vehicle ID</th>
              <th>Vehicle Number</th>
              <th>Owner Name</th>
              <th>Mobile</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
             {loading ? <tr><td colSpan={5} style={{ textAlign: 'center' }}>Loading...</td></tr> :
              vehicles.map(v => (
                <tr key={v.id}>
                  <td><strong>{v.vehicle_id}</strong></td>
                  <td>{v.vehicle_number}</td>
                  <td>{v.owner_name}</td>
                  <td>{v.mobile_number}</td>
                  <td>
                    {v.is_available ? (
                      <span className="fleet-badge completed">Available</span>
                    ) : (
                      <span className="fleet-badge cancelled">Unavailable</span>
                    )}
                  </td>
                </tr>
              ))}
             {(!loading && vehicles.length === 0) && <tr><td colSpan={5} style={{ textAlign: 'center' }}>No vehicles registered.</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{
          position: 'fixed', inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="fleet-login-card" style={{ maxWidth: 440, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid #22c55e44', paddingBottom: 16 }}>
              <h3 style={{ margin: 0, color: '#22c55e', fontSize: '1.2rem' }}>Add New Vehicle</h3>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4, lineHeight: 0 }}
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div className="fleet-input-group">
                <label style={{ color: '#22c55e' }}>Vehicle Number <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="text" required className="fleet-input"
                  placeholder="KA-01-AB-1234"
                  value={formData.vehicle_number} onChange={e => setFormData({ ...formData, vehicle_number: e.target.value })}
                />
              </div>

              <div className="fleet-input-group">
                <label style={{ color: '#22c55e' }}>Owner Name <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="text" required className="fleet-input"
                  placeholder="Jane Doe"
                  value={formData.owner_name} onChange={e => setFormData({ ...formData, owner_name: e.target.value })}
                />
              </div>

              <div className="fleet-input-group">
                <label style={{ color: '#22c55e' }}>Mobile Number <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="text" required className="fleet-input"
                  placeholder="9876543210"
                  value={formData.mobile_number} onChange={e => setFormData({ ...formData, mobile_number: e.target.value })}
                />
              </div>

              <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button type="button" className="fleet-btn fleet-btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="fleet-btn fleet-btn-primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { customerApi } from '@/api/fleetApi';
import { RefreshCw, Plus, X } from 'lucide-react';

export default function ManageCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '', mobile_number: '', email: '', address: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await customerApi.list();
      setCustomers(res.data.results || []);
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
      await customerApi.create(formData);
      setShowModal(false);
      setFormData({ name: '', mobile_number: '', email: '', address: '' });
      load();
    } catch (e) {
      console.error("Failed to create customer", e);
      alert("Failed to create customer. Please check your inputs.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="fleet-page-header">
        <div>
          <h1 className="fleet-page-title">Manage Customers</h1>
          <p className="fleet-page-subtitle">View and manage customers in your system.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="fleet-btn fleet-btn-secondary" onClick={load}>
            <RefreshCw size={16} /> Refresh
          </button>
          <button className="fleet-btn fleet-btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Add Customer
          </button>
        </div>
      </div>

      <div className="fleet-table-container">
        <table className="fleet-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Mobile</th>
              <th>Email</th>
              <th>Total Bookings</th>
              <th>Address</th>
            </tr>
          </thead>
          <tbody>
             {loading ? <tr><td colSpan={6} style={{ textAlign: 'center' }}>Loading...</td></tr> :
              customers.map(c => (
                <tr key={c.id}>
                  <td><small>{c.customer_id}</small></td>
                  <td><strong>{c.name}</strong></td>
                  <td>{c.mobile_number}</td>
                  <td>{c.email || '—'}</td>
                  <td><span className="fleet-badge completed">{c.total_bookings}</span></td>
                  <td>{c.address || '—'}</td>
                </tr>
              ))}
             {(!loading && customers.length === 0) && <tr><td colSpan={6} style={{ textAlign: 'center' }}>No customers registered.</td></tr>}
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
              <h3 style={{ margin: 0, color: '#22c55e', fontSize: '1.2rem' }}>Add New Customer</h3>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4, lineHeight: 0 }}
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div className="fleet-input-group">
                <label style={{ color: '#22c55e' }}>Full Name <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="text" required className="fleet-input"
                  placeholder="John Doe"
                  value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
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

              <div className="fleet-input-group">
                <label style={{ color: '#22c55e' }}>Email</label>
                <input
                  type="email" className="fleet-input"
                  placeholder="john@example.com"
                  value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="fleet-input-group">
                <label style={{ color: '#22c55e' }}>Address</label>
                <input
                  type="text" className="fleet-input"
                  placeholder="123 Main Street, City"
                  value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button type="button" className="fleet-btn fleet-btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="fleet-btn fleet-btn-primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


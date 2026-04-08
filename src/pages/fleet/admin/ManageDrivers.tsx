/**
 * Manage Drivers Page
 * View active, inactive, and offline/online drivers, add new drivers, toggle attendance,
 * and view login/logout logs per driver.
 */
import { useEffect, useState } from 'react';
import { adminApi, driverApi } from '@/api/fleetApi';
import type { DriverList, DriverLoginLog } from '@/types/fleet';
import { UserCheck, RefreshCw, UserPlus, ClipboardList, X, LogIn, LogOut, Clock } from 'lucide-react';

export default function ManageDrivers() {
  const [drivers, setDrivers] = useState<DriverList[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [driverForm, setDriverForm] = useState({
    name: '', age: '', license_number: '', mobile_number: '', address: ''
  });

  // Logs modal state
  const [logsModalOpen, setLogsModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<DriverList | null>(null);
  const [logs, setLogs] = useState<DriverLoginLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminApi.listDrivers();
      setDrivers(res.data.results || []);
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreateDriver = async () => {
    try {
      await driverApi.create(driverForm);
      setCreateModalOpen(false);
      setDriverForm({ name: '', age: '', license_number: '', mobile_number: '', address: '' });
      load();
    } catch (e) {
      alert("Failed to register driver.");
    }
  };

  const handleToggleAttendance = async (id: string, is_logged_in: boolean) => {
    try {
      await driverApi.toggleAttendance(id, is_logged_in);
      load();
    } catch (e) {
      alert("Failed to update status.");
    }
  };

  const handleViewLogs = async (driver: DriverList) => {
    setSelectedDriver(driver);
    setLogsModalOpen(true);
    setLogsLoading(true);
    setLogs([]);
    try {
      const res = await driverApi.logs({ driver_id: driver.id });
      setLogs(res.data.results || res.data || []);
    } catch {
      setLogs([]);
    } finally {
      setLogsLoading(false);
    }
  };

  const closeLogs = () => {
    setLogsModalOpen(false);
    setSelectedDriver(null);
    setLogs([]);
  };

  const formatDT = (dt?: string) =>
    dt ? new Date(dt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

  const calcDuration = (login?: string, logout?: string) => {
    if (!login || !logout) return null;
    const ms = new Date(logout).getTime() - new Date(login).getTime();
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <div>
      <div className="fleet-page-header">
        <div>
          <h1 className="fleet-page-title">Manage Drivers</h1>
          <p className="fleet-page-subtitle">View and manage driver accounts in your fleet.</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="fleet-btn fleet-btn-secondary" onClick={load}>
            <RefreshCw size={16} /> Refresh
          </button>
          <button className="fleet-btn fleet-btn-primary" onClick={() => setCreateModalOpen(true)}>
            <UserPlus size={16} /> Add Driver
          </button>
        </div>
      </div>

      <div className="fleet-table-container">
        <table className="fleet-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Age</th>
              <th>License</th>
              <th>Phone</th>
              <th>Login Status</th>
              <th>Last Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={8} style={{ textAlign: 'center' }}>Loading...</td></tr> :
              drivers.map(d => (
                <tr key={d.id}>
                  <td><small>{d.id.slice(0, 8)}</small></td>
                  <td>
                    <strong>{d.name || d.username}</strong>
                    {d.name && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{d.username}</div>}
                  </td>
                  <td>{d.age ?? '—'}</td>
                  <td>{d.license_number}</td>
                  <td>{d.mobile_number}</td>
                  <td>
                    {d.is_logged_in ? (
                      <span className="fleet-badge completed"><UserCheck size={12} style={{marginRight: 4}}/>Online</span>
                    ) : (
                      <span className="fleet-badge cancelled">Offline</span>
                    )}
                  </td>
                  <td>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      In: {d.last_login_at ? new Date(d.last_login_at).toLocaleString() : '-'}<br/>
                      Out: {d.last_logout_at ? new Date(d.last_logout_at).toLocaleString() : '-'}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <button
                        className="fleet-btn fleet-btn-secondary"
                        style={{ padding: '4px 8px', fontSize: '0.8rem', color: d.is_logged_in ? '#ef4444' : '#22c55e', borderColor: d.is_logged_in ? '#ef4444' : '#22c55e' }}
                        onClick={() => handleToggleAttendance(d.id, !d.is_logged_in)}
                      >
                        {d.is_logged_in ? 'Log Out' : 'Log In'}
                      </button>
                      <button
                        className="fleet-btn fleet-btn-secondary"
                        style={{ padding: '4px 8px', fontSize: '0.8rem', color: '#f59e0b', borderColor: '#f59e0b', display: 'flex', alignItems: 'center', gap: 4 }}
                        title="View Login/Logout Logs"
                        onClick={() => handleViewLogs(d)}
                      >
                        <ClipboardList size={14} /> Logs
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            {drivers.length === 0 && !loading && <tr><td colSpan={8} style={{ textAlign: 'center' }}>No drivers registered.</td></tr>}
          </tbody>
        </table>
      </div>

      {/* ── Driver Logs Modal ──────────────────────────────────────────── */}
      {logsModalOpen && selectedDriver && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)',
          zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
        }}>
          <div className="fleet-login-card" style={{ maxWidth: 640, width: '100%', maxHeight: '85vh', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ margin: 0, color: '#f59e0b', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ClipboardList size={18} /> Login / Logout Logs
                </h3>
                <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>
                  {selectedDriver.name || selectedDriver.username} &nbsp;·&nbsp; {selectedDriver.license_number}
                  <span style={{ marginLeft: 8 }} className={`fleet-badge ${selectedDriver.is_logged_in ? 'completed' : 'cancelled'}`}>
                    {selectedDriver.is_logged_in ? '● Online' : '● Offline'}
                  </span>
                </p>
              </div>
              <button
                onClick={closeLogs}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4 }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div style={{ overflowY: 'auto', flex: 1, padding: '16px 24px' }}>
              {logsLoading ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
                  <Clock size={32} style={{ opacity: 0.4, display: 'block', margin: '0 auto 12px' }} />
                  Loading logs...
                </div>
              ) : logs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
                  <ClipboardList size={32} style={{ opacity: 0.3, display: 'block', margin: '0 auto 12px' }} />
                  No login/logout records found for this driver.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {logs.map((log, idx) => {
                    const duration = calcDuration(log.login_at, log.logout_at);
                    const isActive = log.login_at && !log.logout_at;
                    return (
                      <div key={log.id} style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: `1px solid ${isActive ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.08)'}`,
                        borderRadius: 10,
                        padding: '14px 18px',
                        display: 'grid',
                        gridTemplateColumns: '28px 1fr 1fr auto',
                        alignItems: 'center',
                        gap: 12,
                      }}>
                        {/* Session number */}
                        <div style={{ color: '#475569', fontSize: '0.75rem', fontWeight: 600 }}>
                          #{logs.length - idx}
                        </div>

                        {/* Login */}
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#22c55e', fontSize: '0.78rem', fontWeight: 600, marginBottom: 2 }}>
                            <LogIn size={13} /> Login
                          </div>
                          <div style={{ color: '#e2e8f0', fontSize: '0.85rem' }}>
                            {formatDT(log.login_at)}
                          </div>
                        </div>

                        {/* Logout */}
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#ef4444', fontSize: '0.78rem', fontWeight: 600, marginBottom: 2 }}>
                            <LogOut size={13} /> Logout
                          </div>
                          <div style={{ color: log.logout_at ? '#e2e8f0' : '#64748b', fontSize: '0.85rem', fontStyle: log.logout_at ? 'normal' : 'italic' }}>
                            {log.logout_at ? formatDT(log.logout_at) : (isActive ? 'Still active' : '—')}
                          </div>
                        </div>

                        {/* Duration / Badge */}
                        <div style={{ textAlign: 'right' }}>
                          {isActive ? (
                            <span className="fleet-badge completed" style={{ fontSize: '0.72rem' }}>● Live</span>
                          ) : duration ? (
                            <span style={{ color: '#f59e0b', fontSize: '0.8rem', fontWeight: 600, background: 'rgba(245,158,11,0.1)', padding: '3px 8px', borderRadius: 6 }}>
                              <Clock size={11} style={{ verticalAlign: 'middle', marginRight: 3 }} />{duration}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: '14px 24px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#64748b', fontSize: '0.82rem' }}>
                {logsLoading ? '...' : `${logs.length} session${logs.length !== 1 ? 's' : ''} recorded`}
              </span>
              <button className="fleet-btn fleet-btn-secondary" onClick={closeLogs}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Create Driver Modal ─────────────────────────────────────────── */}
      {createModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="fleet-login-card" style={{ maxWidth: 500, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginTop: 0, borderBottom: '1px solid #ffffffff', paddingBottom: 16, color: '#22c55e' }}>Register New Driver</h3>

            <div className="fleet-input-group">
              <label style={{ color: '#22c55e' }}>Driver Name</label>
              <input type="text" className="fleet-input" value={driverForm.name} onChange={e => setDriverForm({ ...driverForm, name: e.target.value })} placeholder="Ramesh Kumar" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="fleet-input-group">
                <label style={{ color: '#22c55e' }}>Age</label>
                <input type="number" className="fleet-input" min="18" max="65" value={driverForm.age} onChange={e => setDriverForm({ ...driverForm, age: e.target.value })} placeholder="30" />
              </div>
              <div className="fleet-input-group">
                <label style={{ color: '#22c55e' }}>Mobile Number</label>
                <input type="text" className="fleet-input" value={driverForm.mobile_number} onChange={e => setDriverForm({ ...driverForm, mobile_number: e.target.value })} placeholder="9988776655" />
              </div>
            </div>

            <div className="fleet-input-group">
              <label style={{ color: '#22c55e' }}>License Number</label>
              <input type="text" className="fleet-input" value={driverForm.license_number} onChange={e => setDriverForm({ ...driverForm, license_number: e.target.value })} placeholder="DL12345678" />
              <small style={{ color: '#64748b', marginTop: 4, display: 'block' }}>Login username will be auto-set to: driver_{driverForm.license_number.toLowerCase() || 'license'}</small>
            </div>

            <div className="fleet-input-group">
              <label style={{ color: '#22c55e' }}>Address</label>
              <input type="text" className="fleet-input" value={driverForm.address} onChange={e => setDriverForm({ ...driverForm, address: e.target.value })} placeholder="123 Local Street" />
            </div>

            <p style={{ color: '#64748b', fontSize: '0.82rem', marginTop: 8 }}>🔑 Default login password: <code>changeme123</code> (driver can change later)</p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
              <button className="fleet-btn fleet-btn-secondary" onClick={() => setCreateModalOpen(false)}>Cancel</button>
              <button className="fleet-btn fleet-btn-primary" onClick={handleCreateDriver} disabled={!driverForm.license_number || !driverForm.mobile_number}>Register</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

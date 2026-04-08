/**
 * Admin Bookings List.
 * Allows viewing all bookings, filtering, assigning drivers/cars,
 * and viewing full booking details by clicking a row.
 */
import { useEffect, useState } from 'react';
import { adminApi, customerApi, vehicleApi, bookingApi } from '@/api/fleetApi';
import type { AdminBookingListResponse } from '@/api/fleetApi';
import type { DriverList, CarList } from '@/types/fleet';
import {
  RefreshCw, UserPlus, FileText, Search, X,
  MapPin, Clock, User, Car, Phone, CreditCard,
  Calendar, Star, Hash, ArrowRight, Loader2
} from 'lucide-react';

// ── Status colour map ─────────────────────────────────────────────────────────
const STATUS_COLOR: Record<string, { bg: string; text: string; border: string }> = {
  pending:   { bg: 'rgba(234,179,8,0.12)',   text: '#eab308', border: 'rgba(234,179,8,0.3)' },
  confirmed: { bg: 'rgba(59,130,246,0.12)',  text: '#60a5fa', border: 'rgba(59,130,246,0.3)' },
  ongoing:   { bg: 'rgba(168,85,247,0.12)',  text: '#c084fc', border: 'rgba(168,85,247,0.3)' },
  completed: { bg: 'rgba(34,197,94,0.12)',   text: '#22c55e', border: 'rgba(34,197,94,0.3)' },
  cancelled: { bg: 'rgba(239,68,68,0.12)',   text: '#ef4444', border: 'rgba(239,68,68,0.3)' },
};

const fmt = (dt?: string) =>
  dt ? new Date(dt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

const fmtDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const fmtTime = (t?: string) => {
  if (!t) return '—';
  const [h, m] = t.split(':');
  const hour = parseInt(h);
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
};

// ── InfoRow helper ────────────────────────────────────────────────────────────
const InfoRow = ({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value?: React.ReactNode; accent?: string }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
    <span style={{ color: accent || '#64748b', marginTop: 1, flexShrink: 0 }}>{icon}</span>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: '0.72rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>{label}</div>
      <div style={{ color: '#e2e8f0', fontSize: '0.9rem', fontWeight: 500 }}>{value || '—'}</div>
    </div>
  </div>
);

// ── Section header ────────────────────────────────────────────────────────────
const SectionHeader = ({ icon, title, color }: { icon: React.ReactNode; title: string; color: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '20px 0 4px', padding: '0 0 8px', borderBottom: `2px solid ${color}33` }}>
    <span style={{ color }}>{icon}</span>
    <span style={{ color, fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{title}</span>
  </div>
);

export default function Bookings() {
  const [data, setData] = useState<AdminBookingListResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Detail modal
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailBooking, setDetailBooking] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Assign modal
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const [drivers, setDrivers] = useState<DriverList[]>([]);
  const [cars, setCars] = useState<CarList[]>([]);
  const [assignForm, setAssignForm] = useState({ driver_id: '', vehicle_id: '' });

  // Create Booking state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [isExistingCustomer, setIsExistingCustomer] = useState(false);
  const [customerId, setCustomerId] = useState('');
  const [customerLookupLoading, setCustomerLookupLoading] = useState(false);
  const [customerLookupError, setCustomerLookupError] = useState('');
  const [bookingForm, setBookingForm] = useState({
    customer_name: '', customer_phone: '',
    pickup_location: '', drop_location: '',
    pickup_date: '', pickup_time: ''
  });

  const loadBookings = async () => {
    setLoading(true);
    try {
      const res = await adminApi.listBookings();
      setData(res.data);
    } catch { } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBookings(); }, []);

  // ── Open booking detail ──────────────────────────────────────────────────────
  const openDetail = async (bookingId: string) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailBooking(null);
    try {
      const res = await bookingApi.get(bookingId);
      setDetailBooking(res.data);
    } catch {
      setDetailBooking(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const openAssign = async (e: React.MouseEvent, bookingId: string) => {
    e.stopPropagation(); // don't open detail
    setSelectedBooking(bookingId);
    setAssignModalOpen(true);
    try {
      const [dRes, cRes] = await Promise.all([
        adminApi.listDrivers(),
        vehicleApi.dropdown()
      ]);
      setDrivers(dRes.data.results || dRes.data || []);
      setCars(Array.isArray(cRes.data) ? cRes.data : (cRes.data.results || []));
    } catch { }
  };

  const handleCustomerLookup = async () => {
    if (!customerId.trim()) return;
    setCustomerLookupLoading(true);
    setCustomerLookupError('');
    try {
      const res = await customerApi.autofill(customerId.trim());
      const c = res.data;
      setBookingForm(prev => ({ ...prev, customer_name: c.name || '', customer_phone: c.mobile_number || '' }));
    } catch {
      setCustomerLookupError('Customer not found. Check the ID and try again.');
      setBookingForm(prev => ({ ...prev, customer_name: '', customer_phone: '' }));
    } finally {
      setCustomerLookupLoading(false);
    }
  };

  const resetCreateModal = () => {
    setCreateModalOpen(false);
    setIsExistingCustomer(false);
    setCustomerId('');
    setCustomerLookupError('');
    setBookingForm({ customer_name: '', customer_phone: '', pickup_location: '', drop_location: '', pickup_date: '', pickup_time: '' });
  };

  const handleCreateBooking = async () => {
    try {
      await adminApi.createBooking({
        customer_details: { name: bookingForm.customer_name, phone: bookingForm.customer_phone },
        pickup_location: bookingForm.pickup_location,
        drop_location: bookingForm.drop_location || '',
        pickup_date: bookingForm.pickup_date,
        pickup_time: bookingForm.pickup_time,
        status: 'pending'
      });
      resetCreateModal();
      loadBookings();
    } catch {
      alert("Failed to create booking.");
    }
  };

  const handleAssign = async () => {
    if (!selectedBooking) return;
    try {
      await adminApi.assignBooking(selectedBooking, {
        driver: assignForm.driver_id,
        vehicle: assignForm.vehicle_id,
        status: 'confirmed'
      });
      setAssignModalOpen(false);
      loadBookings();
      setAssignForm({ driver_id: '', vehicle_id: '' });
      // Refresh detail if it's the same booking
      if (detailBooking?.id === selectedBooking) openDetail(selectedBooking);
    } catch {
      alert("Failed to assign.");
    }
  };

  const getStatusBadge = (status: string) => {
    const s = STATUS_COLOR[status] || { bg: '#1e293b', text: '#94a3b8', border: '#334155' };
    return (
      <span style={{
        background: s.bg, color: s.text, border: `1px solid ${s.border}`,
        borderRadius: 20, padding: '3px 10px', fontSize: '0.75rem', fontWeight: 600,
        textTransform: 'capitalize', display: 'inline-block'
      }}>
        {status}
      </span>
    );
  };

  // ── Detail modal ─────────────────────────────────────────────────────────────
  const b = detailBooking;
  const bStatus = b ? STATUS_COLOR[b.status] || STATUS_COLOR.pending : null;

  return (
    <div>
      <div className="fleet-page-header">
        <div>
          <h1 className="fleet-page-title">Manage Bookings</h1>
          <p className="fleet-page-subtitle">Click any booking row to view full details.</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="fleet-btn fleet-btn-secondary" onClick={loadBookings}>
            <RefreshCw size={16} /> Refresh
          </button>
          <button className="fleet-btn fleet-btn-primary" onClick={() => setCreateModalOpen(true)}>
            <FileText size={16} /> New Booking
          </button>
        </div>
      </div>

      <div className="fleet-table-container">
        <table className="fleet-table">
          <thead>
            <tr>
              <th>Trip No</th>
              <th>Customer</th>
              <th>Pickup</th>
              <th>Status</th>
              <th>Driver / Car</th>
              <th>Fare</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={7} style={{ textAlign: 'center' }}>Loading...</td></tr> :
              data?.results.map((bk: any) => (
                <tr
                  key={bk.id}
                  onClick={() => openDetail(bk.id)}
                  style={{ cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}
                >
                  <td><strong>{bk.trip_no}</strong></td>
                  <td>{bk.customer_detail?.name || bk.customer_details?.name || '-'}</td>
                  <td>
                    {bk.pickup_date} {bk.pickup_time && fmtTime(bk.pickup_time)}<br />
                    <small style={{ color: '#94a3b8' }}>{bk.pickup_location}</small>
                  </td>
                  <td>{getStatusBadge(bk.status)}</td>
                  <td>
                    {bk.driver_detail ? (
                      <div>
                        <div style={{ color: '#22c55e', fontWeight: 600 }}>
                          {bk.driver_detail.name || bk.driver_detail.username}
                        </div>
                        <small style={{ color: '#94a3b8' }}>
                          {bk.driver_detail.license_number}
                        </small>
                        {bk.vehicle_detail && (
                          <div style={{ color: '#60a5fa', fontSize: '0.8rem', marginTop: 2 }}>
                            🚗 {bk.vehicle_detail.vehicle_number}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span style={{ color: '#eab308' }}>Not Assigned</span>
                    )}
                  </td>
                  <td>
                    <strong style={{ color: '#22c55e' }}>
                      {bk.fare ? `₹${Number(bk.fare).toLocaleString('en-IN')}` : '—'}
                    </strong>
                  </td>
                  <td>
                    {!bk.driver && (
                      <button
                        className="fleet-btn fleet-btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        onClick={(e) => openAssign(e, bk.id)}
                      >
                        <UserPlus size={14} /> Assign
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            {data?.results.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center' }}>No bookings found.</td></tr>}
          </tbody>
        </table>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          BOOKING DETAIL MODAL
      ══════════════════════════════════════════════════════════════════ */}
      {detailOpen && (
        <div
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}
          onClick={() => setDetailOpen(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 480, height: '100%',
              background: '#0f172a', borderLeft: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', flexDirection: 'column', overflow: 'hidden',
              animation: 'slideIn 0.2s ease',
            }}
          >
            {/* ── Top bar ── */}
            <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Hash size={18} style={{ color: '#60a5fa' }} />
                <span style={{ fontWeight: 700, fontSize: '1rem', color: '#e2e8f0' }}>
                  {detailLoading ? 'Loading…' : (b?.trip_no || 'Booking Details')}
                </span>
                {b && getStatusBadge(b.status)}
              </div>
              <button onClick={() => setDetailOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 4 }}>
                <X size={20} />
              </button>
            </div>

            {/* ── Body ── */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 24px' }}>
              {detailLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300, gap: 12, color: '#64748b' }}>
                  <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', opacity: 0.5 }} />
                  Fetching booking details…
                </div>
              ) : !b ? (
                <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>Failed to load booking details.</div>
              ) : (
                <>
                  {/* Status banner */}
                  {bStatus && (
                    <div style={{
                      background: bStatus.bg, border: `1px solid ${bStatus.border}`,
                      borderRadius: 10, padding: '12px 16px', margin: '16px 0',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                      <span style={{ color: bStatus.text, fontWeight: 700, fontSize: '0.9rem', textTransform: 'capitalize' }}>
                        {b.status} Trip
                      </span>
                      <span style={{ color: '#64748b', fontSize: '0.78rem' }}>Created {fmt(b.created_at)}</span>
                    </div>
                  )}

                  {/* ── Trip Info ── */}
                  <SectionHeader icon={<Hash size={14} />} title="Trip Info" color="#60a5fa" />
                  <InfoRow icon={<Hash size={15} />} label="Trip Number" value={<strong style={{ color: '#60a5fa' }}>{b.trip_no}</strong>} accent="#60a5fa" />
                  <InfoRow icon={<Calendar size={15} />} label="Booking Date" value={fmtDate(b.booking_date)} accent="#60a5fa" />
                  <InfoRow icon={<CreditCard size={15} />} label="Trip Type" value={<span style={{ textTransform: 'capitalize' }}>{b.type_of_trip?.replace('_', ' ') || '—'}</span>} accent="#60a5fa" />
                  {b.fare && (
                    <InfoRow icon={<span style={{ fontWeight: 800, fontSize: '0.9rem' }}>₹</span>} label="Fare" value={<strong style={{ color: '#22c55e', fontSize: '1rem' }}>₹{Number(b.fare).toLocaleString('en-IN')}</strong>} accent="#22c55e" />
                  )}
                  {b.waiting_hours > 0 && (
                    <InfoRow icon={<Clock size={15} />} label="Waiting Hours" value={`${b.waiting_hours} hr`} accent="#f59e0b" />
                  )}

                  {/* ── Schedule ── */}
                  <SectionHeader icon={<Calendar size={14} />} title="Schedule" color="#f59e0b" />
                  <InfoRow icon={<Calendar size={15} />} label="Pickup Date" value={fmtDate(b.pickup_date)} accent="#f59e0b" />
                  <InfoRow icon={<Clock size={15} />} label="Pickup Time" value={fmtTime(b.pickup_time)} accent="#f59e0b" />
                  {b.drop_date && <InfoRow icon={<Calendar size={15} />} label="Drop Date" value={fmtDate(b.drop_date)} accent="#f59e0b" />}
                  {b.drop_time && <InfoRow icon={<Clock size={15} />} label="Drop Time" value={fmtTime(b.drop_time)} accent="#f59e0b" />}

                  {/* ── Route ── */}
                  <SectionHeader icon={<MapPin size={14} />} title="Route" color="#a78bfa" />
                  <InfoRow
                    icon={<MapPin size={15} />}
                    label="Pickup Location"
                    value={b.pickup_location}
                    accent="#22c55e"
                  />
                  {b.drop_location && (
                    <InfoRow
                      icon={<ArrowRight size={15} />}
                      label="Drop Location"
                      value={b.drop_location}
                      accent="#ef4444"
                    />
                  )}

                  {/* ── Customer ── */}
                  <SectionHeader icon={<User size={14} />} title="Customer" color="#22c55e" />
                  {b.customer_detail ? (
                    <>
                      <InfoRow icon={<User size={15} />} label="Name" value={b.customer_detail.name} accent="#22c55e" />
                      <InfoRow icon={<Phone size={15} />} label="Phone" value={b.customer_detail.mobile_number} accent="#22c55e" />
                      {b.customer_detail.email && <InfoRow icon={<span>@</span>} label="Email" value={b.customer_detail.email} accent="#22c55e" />}
                      {b.customer_detail.customer_id && <InfoRow icon={<Hash size={15} />} label="Customer ID" value={b.customer_detail.customer_id} accent="#22c55e" />}
                      {b.customer_detail.address && <InfoRow icon={<MapPin size={15} />} label="Address" value={b.customer_detail.address} accent="#22c55e" />}
                      {b.is_new_customer && (
                        <div style={{ fontSize: '0.78rem', color: '#eab308', marginTop: 4 }}>⭐ New customer</div>
                      )}
                    </>
                  ) : (
                    <div style={{ color: '#64748b', padding: '10px 0', fontSize: '0.85rem' }}>No customer details available.</div>
                  )}

                  {/* ── Driver ── */}
                  <SectionHeader icon={<User size={14} />} title="Driver" color="#f59e0b" />
                  {b.driver_detail ? (
                    <>
                      <InfoRow icon={<User size={15} />} label="Name" value={
                        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {b.driver_detail.name || b.driver_detail.username}
                          <span style={{ fontSize: '0.72rem', background: b.driver_detail.is_logged_in ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.1)', color: b.driver_detail.is_logged_in ? '#22c55e' : '#ef4444', padding: '2px 7px', borderRadius: 99 }}>
                            {b.driver_detail.is_logged_in ? '● Online' : '○ Offline'}
                          </span>
                        </span>
                      } accent="#f59e0b" />
                      <InfoRow icon={<CreditCard size={15} />} label="License Number" value={b.driver_detail.license_number} accent="#f59e0b" />
                      <InfoRow icon={<Phone size={15} />} label="Phone" value={b.driver_detail.mobile_number} accent="#f59e0b" />
                      {b.driver_detail.last_login_at && (
                        <InfoRow icon={<Clock size={15} />} label="Last Login" value={fmt(b.driver_detail.last_login_at)} accent="#f59e0b" />
                      )}
                      {b.driver_detail.last_logout_at && (
                        <InfoRow icon={<Clock size={15} />} label="Last Logout" value={fmt(b.driver_detail.last_logout_at)} accent="#f59e0b" />
                      )}
                    </>
                  ) : (
                    <div style={{ color: '#eab308', padding: '10px 0', fontSize: '0.85rem' }}>
                      ⚠ No driver assigned yet.
                      {b.status === 'pending' && (
                        <button
                          className="fleet-btn fleet-btn-primary"
                          style={{ marginLeft: 12, padding: '4px 12px', fontSize: '0.8rem' }}
                          onClick={() => { setDetailOpen(false); openAssign({ stopPropagation: () => {} } as any, b.id); }}
                        >
                          Assign Now
                        </button>
                      )}
                    </div>
                  )}

                  {/* ── Vehicle ── */}
                  {b.vehicle_detail && (
                    <>
                      <SectionHeader icon={<Car size={14} />} title="Vehicle" color="#60a5fa" />
                      <InfoRow icon={<Car size={15} />} label="Vehicle Number" value={b.vehicle_detail.vehicle_number} accent="#60a5fa" />
                      {b.vehicle_detail.owner_name && <InfoRow icon={<User size={15} />} label="Owner" value={b.vehicle_detail.owner_name} accent="#60a5fa" />}
                    </>
                  )}

                  {/* ── Rating / Review ── */}
                  {(b.rating || b.review) && (
                    <>
                      <SectionHeader icon={<Star size={14} />} title="Rating & Review" color="#eab308" />
                      {b.rating && (
                        <InfoRow icon={<Star size={15} />} label="Rating" value={
                          <span>{'★'.repeat(b.rating)}{'☆'.repeat(5 - b.rating)} <span style={{ color: '#64748b' }}>({b.rating}/5)</span></span>
                        } accent="#eab308" />
                      )}
                      {b.review && <InfoRow icon={<span>"</span>} label="Review" value={b.review} accent="#eab308" />}
                    </>
                  )}
                </>
              )}
            </div>

            {/* ── Footer ── */}
            {b && (
              <div style={{ padding: '14px 24px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                <span style={{ color: '#475569', fontSize: '0.78rem' }}>Updated {fmt(b?.updated_at)}</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  {!b?.driver && b?.status === 'pending' && (
                    <button
                      className="fleet-btn fleet-btn-primary"
                      style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                      onClick={() => { setDetailOpen(false); openAssign({ stopPropagation: () => {} } as any, b.id); }}
                    >
                      <UserPlus size={14} /> Assign
                    </button>
                  )}
                  <button className="fleet-btn fleet-btn-secondary" style={{ padding: '6px 14px', fontSize: '0.82rem' }} onClick={() => setDetailOpen(false)}>
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Create Booking Modal ── */}
      {createModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="fleet-login-card" style={{ maxWidth: 520, width: '100%', maxHeight: '92vh', overflowY: 'auto' }}>
            <h3 style={{ marginTop: 0, borderBottom: '1px solid #22c55e44', paddingBottom: 16, color: '#22c55e' }}>Create New Booking</h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, padding: '12px 16px', background: '#0f172a', borderRadius: 10, border: '1px solid #1e293b' }}>
              <input type="checkbox" id="existingCustomerToggle" checked={isExistingCustomer}
                onChange={e => { setIsExistingCustomer(e.target.checked); setCustomerId(''); setCustomerLookupError(''); if (!e.target.checked) setBookingForm(prev => ({ ...prev, customer_name: '', customer_phone: '' })); }}
                style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#22c55e' }}
              />
              <label htmlFor="existingCustomerToggle" style={{ color: '#cbd5e1', cursor: 'pointer', fontSize: '0.95rem' }}>
                Existing customer? (Enter Customer ID to auto-fill)
              </label>
            </div>

            {isExistingCustomer && (
              <div className="fleet-input-group">
                <label style={{ color: '#22c55e' }}>Customer ID</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input type="text" className="fleet-input" value={customerId}
                    onChange={e => { setCustomerId(e.target.value); setCustomerLookupError(''); }}
                    onKeyDown={e => e.key === 'Enter' && handleCustomerLookup()}
                    placeholder="e.g. CUST001" style={{ flex: 1 }}
                  />
                  <button className="fleet-btn fleet-btn-primary" style={{ padding: '0 16px', flexShrink: 0 }}
                    onClick={handleCustomerLookup} disabled={customerLookupLoading || !customerId.trim()}>
                    {customerLookupLoading ? '...' : <Search size={16} />}
                  </button>
                </div>
                {customerLookupError && <small style={{ color: '#ef4444', marginTop: 4, display: 'block' }}>{customerLookupError}</small>}
                {bookingForm.customer_name && !customerLookupError && (
                  <small style={{ color: '#22c55e', marginTop: 4, display: 'block' }}>✔ {bookingForm.customer_name} — {bookingForm.customer_phone}</small>
                )}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="fleet-input-group">
                <label style={{ color: '#22c55e' }}>Customer Name</label>
                <input type="text" className="fleet-input" value={bookingForm.customer_name}
                  onChange={e => setBookingForm({ ...bookingForm, customer_name: e.target.value })}
                  placeholder="John Doe" readOnly={isExistingCustomer && !!bookingForm.customer_name}
                  style={isExistingCustomer && bookingForm.customer_name ? { opacity: 0.7 } : {}}
                />
              </div>
              <div className="fleet-input-group">
                <label style={{ color: '#22c55e' }}>Customer Phone</label>
                <input type="text" className="fleet-input" value={bookingForm.customer_phone}
                  onChange={e => setBookingForm({ ...bookingForm, customer_phone: e.target.value })}
                  placeholder="9876543210" readOnly={isExistingCustomer && !!bookingForm.customer_phone}
                  style={isExistingCustomer && bookingForm.customer_phone ? { opacity: 0.7 } : {}}
                />
              </div>
            </div>

            <div className="fleet-input-group">
              <label style={{ color: '#22c55e' }}>Pickup Location</label>
              <input type="text" className="fleet-input" value={bookingForm.pickup_location}
                onChange={e => setBookingForm({ ...bookingForm, pickup_location: e.target.value })} placeholder="City Airport" />
            </div>
            <div className="fleet-input-group">
              <label style={{ color: '#22c55e' }}>Drop Location</label>
              <input type="text" className="fleet-input" value={bookingForm.drop_location}
                onChange={e => setBookingForm({ ...bookingForm, drop_location: e.target.value })} placeholder="Downtown Hotel" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="fleet-input-group">
                <label style={{ color: '#22c55e' }}>Pickup Date</label>
                <input type="date" className="fleet-input" value={bookingForm.pickup_date}
                  onChange={e => setBookingForm({ ...bookingForm, pickup_date: e.target.value })} />
              </div>
              <div className="fleet-input-group">
                <label style={{ color: '#22c55e' }}>Pickup Time</label>
                <input type="time" className="fleet-input" value={bookingForm.pickup_time}
                  onChange={e => setBookingForm({ ...bookingForm, pickup_time: e.target.value })} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
              <button className="fleet-btn fleet-btn-secondary" onClick={resetCreateModal}>Cancel</button>
              <button className="fleet-btn fleet-btn-primary" onClick={handleCreateBooking}
                disabled={!bookingForm.customer_name || !bookingForm.pickup_location || !bookingForm.pickup_date || !bookingForm.pickup_time}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Assign Driver & Car Modal ── */}
      {assignModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="fleet-login-card" style={{ maxWidth: 500 }}>
            <h3 style={{ marginTop: 0, borderBottom: '1px solid #334155', paddingBottom: 16 }}>Assign Driver & Car</h3>

            <div className="fleet-input-group">
              <label>Select Driver</label>
              <select className="fleet-select" value={assignForm.driver_id} onChange={e => setAssignForm({ ...assignForm, driver_id: e.target.value })}>
                <option value="">-- Choose Driver --</option>
                {drivers.map(d => <option key={d.id} value={d.id}>{d.is_logged_in ? '🟢' : '🔴'} {(d as any).name || d.username} ({d.license_number})</option>)}
              </select>
              {assignForm.driver_id && (() => {
                const sel = drivers.find(d => d.id === assignForm.driver_id);
                return sel ? <small style={{ color: '#22c55e', marginTop: 4, display: 'block' }}>✔ {(sel as any).name || sel.username} — {sel.is_logged_in ? 'Online 🟢' : 'Offline 🔴'}</small> : null;
              })()}
            </div>

            <div className="fleet-input-group">
              <label>Select Car</label>
              <select className="fleet-select" value={assignForm.vehicle_id} onChange={e => setAssignForm({ ...assignForm, vehicle_id: e.target.value })}>
                <option value="">-- Choose Car --</option>
                {cars.length === 0
                  ? <option disabled>No available cars</option>
                  : cars.map(c => <option key={c.id} value={c.id}>{c.vehicle_number} — {(c as any).owner_name || ''}</option>)}
              </select>
              {assignForm.vehicle_id && (() => {
                const sel = cars.find(c => c.id === assignForm.vehicle_id);
                return sel ? <small style={{ color: '#22c55e', marginTop: 4, display: 'block' }}>✔ {sel.vehicle_number}</small> : null;
              })()}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
              <button className="fleet-btn fleet-btn-secondary" onClick={() => setAssignModalOpen(false)}>Cancel</button>
              <button className="fleet-btn fleet-btn-primary" onClick={handleAssign} disabled={!assignForm.driver_id || !assignForm.vehicle_id}>Assign Trip</button>
            </div>
          </div>
        </div>
      )}

      {/* ── CSS for animations ── */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

/**
 * Driver Tasks Page
 * Allows drivers to view assigned trips, start trips (with start KM + photo), and end trips (with end KM).
 */
import { useEffect, useState } from 'react';
import { driverApiEndpoints as driverApi } from '@/api/fleetApi';
import { Play, Square, CheckCircle } from 'lucide-react';

export default function DriverTasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeModal, setActiveModal] = useState<'start' | 'end' | null>(null);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [kmInput, setKmInput] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await driverApi.tasks();
      setTasks(res.data.results || []);
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openStart = (id: string) => { setSelectedTask(id); setActiveModal('start'); setKmInput(''); setPhoto(null); };
  const openEnd = (id: string) => { setSelectedTask(id); setActiveModal('end'); setKmInput(''); setPhoto(null); };

  const handleStart = async () => {
    if (!selectedTask || !kmInput) return;
    try {
      await driverApi.startTrip(selectedTask, kmInput, photo || undefined);
      setActiveModal(null);
      load();
    } catch (e) {
      alert("Failed to start trip.");
    }
  };

  const handleEnd = async () => {
    if (!selectedTask || !kmInput) return;
    try {
      await driverApi.endTrip(selectedTask, kmInput);
      setActiveModal(null);
      load();
    } catch (e) {
      alert("Failed to end trip.");
    }
  };

  return (
    <div>
      <div className="fleet-page-header">
        <div>
          <h1 className="fleet-page-title">My Trip Tasks</h1>
          <p className="fleet-page-subtitle">View and execute your assigned bookings.</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {loading && <div style={{textAlign: 'center'}}>Loading tasks...</div>}
        {!loading && tasks.length === 0 && <div style={{textAlign: 'center', padding: 40, color: '#94a3b8'}}>No tasks assigned to you.</div>}
        
        {tasks.map(task => (
          <div key={task.id} className="fleet-stat-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', borderBottom: '1px solid #2a2a4a', paddingBottom: 16, marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: '0 0 4px 0', color: '#fff' }}>{task.booking_details?.pickup_location} → {task.booking_details?.drop_location}</h3>
                <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>
                  Trip No: {task.booking_details?.trip_no} • {task.booking_details?.pickup_date} {task.booking_details?.pickup_time}
                </p>
              </div>
              <div>
                <span className={`fleet-badge ${task.status}`}>{task.status}</span>
              </div>
            </div>

            <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div style={{ display: 'flex', gap: 32 }}>
                <div>
                  <p style={{ margin: '0 0 4px 0', color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase' }}>Customer</p>
                  <p style={{ margin: 0, fontWeight: 500 }}>{task.booking_details?.customer_details?.name} ({task.booking_details?.customer_details?.mobile_number})</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase' }}>Current KM Reading</p>
                  <p style={{ margin: 0, fontWeight: 500 }}>
                    Start: {task.start_km || '—'} / End: {task.end_km || '—'}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                {task.status === 'assigned' && (
                  <button className="fleet-btn fleet-btn-primary" onClick={() => openStart(task.id)}>
                    <Play size={16} /> Start Trip
                  </button>
                )}
                {task.status === 'started' && (
                  <button className="fleet-btn" style={{ background: '#ef4444', color: '#fff' }} onClick={() => openEnd(task.id)}>
                    <Square size={16} /> End Trip
                  </button>
                )}
                {task.status === 'completed' && (
                  <button className="fleet-btn fleet-btn-secondary" disabled>
                    <CheckCircle size={16} color="#22c55e" /> Completed
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {activeModal === 'start' && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="fleet-login-card" style={{ maxWidth: 400 }}>
            <h3 style={{ marginTop: 0, borderBottom: '1px solid #334155', paddingBottom: 16 }}>Start Trip</h3>
            <div className="fleet-input-group">
              <label>Starting KM Reading</label>
              <input type="number" className="fleet-input" value={kmInput} onChange={e => setKmInput(e.target.value)} placeholder="e.g. 50500" />
            </div>
            <div className="fleet-input-group">
              <label>Dashboard Photo (Optional)</label>
              <input type="file" accept="image/*" className="fleet-input" style={{ padding: '8px' }} onChange={e => setPhoto(e.target.files?.[0] || null)} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
               <button className="fleet-btn fleet-btn-secondary" onClick={() => setActiveModal(null)}>Cancel</button>
               <button className="fleet-btn fleet-btn-primary" onClick={handleStart} disabled={!kmInput}>Start Now</button>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'end' && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="fleet-login-card" style={{ maxWidth: 400 }}>
            <h3 style={{ marginTop: 0, borderBottom: '1px solid #334155', paddingBottom: 16 }}>End Trip</h3>
            <div className="fleet-input-group">
              <label>Ending KM Reading</label>
              <input type="number" className="fleet-input" value={kmInput} onChange={e => setKmInput(e.target.value)} placeholder="e.g. 50650" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
               <button className="fleet-btn fleet-btn-secondary" onClick={() => setActiveModal(null)}>Cancel</button>
               <button className="fleet-btn" style={{ background: '#ef4444', color: '#fff' }} onClick={handleEnd} disabled={!kmInput}>Complete Trip</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

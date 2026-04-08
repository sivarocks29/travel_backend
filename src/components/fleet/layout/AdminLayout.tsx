/**
 * Admin Layout — Sidebar + Header shell for all admin pages.
 */
import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearFleetCredentials, selectFleetUser } from '@/features/fleet/fleetAuthSlice';
import { authApi } from '@/api/fleetApi';
import {
  LayoutDashboard, Car, Users, CalendarCheck, Clock,
  TrendingUp, LogOut, Menu, X, Percent, ListOrdered
} from 'lucide-react';

const navItems = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/bookings', icon: CalendarCheck, label: 'Bookings' },
  { to: '/admin/bookings/pending', icon: Clock, label: 'Pending' },
  { to: '/admin/vehicles', icon: Car, label: 'Vehicles' },
  { to: '/admin/drivers', icon: Users, label: 'Drivers' },
  { to: '/admin/customers', icon: ListOrdered, label: 'Customers' },
  { to: '/admin/commissions', icon: Percent, label: 'Commissions' },
  { to: '/admin/analytics', icon: TrendingUp, label: 'Analytics' },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const user = useSelector(selectFleetUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const refresh = localStorage.getItem('refresh_token');
    if (refresh) { try { await authApi.logout(refresh); } catch {} }
    dispatch(clearFleetCredentials());
    navigate('/fleet/login');
  };

  return (
    <div className={`fleet-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      {/* Sidebar */}
      <aside className="fleet-sidebar">
        <div className="fleet-sidebar-header">
          <div className="fleet-logo-sm">
            <Car size={20} color="#f59e0b" />
            {sidebarOpen && <span>Pyolliv</span>}
          </div>
          <button className="fleet-toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <nav className="fleet-sidebar-nav">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/admin/dashboard'}
              className={({ isActive }) => `fleet-nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              {sidebarOpen && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="fleet-sidebar-footer">
          {sidebarOpen && (
            <div className="fleet-user-chip">
              <div className="fleet-user-avatar">{user?.username?.[0]?.toUpperCase()}</div>
              <div>
                <p className="fleet-user-name">{user?.username}</p>
                <p className="fleet-user-role">Administrator</p>
              </div>
            </div>
          )}
          <button className="fleet-logout-btn" onClick={handleLogout} title="Logout">
            <LogOut size={18} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="fleet-main">
        <Outlet />
      </main>
    </div>
  );
}

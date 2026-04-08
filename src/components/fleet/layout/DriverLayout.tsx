/**
 * Driver Panel Layout.
 */
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearFleetCredentials, selectFleetUser } from '@/features/fleet/fleetAuthSlice';
import { authApi } from '@/api/fleetApi';
import { LayoutDashboard, ListTodo, DollarSign, User, LogOut } from 'lucide-react';

const navItems = [
  { to: '/driver/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/driver/tasks', icon: ListTodo, label: 'Trip Tasks' },
  { to: '/driver/commissions', icon: DollarSign, label: 'Earnings' },
  { to: '/driver/profile', icon: User, label: 'Profile' },
];

export default function DriverLayout() {
  const user = useSelector(selectFleetUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const refresh = localStorage.getItem('refresh_token');
    if (refresh) { try { await authApi.logout(refresh); } catch {} }
    dispatch(clearFleetCredentials());
    navigate('/login');
  };

  return (
    <div className="fleet-layout sidebar-open">
      <aside className="fleet-sidebar driver-sidebar">
        <div className="fleet-sidebar-header">
          <div className="fleet-logo-sm"><LayoutDashboard size={20} color="#f59e0b" /><span>Driver Panel</span></div>
        </div>
        <nav className="fleet-sidebar-nav">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to === '/driver/dashboard'}
              className={({ isActive }) => `fleet-nav-item ${isActive ? 'active' : ''}`}>
              <Icon size={18} /><span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="fleet-sidebar-footer">
          <div className="fleet-user-chip">
            <div className="fleet-user-avatar">{user?.username?.[0]?.toUpperCase()}</div>
            <div>
              <p className="fleet-user-name">{user?.username}</p>
              <p className="fleet-user-role">Driver</p>
            </div>
          </div>
          <button className="fleet-logout-btn" onClick={handleLogout}><LogOut size={18} /><span>Logout</span></button>
        </div>
      </aside>
      <main className="fleet-main"><Outlet /></main>
    </div>
  );
}

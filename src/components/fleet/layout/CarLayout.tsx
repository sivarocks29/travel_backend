/**
 * Car Owner Panel Layout.
 */
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearFleetCredentials, selectFleetUser } from '@/features/fleet/fleetAuthSlice';
import { authApi } from '@/api/fleetApi';
import { Car, MapPin, DollarSign, User, LogOut } from 'lucide-react';

const navItems = [
  { to: '/car/dashboard', icon: Car, label: 'Dashboard' },
  { to: '/car/trips', icon: MapPin, label: 'My Trips' },
  { to: '/car/commissions', icon: DollarSign, label: 'Earnings' },
  { to: '/car/profile', icon: User, label: 'Profile' },
];

export default function CarLayout() {
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
    <div className="fleet-layout sidebar-open">
      <aside className="fleet-sidebar car-sidebar">
        <div className="fleet-sidebar-header">
          <div className="fleet-logo-sm"><Car size={20} color="#f59e0b" /><span>Car Panel</span></div>
        </div>
        <nav className="fleet-sidebar-nav">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to === '/car/dashboard'}
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
              <p className="fleet-user-role">Vehicle Owner</p>
            </div>
          </div>
          <button className="fleet-logout-btn" onClick={handleLogout}><LogOut size={18} /><span>Logout</span></button>
        </div>
      </aside>
      <main className="fleet-main"><Outlet /></main>
    </div>
  );
}

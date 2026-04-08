/**
 * Fleet Management Login Page
 * Shared login page — role is detected from JWT response.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { authApi } from '../../api/fleetApi';
import { setFleetCredentials } from '../../features/fleet/fleetAuthSlice';
import { Car, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function FleetLogin() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authApi.login(form.username, form.password);
      const { access, refresh, user } = res.data;
      dispatch(setFleetCredentials({ user, access, refresh }));
      // Navigate based on role
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'car') navigate('/car/dashboard');
      else if (user.role === 'driver') navigate('/driver/dashboard');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { non_field_errors?: string[]; detail?: string } } };
      setError(e?.response?.data?.non_field_errors?.[0] || e?.response?.data?.detail || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fleet-login-bg">
      <div className="fleet-login-card">
        {/* Logo */}
        <div className="fleet-login-logo">
          <div className="fleet-logo-icon">
            <Car size={28} color="#f59e0b" />
          </div>
          <span className="fleet-logo-text">Pyolliv</span>
          <span className="fleet-logo-sub">Fleet Management</span>
        </div>

        <p className="fleet-login-tagline">Sign in to your dashboard</p>

        {error && <div className="fleet-error-banner">{error}</div>}

        <form onSubmit={handleSubmit} className="fleet-login-form">
          <div className="fleet-form-group">
            <label htmlFor="fleet-username">Username</label>
            <input
              id="fleet-username"
              type="text"
              placeholder="Enter username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
          </div>
          <div className="fleet-form-group">
            <label htmlFor="fleet-password">Password</label>
            <div className="fleet-password-wrapper">
              <input
                id="fleet-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <button
                type="button"
                className="fleet-pw-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button type="submit" className="fleet-login-btn" disabled={loading}>
            {loading ? <Loader2 size={18} className="fleet-spin" /> : 'Sign In'}
          </button>
        </form>

        <p className="fleet-login-footer">
          Access is role-restricted. Contact your administrator for credentials.
        </p>
      </div>
    </div>
  );
}

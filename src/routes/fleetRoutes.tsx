/**
 * Fleet App routing initialization.
 * This can be imported from the main App.tsx to inject fleet routes.
 */
import { Route } from 'react-router-dom';

// Fleet Authentication & Common
import FleetLogin from '../pages/fleet/Login';
import FleetProtectedRoute from './FleetProtectedRoute';

// Fleet Layouts
import AdminLayout from '../components/fleet/layout/AdminLayout';
import CarLayout from '../components/fleet/layout/CarLayout';
import DriverLayout from '../components/fleet/layout/DriverLayout';

// Admin Pages
import AdminDashboard from '../pages/fleet/admin/Dashboard';
import ManageDrivers from '../pages/fleet/admin/ManageDrivers';
import ManageCustomers from '../pages/fleet/admin/ManageCustomers';
import Bookings from '../pages/fleet/admin/Bookings';

import ManageVehicles from '../pages/fleet/admin/ManageVehicles';

// Car Pages
import CarDashboard from '../pages/fleet/car/CarDashboard';
import CarProfile from '../pages/fleet/car/CarProfile';

// Driver Pages
import DriverDashboard from '../pages/fleet/driver/DriverDashboard';
import DriverTasks from '../pages/fleet/driver/DriverTasks';

export const fleetRoutes = (
  <>
    <Route path="login" element={<FleetLogin />} />
    
    {/* Admin Routes */}
    <Route path="admin" element={<FleetProtectedRoute allowedRoles={['admin']} />}>
      <Route element={<AdminLayout />}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="drivers" element={<ManageDrivers />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="vehicles" element={<ManageVehicles />} />
        <Route path="commissions" element={<div style={{padding: 40}}>Manage Commissions coming soon...</div>} />
        <Route path="customers" element={<ManageCustomers />} />
        <Route path="analytics" element={<div style={{padding: 40}}>Advanced Analytics coming soon...</div>} />
        <Route path="bookings/pending" element={<div style={{padding: 40}}>Pending Bookings coming soon...</div>} />
      </Route>
    </Route>

    {/* Car Owner Routes */}
    <Route path="car" element={<FleetProtectedRoute allowedRoles={['car']} />}>
      <Route element={<CarLayout />}>
        <Route path="dashboard" element={<CarDashboard />} />
        <Route path="profile" element={<CarProfile />} />
        <Route path="trips" element={<div style={{padding: 40}}>All Trips History coming soon...</div>} />
        <Route path="commissions" element={<div style={{padding: 40}}>Detailed Earnings coming soon...</div>} />
      </Route>
    </Route>

    {/* Driver Routes */}
    <Route path="driver" element={<FleetProtectedRoute allowedRoles={['driver']} />}>
      <Route element={<DriverLayout />}>
        <Route path="dashboard" element={<DriverDashboard />} />
        <Route path="tasks" element={<DriverTasks />} />
        <Route path="profile" element={<div style={{padding: 40}}>Driver Profile coming soon...</div>} />
        <Route path="commissions" element={<div style={{padding: 40}}>Detailed Earnings coming soon...</div>} />
      </Route>
    </Route>
  </>
);

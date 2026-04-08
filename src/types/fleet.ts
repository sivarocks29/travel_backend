/**
 * TypeScript interfaces for all Pyolliv fleet management models.
 */

export type Role = 'admin' | 'driver' | 'car';

export interface User {
  id: string;
  username: string;
  email: string;
  role: Role;
  is_active: boolean;
  created_at: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
  user: Pick<User, 'id' | 'username' | 'email' | 'role'>;
}

// ── Vehicle ──────────────────────────────────────────────────────────────────
export interface Car {
  id: string;
  vehicle_id: string;
  vehicle_number: string;
  owner_name: string;
  mobile_number: string;
  rc_document?: string;
  insurance_document?: string;
  permit_document?: string;
  aadhar_card?: string;
  license_document?: string;
  owner_photo?: string;
  car_photo?: string;
  is_available: boolean;
  created_at: string;
}

export interface CarList {
  id: string;
  vehicle_id: string;
  vehicle_number: string;
  owner_name: string;
  is_available: boolean;
}

// ── Driver ────────────────────────────────────────────────────────────────────
export interface Driver {
  id: string;
  user: User;
  license_number: string;
  photo?: string;
  mobile_number: string;
  address: string;
  is_logged_in: boolean;
  last_login_at?: string;
  last_logout_at?: string;
  created_at: string;
}

export interface DriverList {
  id: string;
  username: string;
  name?: string;
  age?: number;
  license_number: string;
  mobile_number: string;
  is_logged_in: boolean;
  last_login_at?: string;
  last_logout_at?: string;
}

export interface DriverLoginLog {
  id: string;
  login_at: string;
  logout_at?: string;
}

// ── Customer ──────────────────────────────────────────────────────────────────
export interface Customer {
  id: string;
  customer_id: string;
  name: string;
  mobile_number: string;
  email: string;
  address: string;
  total_bookings: number;
  created_at: string;
}

// ── Booking ───────────────────────────────────────────────────────────────────
export type BookingStatus = 'pending' | 'confirmed' | 'ongoing' | 'completed' | 'cancelled';
export type TripType = 'local' | 'outstation' | 'airport' | 'rental';

export interface Booking {
  id: string;
  trip_no: string;
  booking_date: string;
  pickup_date: string;
  pickup_time: string;
  drop_date?: string;
  drop_time?: string;
  customer: string;
  customer_detail: Customer;
  vehicle?: string;
  vehicle_detail?: CarList;
  driver?: string;
  driver_detail?: DriverList;
  type_of_trip: TripType;
  pickup_location: string;
  drop_location: string;
  fare: number;
  waiting_hours: number;
  is_new_customer: boolean;
  status: BookingStatus;
  rating?: number;
  review?: string;
  created_at: string;
}

// ── Trip ──────────────────────────────────────────────────────────────────────
export type TripStatus = 'assigned' | 'started' | 'completed';

export interface Trip {
  id: string;
  trip_no: string;
  customer_name: string;
  pickup_location: string;
  drop_location: string;
  pickup_date: string;
  fare: number;
  start_km?: number;
  end_km?: number;
  total_km?: number;
  start_photo?: string;
  started_at?: string;
  ended_at?: string;
  status: TripStatus;
  created_at: string;
}

// ── Commission ────────────────────────────────────────────────────────────────
export interface Commission {
  id: string;
  trip_no: string;
  customer_name: string;
  total_amount: number;
  car_percentage: number;
  driver_percentage: number;
  admin_percentage: number;
  car_amount: number;
  driver_amount: number;
  admin_amount: number;
  created_at: string;
}

export interface CommissionDefault {
  car_percentage: number;
  driver_percentage: number;
  admin_percentage: number;
}

// ── Analytics ─────────────────────────────────────────────────────────────────
export interface DashboardAnalytics {
  bookings: {
    total: number;
    completed: number;
    pending_assignment: number;
    ongoing: number;
  };
  commissions: {
    total: number;
    car: number;
    driver: number;
    admin: number;
  };
}

// ── Pagination ────────────────────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}

import { LucideIcon } from "lucide-react";

export type PaginationType = {
  totalElements?: number;
  totalPages?: number;
  currentPage?: number;
  perPage?: number;
  order?: "asc" | "desc";
  sortBy?: string;
};

type Gender = "MALE" | "FEMALE";

export interface Cargo {
  id?: string;
  weight?: number;
  description?: string;
  receiver?: Customer;
  sender?: Customer;
  quantity?: number;
  totalWeight?: number;
  createdAt?: string;
  updatedAt?: string;
  price?: Money;
  referenceNumber?: number;
}
export type FXRate = {
  id?: string;
  sourceCurrency?: string;
  destinationCurrency?: string;
  rate?: number;
  createdAt?: string;
};
export interface Driver extends RegistrationResponse {
  id?: string; // UUID
  deviceId?: string;
  dob?: string; // ISO Date string (e.g., "2025-01-20")
  dateOfJoining?: string; // ISO Date string
  dateOfLeaving?: string; // ISO Date string
  experience?: number;
  salary?: number;
  phoneNumber?: string;
  licenseNumber?: string;
  licenseToDrive?: string;
  licenseIssueDate?: string; // ISO Date string
  licenseExpiryDate?: string; // ISO Date string

  bloodGroup?: string;
  supervisorName?: string;
  supervisorPhoneNo?: string;
  address?: string;
  isEnabled?: boolean;
  password?: string;
  licenseAvailable?: boolean;
  licenseVerified?: boolean;
  vehicles?: Vehicle[]; // One-to-Many relationship with Vehicle
  registeredAt?: string; // ISO Date string (e.g.,
}
export type VehicleLocation = {
  id: string;
  latitude: number;
  longitude: number;
  altitude?: number;
  speed?: number;
  heading?: number;

  satelliteCount?: number;
  hdop?: number;
  pdop?: number;
  gnssStatus?: number;

  odometer?: number;
  totalOdometer?: number;
  tripOdometer?: number;
  movementStatus?: number;
  accelerometerX?: number;
  accelerometerY?: number;
  accelerometerZ?: number;

  digitalInput1?: number;
  digitalInput2?: number;
  digitalInput3?: number;
  digitalInput4?: number;

  digitalOutput1?: number;
  digitalOutput2?: number;
  digitalOutput3?: number;
  digitalOutput4?: number;

  analogInput1?: number;
  analogInput2?: number;
  analogInput3?: number;
  analogInput4?: number;

  sdStatus?: number;
  dataMode?: number;
  sleepMode?: number;

  ble1BatteryVoltage?: number;
  ble2BatteryVoltage?: number;
  ble3BatteryVoltage?: number;
  ble4BatteryVoltage?: number;
  ble1Temperature?: number;
  ble2Temperature?: number;
  ble3Temperature?: number;
  ble4Temperature?: number;
  ble1Humidity?: number;
  ble2Humidity?: number;
  ble3Humidity?: number;
  ble4Humidity?: number;
  fmBatteryLevel?: number;

  gsmSignalStrength?: number;
  gsmCellId?: string;
  gsmAreaCode?: string;
  gsmOperator?: string;
  simIccid1?: string;
  simIccid2?: string;

  fuelLevel?: number;
  fuelUsedGps?: number;
  averageFuelUse?: number;
  engineRpm?: number;
  coolantTemp?: number;
  batteryVoltage?: number;
  internalBatteryVoltage?: number;
  batteryCurrent?: number;
  numberOfDtc?: number;
  engineLoadValue?: number;
  shortTermFuelTrim1?: number;
  fuelPressure?: number;
  intakeManifoldPressure?: number;
  timingAdvance?: number;
  intakeAirTemp?: number;
  mafAirFlowRate?: number;
  throttlePosition?: number;
  engineRunTime?: number;
  distanceMILOn?: number;
  relativeFuelRailPressure?: number;
  directFuelRailPressure?: number;
  commandedEGR?: number;
  egrError?: number;
  distanceSinceCodesCleared?: number;
  barometricPressure?: number;
  controlModuleVoltage?: number;
  absoluteLoadValue?: number;
  ambientAirTemp?: number;
  timeRunWithMILOn?: number;
  timeSinceCodesCleared?: number;
  absoluteFuelRailPressure?: number;
  hybridBatteryRemainingLife?: number;
  engineOilTemp?: number;
  fuelInjectionTiming?: number;
  engineFuelRate?: number;
  totalMileage?: number;

  ignitionStatus?: string;
  towingDetectionEvent?: number;
  crashDetection?: number;
  jammingDetection?: number;
  tripEvent?: number;
  idlingEvent?: number;
  unplugEvent?: number;
  greenDrivingType?: number;
  greenDrivingValue?: number;
  greenDrivingEventDuration?: number;
  overspeedingEvent?: number;
  ecoScore?: number;

  userId?: string;
  vin?: string;
  faultCodes?: string;

  batteryLevel?: number;
  powerSource?: string;
  eventType?: string;
  eventCode?: string;

  timestamp: string; // ISO string format preferred in TypeScript

  imei?: string;

  vehicle?: {
    id: string;
    // You can expand this based on your `Vehicle` entity
  };

  rawData?: string;
  codecType?: string;
  dataPriority?: number;
};

export interface Vehicle {
  id?: string; // UUID
  imei?: string; // Vehicle Number
  model?: string;
  make?: string;
  manufactureDate?: string; // ISO Date string (e.g., "2025-01-20")
  fuelCapacity?: number;
  status?: Status;
  vehicleType?: VehicleType; // Many-to-One relationship with VehicleType
  driver?: Driver; // Many-to-One relationship with Driver
  locations?: VehicleLocation[]; // One-to-Many relationship with Location
  overSpeed?: number; // Overspeed threshold
  currentOdometerReading?: number; // Optional current odometer reading
  vehicleNickname?: string; // Optional vehicle nickname
  remark?: string; // Optional remark field
  remark2?: string; // Optional second remark field
  plate?: string;
  fuelType?: FuelType;
  registeredAt?: string; // ISO Date string (e.g., "2025-01-20")
}

type Status = "ACTIVE" | "INACTIVE" | "DECOMMISSIONED";

// Supporting types
export interface VehicleType {
  id?: string;
  name?: string;
  fileUrl?: string;
}

export interface Customer {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  gender?: Gender;
  sentCargo?: Cargo[];
  receivedCargo?: Cargo[];
  createdAt?: string;
  updatedAt?: string;
}
export type OtpResponse = {
  otpValid: boolean;
};

export type Pageable = {
  pageNumber: number;
  pageSize: number;
  sort: Sort;
  offset: number;
  paged: boolean;
  unpaged: boolean;
};

export type Sort = {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
};

export type CustomersResponseType = {
  content: Customer[];
  pageable?: Pageable;
  last?: boolean;
  totalPages?: number;
  totalElements?: number;
  numberOfElements?: number;
  size?: number;
  number?: number;
  sort?: Sort;
  first?: boolean;
  empty?: boolean;
};
export type TripsResponseType = {
  content: Trip[];
  pageable?: Pageable;
  last?: boolean;
  totalPages?: number;
  totalElements?: number;
  numberOfElements?: number;
  size?: number;
  number?: number;
  sort?: Sort;
  first?: boolean;
  empty?: boolean;
};

interface UserInterface {
  id?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  email?: string;
  phoneNumber?: string;
  roles?: Role[];
  enabled?: boolean;
  createdAt?: string;
  updatedAt?: string;
  preferredCurrencyCode?: string;
}
export type Role = "ADMIN" | "USER";
export type Authority = {
  authority: string;
};
export interface LoggedUser extends UserInterface {
  token?: string;
  loading: boolean;
}
export interface User extends UserInterface {
  accountNonLocked?: boolean;
  roleType?: string;
  credentialsNonExpired?: boolean;
  accountNonExpired?: boolean;
}
export type UsersResponseType = {
  content: User[];
  pageable?: Pageable;
  last?: boolean;
  totalPages?: number;
  totalElements?: number;
  numberOfElements?: number;
  size?: number;
  number?: number;
  sort?: Sort;
  first?: boolean;
  empty?: boolean;
};
export interface LoggedUserStore {
  user: LoggedUser;
  setUser: (newUser: Partial<LoggedUser>) => void;
  setLoading: (loading: boolean) => void;
  resetUser: () => void;
}

export interface UserStore {
  user?: User;
  setUser: (newOwner: Partial<User>) => void;
  resetOwner: () => void;
}
export interface CustomerStore {
  customer?: Customer;
  setCustomer: (newCustomer: Partial<Customer>) => void;
  deleteSentCargo: (id: string) => void;
  deleteReceivedCargo: (id: string) => void;
  resetCustomer: () => void;
}
export interface CargoStore {
  cargo?: Cargo;
  setCargo: (newCargo: Partial<Cargo>) => void;
  resetCargo: () => void;
}

export interface RegistrationRequest {
  password?: string;
  email: string;
  enabled?: boolean;
  roles?: string[];
  firstName: string;
  lastName: string;
  phoneNumber: string;
}
export type TripStatus = "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export interface TripResponse {
  id?: string;
  vehicleId?: string;
  driverName?: string;
  originAddress?: string;
  destinationAddress?: string;
  assignedAt?: string;
  startedAt?: string;
  completedAt?: string;
  status?: TripStatus;
  cargos?: Cargo[];
}
export interface TripLocation {
  address: string;
  latitude: number;
  longitude: number;
}
export interface TripCargoRequest {
  tripId: string;
  cargoId: string;
}

export interface TripCargoQueryParams {
  page: number;
  size: number;
  sortBy?: string;
  order?: string;
}

export interface Trip {
  id?: string;
  vehicle?: Vehicle;
  assignedAt?: string;
  startedAt?: string | null;
  completedAt?: string | null;
  status?: TripStatus;
  originAddress?: string;
  destinationAddress?: string;
}
export interface TripCargoResponse {
  trip: Trip; // Assuming you have a Trip type defined elsewhere
  cargo: Cargo; // Assuming you have a CargoDto type defined
  addedAt: string; // ISO date string
}

export interface TripCreateRequest {
  vehicleId: string;
  originAddress: string;
  destinationAddress: string;
}

export interface CustomerRegistrationRequest extends RegistrationRequest {}
export interface CustomerUpdateRequest extends CustomerRegistrationRequest {
  id: string;
}
export interface OwnerUpdateRequest extends RegistrationRequest {
  id?: string;
}
export interface RegistrationResponse {
  id?: string;
  email?: string;
  enabled?: boolean;
  roles?: string[];
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  roles: string[];
  password: string;
  enabled: boolean;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  id: string;
}

export interface File {
  id: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  logo: boolean;
}
export interface Location {
  id?: string;
  name?: string;
  country?: string;
}
export interface FuelType {
  id?: string;
  name?: string;
}
export interface CargoResponseType {
  content: Cargo[];
  pageable?: Pageable;
  last?: boolean;
  totalPages?: number;
  totalElements?: number;
  numberOfElements?: number;
  size?: number;
  number?: number;
  sort?: Sort;
  first?: boolean;
  empty?: boolean;
}

export type Notification = {
  id: string;
  message: string;
  associatedId?: string;
  users: User[];
  read: boolean;
  createdAt: string;
};

export interface NotificationResponseType {
  content: Notification[];
  pageable?: Pageable;
  last?: boolean;
  totalPages?: number;
  totalElements?: number;
  numberOfElements?: number;
  size?: number;
  number?: number;
  sort?: Sort;
  first?: boolean;
  empty?: boolean;
}
export interface FxRatesResponseType {
  content: FXRate[];
  pageable?: Pageable;
  last?: boolean;
  totalPages?: number;
  totalElements?: number;
  numberOfElements?: number;
  size?: number;
  number?: number;
  sort?: Sort;
  first?: boolean;
  empty?: boolean;
}

export interface changePasswordRequest {
  email: string;
  newPassword: string;
  oldPassword: string;
}

export interface VehicleResponseType {
  content: Vehicle[];
  pageable?: Pageable;
  last?: boolean;
  totalPages?: number;
  totalElements?: number;
  numberOfElements?: number;
  size?: number;
  number?: number;
  sort?: Sort;
  first?: boolean;
  empty?: boolean;
}

export interface DriverResponseType {
  content: Driver[];
  pageable?: Pageable;
  last?: boolean;
  totalPages?: number;
  totalElements?: number;
  numberOfElements?: number;
  size?: number;
  number?: number;
  sort?: Sort;
  first?: boolean;
  empty?: boolean;
}
type Money = {
  amount?: number;
  currencyCode?: string;
};
interface Expense {
  id?: string;
  amount?: Money;
  date?: string;
  description?: string;
  categoryType?: "FUEL" | "MAINTENANCE";
  vehicle?: Vehicle;
  fileUrl?: string; // Optional file ID for the expense
}

export interface FuelExpense extends Expense {
  categoryType?: "FUEL";
  liters?: number;
  fuelType?: FuelType;
  fuelStation?: string;
}

export interface MaintenanceExpense extends Expense {
  categoryType?: "MAINTENANCE";
  maintenanceType?: string;
  serviceCenter?: string;
}

export type MaintenanceExpenseResponseType = {
  content: MaintenanceExpense[];
  pageable?: Pageable;
  last?: boolean;
  totalPages?: number;
  totalElements?: number;
  numberOfElements?: number;
  size?: number;
  number?: number;
  sort?: Sort;
  first?: boolean;
  empty?: boolean;
};

export type FuelExpenseResponseType = {
  content: FuelExpense[];
  pageable?: Pageable;
  last?: boolean;
  totalPages?: number;
  totalElements?: number;
  numberOfElements?: number;
  size?: number;
  number?: number;
  sort?: Sort;
  first?: boolean;
  empty?: boolean;
};
export type GeofenceResponseType = {
  content: Geofence[];
  pageable?: Pageable;
  last?: boolean;
  totalPages?: number;
  totalElements?: number;
  numberOfElements?: number;
  size?: number;
  number?: number;
  sort?: Sort;
  first?: boolean;
  empty?: boolean;
};
export type PathDetailsType = {
  label: {
    name: string;
    icon?: LucideIcon;
  };
  link: string;
  roles?: Role[];
  badge?: number;
};
export type SideBarWrapperPropsType = {
  items: SideBarTab[];
};
export type SideBarTab = {
  groupTitle: string;
  children: PathDetailsType[];
};

export type GraphResponse = { [key: string]: number };

export type CategoryChartType = "PIE" | "BAR";
export type DateFormTypes = {
  startDate: string;
  endDate: string;
};
export enum LuggageStatusEnum {
  "CHECKED_IN",
  "IN_TRANSIT",
  "ARRIVED",
  "LOST",
  "DELIVERED",
  "PENDING",
  "DAMAGED",
  "RETRIEVED",
  "ON_HOLD",
  "CUSTOMS_CHECK",
}
export interface LuggageStatus {
  id?: string;
  status?: LuggageStatusEnum;
  trackingHistory?: CargoTracking;
  createdAt?: string;
}

export type CargoTracking = {
  id?: string;
  cargo?: Cargo;
  location?: string;
  description?: string;
  createdBy?: User;
  createdAt?: string;
  updatedAt?: string;
  history?: LuggageStatus[];
};
export type Trend = "UP" | "DOWN" | "STABLE"; // Match this with your Java enum values

export interface FuelEfficiencyDto {
  avgMpg: number | null;
  trend: Trend;
  bestMpg: number | null;
}

export interface TimeRange {
  startDate: string;
  endDate: string;
}
export interface Geofence {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  color: string;
  fillOpacity: number;
  weight: number;
  vehiclesInside?: string[];
}
export type ApiError = {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
};


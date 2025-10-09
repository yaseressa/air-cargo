import {
  AuthRequest,
  AuthResponse,
  Cargo,
  CargoTracking,
  changePasswordRequest,
  Customer,
  Driver,
  Expense,
  File as FileType,
  FuelExpense,
  FuelType,
  FXRate,
  Location,
  MaintenanceExpense,
  OwnerUpdateRequest,
  RegistrationRequest,
  RegistrationResponse,
  Trip,
  TripCargoRequest,
  TripCargoResponse,
  TripCreateRequest,
  TripResponse,
  Vehicle,
  VehicleType,
} from "@/utils/types";
import { axiosApiClient, axiosAuthClient, queryClient } from "../clients.ts";
import { useMutation, UseMutationResult } from "react-query";
// *********************** user registration and login related calls ***********************

const login = async (loginData: AuthRequest): Promise<AuthResponse> => {
  const { data } = await axiosAuthClient.post<AuthResponse>(
    "/login",
    loginData
  );
  return data;
};

const registerUsers = async (
  registrationData: RegistrationRequest
): Promise<RegistrationResponse> => {
  const { data } = await axiosApiClient.post<RegistrationResponse>(
    "/users/Admin",
    registrationData
  );
  return data;
};
const readNotifications = async ({
  userId,
  notifications,
}: {
  userId: string;
  notifications: string[];
}) => {
  const { data } = await axiosApiClient.post(
    `/notifications/unread/${userId}`,
    {
      notificationIds: notifications,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return data;
};
const readAllNotifications = async (userId: string): Promise<string> => {
  const { data } = await axiosApiClient.post(
    `/notifications/read/all/${userId}`
  );
  return data;
};
const changePassword = async (
  changePasswordData: changePasswordRequest
): Promise<string> => {
  const { data } = await axiosAuthClient.post(
    `/change-password`,
    changePasswordData
  );
  return data;
};
const forgotPassword = async (email: string): Promise<string> => {
  const { data } = await axiosAuthClient.post(`/forgot-password/${email}`);
  return data;
};
const otpValidation = async ({
  email,
  otp,
}: {
  email: string;
  otp: string;
}): Promise<any> => {
  const { data } = await axiosAuthClient.post(`/otp-valid/${email}/${otp}`);
  return data;
};
const userEnableAndDisable = async (userId: string): Promise<string> => {
  const { data } = await axiosAuthClient.post(`/toggle/${userId}`);
  return data;
};

// *********************** field related calls ***********************
const cargoPhotos = async ({
  photo,
  cargoId,
}: {
  photo: any;
  cargoId: string;
}): Promise<FileType> => {
  const { data } = await axiosApiClient.post(
    `/cargos/` + cargoId + "/file",
    photo
  );
  return data;
};

type ExpensePayload = {
  description?: string;
  amount: number;
  currencyCode: string;
  incurredAt?: string | null;
};

const createExpense = async ({
  data,
  file,
}: {
  data: ExpensePayload;
  file?: globalThis.File;
}): Promise<Expense> => {
  const formData = new FormData();

  formData.append(
    "expense",
    new Blob([JSON.stringify(data)], { type: "application/json" })
  );

  if (file) {
    formData.append("file", file);
  }

  const { data: response } = await axiosApiClient.post<Expense>(
    `/expenses`,
    formData
  );

  return response;
};

const deleteFileType = async (FileTypeId: string): Promise<string> => {
  const { data } = await axiosApiClient.delete(`/cargos/file/${FileTypeId}`);
  return data;
};

const deleteGeofence = async (geofenceId: string): Promise<string> => {
  const { data } = await axiosApiClient.delete(`/geofences/${geofenceId}`);
  return data;
};

const registerCustomer = async (
  registrationData: Customer
): Promise<Customer> => {
  const { data } = await axiosApiClient.post<Customer>(
    "/customers",
    registrationData
  );
  return data;
};
const registerUser = async (
  registrationData: OwnerUpdateRequest
): Promise<RegistrationResponse> => {
  const { data } = await axiosApiClient.post<RegistrationResponse>(
    "/users",
    registrationData
  );
  return data;
};
type ForgotPasswordChange = {
  email: string;
  password: string;
  otp: string;
};
const forgotChangePassword = async ({
  email,
  ...input
}: ForgotPasswordChange): Promise<string> => {
  const { data } = await axiosAuthClient.post(
    `/change-password/${email}`,
    input
  );
  return data;
};
const registerLocation = async (locationData: Location): Promise<any> => {
  const { data } = await axiosApiClient.post(`/locations`, locationData);
  return data;
};

const registerVehicleType = async (
  registrationData: VehicleType,
  imageFileType?: File
): Promise<any> => {
  const formData = new FormData();

  const fuelDtoBlob = new Blob([JSON.stringify(registrationData)], {
    type: "application/json",
  });

  formData.append("vehicleType", fuelDtoBlob);

  if (imageFileType) {
    formData.append("image", imageFileType);
  }
  const { data } = await axiosApiClient.post<any>(`/vehicle-types`, formData);

  return data;
};
const updateVehicleType = async (
  registrationData: VehicleType,
  imageFileType?: File
): Promise<any> => {
  const formData = new FormData();

  const fuelDtoBlob = new Blob([JSON.stringify(registrationData)], {
    type: "application/json",
  });

  formData.append("vehicleType", fuelDtoBlob);

  if (imageFileType) {
    formData.append("image", imageFileType);
  }
  const { data } = await axiosApiClient.put<any>(`/vehicle-types`, formData);

  return data;
};
const registerFuelType = async (registrationData: FuelType): Promise<any> => {
  const { data } = await axiosApiClient.post(`/fuel-types`, registrationData);
  return data;
};
const registerVehicle = async (registrationData: any): Promise<any> => {
  const { data } = await axiosApiClient.post(`/vehicles`, registrationData);
  return data;
};
const registerDriver = async (registrationData: Driver): Promise<Driver> => {
  const { data } = await axiosApiClient.post(`/drivers`, registrationData);
  return data;
};
export const assignCargoToTrip = async (
  request: TripCargoRequest
): Promise<TripCargoResponse> => {
  const { data } = await axiosApiClient.post("/trip-cargo/assign", request);
  return data;
};

export const unassignCargoFromTrip = async (
  request: TripCargoRequest
): Promise<string> => {
  const { data } = await axiosApiClient.delete("/trip-cargo/unassign", {
    data: request,
  });
  return data;
};
const updateDriver = async (updateData: Driver): Promise<Driver> => {
  const { data } = await axiosApiClient.put(`/drivers`, updateData);
  return data;
};
const deleteDriver = async (driverId: string): Promise<string> => {
  const { data } = await axiosApiClient.delete(`/drivers/${driverId}`);
  return data;
};
const updateVehicle = async (updateData: any): Promise<any> => {
  const { data } = await axiosApiClient.put(`/vehicles`, updateData);
  return data;
};
const deleteVehicle = async (vehicleId: string): Promise<string> => {
  const { data } = await axiosApiClient.delete(`/vehicles/${vehicleId}`);
  return data;
};

const updateFuelType = async (updateData: FuelType): Promise<any> => {
  const { data } = await axiosApiClient.put(`/fuel-types`, updateData);
  return data;
};
const deleteVehicleType = async (vehicleTypeId: string): Promise<string> => {
  const { data } = await axiosApiClient.delete(
    `/vehicle-types/${vehicleTypeId}`
  );
  return data;
};
const updateLocation = async (locationData: Location): Promise<any> => {
  const { data } = await axiosApiClient.put(`/locations`, locationData);
  return data;
};
const updateCustomer = async (updateData: Customer) => {
  const { data } = await axiosApiClient.put(`/customers`, updateData);
  return data;
};
const deleteCustomer = async (customerId: string): Promise<string> => {
  const { data } = await axiosApiClient.delete(`/customers/${customerId}`);
  return data;
};
const deleteTrip = async (tripId: string): Promise<string> => {
  const { data } = await axiosApiClient.delete(`/trips/${tripId}`);
  return data;
};
const deleteLocation = async (locationId: string): Promise<string> => {
  const { data } = await axiosApiClient.delete(`/locations/${locationId}`);
  return data;
};
const deleteUser = async (userId: string): Promise<string> => {
  const { data } = await axiosApiClient.delete(`/users/${userId}`);
  return data;
};
const deleteFuelType = async (fuelTypeId: string): Promise<string> => {
  const { data } = await axiosApiClient.delete(`/fuel-types/${fuelTypeId}`);
  return data;
};
const deleteFxRate = async (fxRateId: string): Promise<string> => {
  const { data } = await axiosApiClient.delete(`/fx-rates/${fxRateId}`);
  return data;
};
const createFxRate = async (updatedFx: FXRate): Promise<FXRate> => {
  const { data } = await axiosApiClient.post(`/fx-rates`, updatedFx);
  return data;
};
const updateFxRate = async (updatedFx: FXRate): Promise<FXRate> => {
  const { data } = await axiosApiClient.put(`/fx-rates`, updatedFx);
  return data;
};
const updateUser = async (updateData: OwnerUpdateRequest) => {
  const { data } = await axiosApiClient.put(`/users`, updateData);
  return data;
};
const changeUserData = async (updateData: OwnerUpdateRequest) => {
  const { data } = await axiosAuthClient.post(`/update`, updateData);
  return data;
};
const registerCargo = async (registrationData: Cargo): Promise<any> => {
  const { data } = await axiosApiClient.post<any>("/cargos", registrationData);
  return data;
};
const registerMaintenanceExpense = async (
  registrationData: MaintenanceExpense,
  imageFile?: File
): Promise<any> => {
  const formData = new FormData();
  const maintenanceDtoBlob = new Blob([JSON.stringify(registrationData)], {
    type: "application/json",
  });

  formData.append("maintenanceDto", maintenanceDtoBlob);

  if (imageFile) {
    formData.append("image", imageFile);
  }

  const { data } = await axiosApiClient.post<any>(
    "/expenses/maintenance",
    formData
  );
  return data;
};

const updatePreferredCurrencyForUser = async ({
  userId,
  preferredCurrency,
}: {
  userId: string;
  preferredCurrency: string;
}): Promise<string> => {
  const { data } = await axiosAuthClient.post<any>(
    `/${userId}/curr/${preferredCurrency}`
  );
  return data;
};

const registerFuelExpense = async (
  registrationData: FuelExpense,
  imageFileType?: File
): Promise<any> => {
  const formData = new FormData();

  const fuelDtoBlob = new Blob([JSON.stringify(registrationData)], {
    type: "application/json",
  });

  formData.append("fuelDto", fuelDtoBlob);

  if (imageFileType) {
    formData.append("image", imageFileType);
  }
  const { data } = await axiosApiClient.post<any>("/expenses/fuel", formData);

  return data;
};
const updateMaintenanceExpense = async (
  updateData: MaintenanceExpense,
  imageFile?: File
): Promise<any> => {
  const formData = new FormData();

  const maintenanceDtoBlob = new Blob([JSON.stringify(updateData)], {
    type: "application/json",
  });

  formData.append("maintenanceDto", maintenanceDtoBlob);
  if (imageFile) {
    formData.append("image", imageFile);
  }

  const { data } = await axiosApiClient.put<any>(
    "/expenses/maintenance",
    formData
  );
  return data;
};
export const registerGeofence = async (registrationData: any): Promise<any> => {
  const { data } = await axiosApiClient.post<any>(
    "/geofences",
    registrationData
  );
  return data;
};

const addVehicleToGeofence = async ({
  geofenceId,
  vehicleImei,
}: {
  geofenceId: string;
  vehicleImei: string;
}): Promise<any> => {
  const { data } = await axiosApiClient.post<any>(
    `/geofences/${geofenceId}/vehicles/${vehicleImei}`
  );
  return data;
};

export const createTrip = async (
  request: TripCreateRequest
): Promise<TripResponse> => {
  const { data } = await axiosApiClient.post("/trips", request);
  return data;
};
export const updateTrip = async (request: Trip): Promise<TripResponse> => {
  const { data } = await axiosApiClient.put("/trips", request);
  return data;
};

export const startTrip = async (id: string): Promise<TripResponse> => {
  const { data } = await axiosApiClient.post(`/trips/${id}/start`);
  return data;
};

export const completeTrip = async (id: string): Promise<TripResponse> => {
  const { data } = await axiosApiClient.post(`/trips/${id}/complete`);
  return data;
};

export const cancelTrip = async (id: string): Promise<TripResponse> => {
  const { data } = await axiosApiClient.post(`/trips/${id}/cancel`);
  return data;
};

export const getTripById = async (id: string): Promise<TripResponse> => {
  const { data } = await axiosApiClient.get(`/trips/${id}`);
  return data;
};

export const getTrips = async (params: {
  page: number;
  size: number;
  search?: string;
  sortBy?: string;
  order?: string;
  startDate?: string;
  endDate?: string;
}) => {
  const { data } = await axiosApiClient.get("/trips", { params });
  return data;
};

export const getTripsByDriver = async (
  driverId: string,
  params: {
    page: number;
    size: number;
    search?: string;
    sortBy?: string;
    order?: string;
  }
) => {
  const { data } = await axiosApiClient.get(`/trips/driver/${driverId}`, {
    params,
  });
  return data;
};

const removeVehicleFromGeofence = async ({
  geofenceId,
  vehicleImei,
}: {
  geofenceId: string;
  vehicleImei: string;
}): Promise<any> => {
  const { data } = await axiosApiClient.delete<any>(
    `/geofences/${geofenceId}/vehicles/${vehicleImei}`
  );
  return data;
};

export const updateGeofence = async (updateData: any): Promise<any> => {
  const { data } = await axiosApiClient.put<any>(
    "/geofences/" + updateData.id,
    updateData
  );
  return data;
};

const updateFuelExpense = async (
  updateData: FuelExpense,
  imageFile?: File
): Promise<any> => {
  const formData = new FormData();

  const fuelDtoBlob = new Blob([JSON.stringify(updateData)], {
    type: "application/json",
  });
  formData.append("fuelDto", fuelDtoBlob);
  if (imageFile) {
    formData.append("image", imageFile);
  }

  const { data } = await axiosApiClient.put<any>("/expenses/fuel", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
};
const deleteMaintenanceExpense = async (expenseId: string): Promise<string> => {
  const { data } = await axiosApiClient.delete(
    `/expenses/maintenance/${expenseId}`
  );
  return data;
};
const deleteFuelExpense = async (expenseId: string): Promise<string> => {
  const { data } = await axiosApiClient.delete(`/expenses/fuel/${expenseId}`);
  return data;
};
const updateCargo = async (updateData: Cargo): Promise<any> => {
  const { data } = await axiosApiClient.put<any>("/cargos", updateData);
  return data;
};
// *********************** reviews related calls ***********************
export const deleteReview = async (reviewId: string): Promise<string> => {
  const { data } = await axiosApiClient.delete(`/reviews/${reviewId}`);
  return data;
};

const deleteBooking = async (bookingId: string): Promise<string> => {
  const { data } = await axiosApiClient.delete(`/bookings/${bookingId}`);
  return data;
};

const deleteCargo = async (cargoId: string): Promise<string> => {
  const { data } = await axiosApiClient.delete(`/cargos/${cargoId}`);
  return data;
};

const registerCargoTrackingHistory = async (
  trackingData: CargoTracking
): Promise<any> => {
  const { data } = await axiosApiClient.post(`/cargos/tracking`, trackingData);
  return data;
};

const updateCargoTrackingHistory = async (
  trackingData: CargoTracking
): Promise<any> => {
  const { data } = await axiosApiClient.put(`/cargos/tracking`, trackingData);
  return data;
};

export const useCreateTrip = (): UseMutationResult<
  TripResponse,
  Error,
  TripCreateRequest
> => useMutation({ mutationFn: createTrip });
export const useUpdateTrip = (): UseMutationResult<TripResponse, Error, Trip> =>
  useMutation({ mutationFn: updateTrip });

export const useStartTrip = (): UseMutationResult<
  TripResponse,
  Error,
  string
> => useMutation({ mutationFn: startTrip });

export const useCompleteTrip = (): UseMutationResult<
  TripResponse,
  Error,
  string
> => useMutation({ mutationFn: completeTrip });

export const useCancelTrip = (): UseMutationResult<
  TripResponse,
  Error,
  string
> => useMutation({ mutationFn: cancelTrip });

export const useUpdateCargoTracking = (): UseMutationResult<
  CargoTracking,
  Error,
  CargoTracking
> => {
  return useMutation(updateCargoTrackingHistory);
};
export const useRegisterCargoTracking = (): UseMutationResult<
  CargoTracking,
  Error,
  CargoTracking
> => {
  return useMutation(registerCargoTrackingHistory);
};

export const useRegisterAdmin = (): UseMutationResult<
  RegistrationResponse,
  Error,
  RegistrationRequest
> => {
  return useMutation(registerUsers);
};

export const useLogin = (): UseMutationResult<
  AuthResponse,
  Error,
  AuthRequest
> => {
  return useMutation(login);
};

export const useAddPhotos = (): UseMutationResult<FileType, Error, any> => {
  return useMutation(cargoPhotos);
};

export const useCreateExpense = (): UseMutationResult<
  Expense,
  Error,
  { data: ExpensePayload; file?: globalThis.File }
> => {
  return useMutation(createExpense);
};

export const useDeleteFile = (): UseMutationResult<string, Error, string> => {
  return useMutation(deleteFileType);
};

export const useDeleteOwner = (): UseMutationResult<string, Error, string> => {
  return useMutation(deleteUser);
};
export const useDeleteCustomer = (): UseMutationResult<
  string,
  Error,
  string
> => {
  return useMutation(deleteCustomer);
};
export const useDeleteTrip = (): UseMutationResult<string, Error, string> => {
  return useMutation(deleteTrip);
};

export const useDeleteReview = (): UseMutationResult<string, Error, string> => {
  return useMutation(deleteReview);
};

export const useEnableDisableUser = (): UseMutationResult<
  string,
  Error,
  string
> => {
  return useMutation(userEnableAndDisable);
};

export const useDeleteBooking = (): UseMutationResult<
  string,
  Error,
  string
> => {
  return useMutation(deleteBooking);
};

export const useRegisterCustomer = (): UseMutationResult<
  Customer,
  Error,
  Customer
> => {
  return useMutation(registerCustomer);
};

export const useUpdateCustomer = (): UseMutationResult<
  Customer,
  Error,
  Customer
> => {
  return useMutation(updateCustomer);
};

export const useUpdateUser = (): UseMutationResult<
  RegistrationResponse,
  Error,
  OwnerUpdateRequest
> => {
  return useMutation(updateUser);
};

export const useRegisterUser = (): UseMutationResult<
  RegistrationResponse,
  Error,
  OwnerUpdateRequest
> => {
  return useMutation(registerUser);
};
export const useDeleteUser = (): UseMutationResult<string, Error, string> => {
  return useMutation(deleteUser);
};

export const useRegisterCargo = (): UseMutationResult<Cargo, Error, Cargo> => {
  return useMutation(registerCargo);
};

export const useUpdateCargo = (): UseMutationResult<Cargo, Error, Cargo> => {
  return useMutation(updateCargo);
};
export const useRegisterDriver = (): UseMutationResult<
  Driver,
  Error,
  Driver
> => {
  return useMutation(registerDriver);
};

export const useUpdateDriver = (): UseMutationResult<Driver, Error, Driver> => {
  return useMutation(updateDriver);
};

export const useDeleteDriver = (): UseMutationResult<string, Error, string> => {
  return useMutation(deleteDriver);
};
export const useDeleteCargo = (): UseMutationResult<string, Error, string> => {
  return useMutation(deleteCargo);
};

export const useChangePassword = (): UseMutationResult<
  string,
  Error,
  changePasswordRequest
> => {
  return useMutation(changePassword);
};

export const useChangeUserData = (): UseMutationResult<
  string,
  Error,
  OwnerUpdateRequest
> => {
  return useMutation(changeUserData);
};

export const useDeleteLocation = (): UseMutationResult<
  string,
  Error,
  string
> => {
  return useMutation(deleteLocation);
};

export const useRegisterLocation = (): UseMutationResult<
  any,
  Error,
  Location
> => {
  return useMutation(registerLocation);
};

export const useUpdateLocation = (): UseMutationResult<
  any,
  Error,
  Location
> => {
  return useMutation(updateLocation);
};

export const useForgotPassword = (): UseMutationResult<
  string,
  Error,
  string
> => {
  return useMutation(forgotPassword);
};

export const useOtpValidation = (): UseMutationResult<
  any,
  Error,
  { email: string; otp: string }
> => {
  return useMutation(otpValidation);
};

export const useForgotChangePassword = (): UseMutationResult<
  string,
  Error,
  ForgotPasswordChange
> => {
  return useMutation(forgotChangePassword);
};

export const useRegisterVehicle = (): UseMutationResult<
  Vehicle,
  Error,
  Vehicle
> => {
  return useMutation(registerVehicle);
};

export const useUpdateVehicle = (): UseMutationResult<
  Vehicle,
  Error,
  Vehicle
> => {
  return useMutation(updateVehicle);
};

export const useDeleteVehicle = (): UseMutationResult<
  string,
  Error,
  string
> => {
  return useMutation(deleteVehicle);
};

export const useRegisterVehicleType = (): UseMutationResult<
  VehicleType,
  Error,
  { data: VehicleType; imageFile?: File }
> => {
  return useMutation({
    mutationFn: ({ data, imageFile }) => registerVehicleType(data, imageFile),
  });
};

export const useUpdateVehicleType = (): UseMutationResult<
  VehicleType,
  Error,
  { data: VehicleType; imageFile?: File }
> => {
  return useMutation({
    mutationFn: ({ data, imageFile }) => updateVehicleType(data, imageFile),
  });
};

export const useDeleteVehicleType = (): UseMutationResult<
  string,
  Error,
  string
> => {
  return useMutation(deleteVehicleType);
};

export const useRegisterMaintenanceExpense = (): UseMutationResult<
  MaintenanceExpense,
  Error,
  { data: MaintenanceExpense; imageFile?: File }
> => {
  return useMutation({
    mutationFn: ({ data, imageFile }) =>
      registerMaintenanceExpense(data, imageFile),
  });
};

export const useRegisterFuelExpense = (): UseMutationResult<
  FuelExpense,
  Error,
  { data: FuelExpense; imageFile?: File }
> => {
  return useMutation({
    mutationFn: ({ data, imageFile }) => registerFuelExpense(data, imageFile),
  });
};

export const useUpdateMaintenanceExpense = (): UseMutationResult<
  MaintenanceExpense,
  Error,
  { data: MaintenanceExpense; imageFile?: File }
> => {
  return useMutation({
    mutationFn: ({ data, imageFile }) =>
      updateMaintenanceExpense(data, imageFile),
  });
};

export const useUpdateFuelExpense = (): UseMutationResult<
  FuelExpense,
  Error,
  { data: FuelExpense; imageFile?: File }
> => {
  return useMutation({
    mutationFn: ({ data, imageFile }) => updateFuelExpense(data, imageFile),
  });
};

export const useDeleteMaintenanceExpense = (): UseMutationResult<
  string,
  Error,
  string
> => {
  return useMutation(deleteMaintenanceExpense);
};

export const useDeleteFuelExpense = (): UseMutationResult<
  string,
  Error,
  string
> => {
  return useMutation(deleteFuelExpense);
};

export const useUpdateFuelType = (): UseMutationResult<
  FuelType,
  Error,
  FuelType
> => {
  return useMutation(updateFuelType);
};

export const useDeleteFuelType = (): UseMutationResult<
  string,
  Error,
  string
> => {
  return useMutation(deleteFuelType);
};

export const useRegisterFuelType = (): UseMutationResult<
  FuelType,
  Error,
  FuelType
> => {
  return useMutation(registerFuelType);
};

export const useReadNotifications = (): UseMutationResult<
  string,
  Error,
  {
    userId: string;
    notifications: string[];
  }
> => {
  return useMutation(readNotifications);
};

export const useDeleteGeofence = (): UseMutationResult<
  string,
  Error,
  string
> => {
  return useMutation(deleteGeofence);
};
export const useDeleteFxRate = (): UseMutationResult<string, Error, string> => {
  return useMutation(deleteFxRate);
};
export const useUpdateFxRate = (): UseMutationResult<FXRate, Error, FXRate> => {
  return useMutation(updateFxRate);
};
export const useCreateFxRate = (): UseMutationResult<FXRate, Error, FXRate> => {
  return useMutation(createFxRate);
};

export const useRegisterGeofence = (): UseMutationResult<any, Error, any> => {
  return useMutation(registerGeofence);
};
export const useUpdateGeofence = (): UseMutationResult<any, Error, any> => {
  return useMutation(updateGeofence);
};

export const useAddVehicleToGeofence = (): UseMutationResult<
  any,
  Error,
  { geofenceId: string; vehicleImei: string }
> => {
  return useMutation(addVehicleToGeofence);
};

export const useRemoveVehicleFromGeofence = (): UseMutationResult<
  any,
  Error,
  { geofenceId: string; vehicleImei: string }
> => {
  return useMutation(removeVehicleFromGeofence);
};

export const useReadAllNotifications = (): UseMutationResult<
  string,
  Error,
  string
> => {
  return useMutation(readAllNotifications);
};
export const useUpdatePreferredCurrency = (): UseMutationResult<
  string,
  Error,
  any
> => {
  return useMutation(updatePreferredCurrencyForUser);
};

export const useAssignCargoToTrip = (): UseMutationResult<
  TripCargoResponse,
  Error,
  TripCargoRequest
> => {
  return useMutation({
    mutationFn: assignCargoToTrip,
    onSuccess: () => {
      queryClient.invalidateQueries(["tripCargos"]);
      queryClient.invalidateQueries(["assignedCargos"]);
      queryClient.invalidateQueries(["assignedTrips"]);
    },
  });
};

export const useUnassignCargoFromTrip = (): UseMutationResult<
  string,
  Error,
  TripCargoRequest
> => {
  return useMutation({
    mutationFn: unassignCargoFromTrip,
    onSuccess: () => {
      queryClient.invalidateQueries(["tripCargos"]);
      queryClient.invalidateQueries(["assignedCargos"]);
      queryClient.invalidateQueries(["assignedTrips"]);
    },
  });
};

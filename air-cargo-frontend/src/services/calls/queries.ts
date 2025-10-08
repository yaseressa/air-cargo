import { useQuery } from "react-query";
import { axiosAuthClient, axiosApiClient } from "../clients";
import {
  AuthResponse,
  Cargo,
  CargoResponseType,
  CargoTracking,
  Customer,
  CustomersResponseType,
  File,
  FXRate,
  FxRatesResponseType,
  GraphResponse,
  Location,
  NotificationResponseType,
  User,
  UsersResponseType,
} from "../../utils/types";

const fetchCustomers = async (
  page: number,
  size: number,
  sortBy: string,
  order: "asc" | "desc",
  search: string,
  fromDate: string,
  toDate: string
): Promise<CustomersResponseType> => {
  const { data } = await axiosApiClient.get("/customers", {
    params: {
      page,
      size,
      search,
      sortBy,
      order,
      startDate: fromDate,
      endDate: toDate,
    },
  });
  return data;
};

export const useCustomers = (
  page: number,
  size: number,
  sortBy: string,
  order: "asc" | "desc",
  search: string,
  fromDate: string,
  toDate: string
) => {
  return useQuery<CustomersResponseType>(
    [
      "customers",
      page,
      size,
      sortBy,
      order,
      search,
      fromDate,
      toDate,
    ],
    () => fetchCustomers(page, size, sortBy, order, search, fromDate, toDate),
    {
      keepPreviousData: true,
      onError: (error) => {
        console.error("Error fetching customers:", error);
      },
    }
  );
};

export const fetchCustomer = async (id: string): Promise<Customer> => {
  const { data } = await axiosApiClient.get(`/customers/${id}`);
  return data;
};

const fetchUsers = async (
  page: number,
  size: number,
  sortBy: string,
  order: "asc" | "desc",
  search: string,
  role: string
): Promise<UsersResponseType> => {
  const { data } = await axiosApiClient.get("/users", {
    params: {
      page,
      size,
      search,
      sortBy,
      order,
      userRole: role,
    },
  });
  return data;
};

export const useUsers = (
  page: number,
  size: number,
  search: string,
  role: string,
  sortBy: string = "createdAt",
  order: "asc" | "desc" = "asc"
) => {
  return useQuery<UsersResponseType>(
    ["users", page, size, search, role, sortBy, order],
    () => fetchUsers(page, size, sortBy, order, search, role),
    {
      keepPreviousData: true,
      onError: (error) => {
        console.error("Error fetching users:", error);
      },
    }
  );
};

const fetchCargos = async (
  page: number,
  size: number,
  sortBy: string,
  order: "asc" | "desc",
  search: string,
  fromDate: string,
  toDate: string,
  pickupLocation: string,
  destination: string
): Promise<CargoResponseType> => {
  const { data } = await axiosApiClient.get("/cargos", {
    params: {
      page,
      size,
      search,
      sortBy,
      order,
      startDate: fromDate,
      endDate: toDate,
      pickupLocation,
      destination,
    },
  });
  return data;
};

export const useCargos = (
  page: number,
  size: number,
  sortBy: string,
  order: "asc" | "desc",
  search: string,
  fromDate: string,
  toDate: string,
  pickupLocation: string,
  destination: string
) => {
  return useQuery<CargoResponseType>(
    [
      "cargos",
      page,
      size,
      sortBy,
      order,
      search,
      fromDate,
      toDate,
      pickupLocation,
      destination,
    ],
    () =>
      fetchCargos(
        page,
        size,
        sortBy,
        order,
        search,
        fromDate,
        toDate,
        pickupLocation,
        destination
      ),
    {
      keepPreviousData: true,
      onError: (error) => {
        console.error("Error fetching cargos:", error);
      },
    }
  );
};

const fetchCargo = async (id: string): Promise<Cargo> => {
  const { data } = await axiosApiClient.get(`/cargos/${id}`);
  return data;
};

export const useCargo = (id?: string) => {
  return useQuery<Cargo | undefined>(
    ["cargo", id],
    () => fetchCargo(id!),
    {
      enabled: !!id,
      onError: (error) => {
        console.error("Error fetching cargo:", error);
      },
    }
  );
};

export const fetchCargoPhotos = async (id: string): Promise<File[]> => {
  const { data } = await axiosApiClient.get(`/cargos/${id}/files`);
  return data;
};

export const useCargoPhotos = (id: string) => {
  return useQuery<File[]>(["cargoPhotos", id], () => fetchCargoPhotos(id), {
    enabled: !!id,
    onError: (error) => {
      console.error("Error fetching cargo photos:", error);
    },
  });
};

const fetchCargoTrackingInformation = async (
  id: string
): Promise<CargoTracking[]> => {
  const { data } = await axiosApiClient.get(`/cargos/tracking/${id}`);
  return data;
};

export const useCargoTrackingInformation = (id?: string) => {
  return useQuery<CargoTracking[]>(
    ["cargoTracking", id],
    () => fetchCargoTrackingInformation(id!),
    {
      enabled: !!id,
      onError: (error) => {
        console.error("Error fetching cargo tracking information:", error);
      },
    }
  );
};

const fetchPublicCargoTrackingInformation = async (
  id: string
): Promise<CargoTracking[]> => {
  const { data } = await axiosApiClient.get(`/cargos/tracking/public/${id}`);
  return data;
};

export const usePublicCargoTrackingInformation = (id: string) => {
  return useQuery<CargoTracking[]>(
    ["publicCargoTracking", id],
    () => fetchPublicCargoTrackingInformation(id),
    {
      enabled: !!id,
      onError: (error) => {
        console.error("Error fetching public cargo tracking information:", error);
      },
    }
  );
};

const fetchSendCargoInformation = async (id: string): Promise<string> => {
  const { data } = await axiosApiClient.get(`/cargos/send-cargo-info/${id}`);
  return data;
};

export const useSendCargoInformation = (id?: string) => {
  return useQuery<
    string,
    Error
  >(["sendCargoInfo", id], () => fetchSendCargoInformation(id!), {
    enabled: !!id,
    onError: (error) => {
      console.error("Error sending cargo information:", error);
    },
  });
};

const fetchLocations = async (): Promise<Location[]> => {
  const { data } = await axiosApiClient.get("/locations");
  return data;
};

export const useLocations = () => {
  return useQuery<Location[]>("locations", fetchLocations, {
    staleTime: 1000,
    onError: (error) => {
      console.error("Error fetching locations:", error);
    },
  });
};

const fetchFxRates = async (
  page: number,
  size: number,
  sortBy: string,
  order: "asc" | "desc",
  search: string
): Promise<FxRatesResponseType> => {
  const { data } = await axiosApiClient.get("/fx-rates", {
    params: {
      page,
      size,
      search,
      sortBy,
      order,
    },
  });
  return data;
};

export const useFxRates = (
  page: number,
  size: number,
  sortBy: string,
  order: "asc" | "desc",
  search: string
) => {
  return useQuery<FxRatesResponseType>(
    ["fxRates", page, size, sortBy, order, search],
    () => fetchFxRates(page, size, sortBy, order, search),
    {
      keepPreviousData: true,
      onError: (error) => {
        console.error("Error fetching FX rates:", error);
      },
    }
  );
};

const fetchLoggedInUser = async (email: string): Promise<AuthResponse> => {
  const encodedEmail = encodeURIComponent(email);
  const { data } = await axiosAuthClient.get(`/${encodedEmail}`);
  return data;
};

export const useLoggedInUser = (email: string) => {
  return useQuery<AuthResponse, Error>(
    ["loggedInUser", email],
    () => fetchLoggedInUser(email),
    {
      enabled: !!email,
    }
  );
};

const fetchUnreadNotifications = async (
  id: string,
  page: number,
  size: number
): Promise<NotificationResponseType> => {
  const { data } = await axiosApiClient.get(`/notifications/unread/${id}`, {
    params: {
      page,
      size,
    },
  });
  return data;
};

const fetchCountUnreadNotifications = async (id: string): Promise<number> => {
  const { data } = await axiosApiClient.get(`/notifications/unread/${id}/count`);
  return data;
};

export const useUnreadNotifications = (
  id: string,
  page: number,
  size: number,
  enabled: boolean
) => {
  return useQuery<NotificationResponseType>(
    ["unreadNotifications", id, page],
    () => fetchUnreadNotifications(id, page, size),
    {
      enabled: enabled && !!id,
      keepPreviousData: true,
    }
  );
};

export const useUnreadNotificationsCount = (id: string, enabled: boolean) => {
  return useQuery<number>(
    ["unreadNotificationsCount", id],
    () => fetchCountUnreadNotifications(id),
    {
      enabled: enabled && !!id,
    }
  );
};

const fetchCargoCount = async (month: string | number): Promise<number> => {
  const { data } = await axiosApiClient.get("/analytics/cargo", {
    params: { month },
  });
  return data;
};

export const useCargoCount = (month: string | number) => {
  return useQuery<number>(["cargoCount", month], () => fetchCargoCount(month), {
    onError: (error) => {
      console.error("Error fetching cargo count:", error);
    },
  });
};

const fetchCargoCustomerCount = async (month: string | number): Promise<number> => {
  const { data } = await axiosApiClient.get("/analytics/cargo/customers", {
    params: { month },
  });
  return data;
};

export const useCargoCustomerCount = (month: string | number) => {
  return useQuery<number>(
    ["cargoCustomerCount", month],
    () => fetchCargoCustomerCount(month),
    {
      onError: (error) => {
        console.error("Error fetching cargo customer count:", error);
      },
    }
  );
};

const fetchCargoGraph = async (
  month: string | number
): Promise<GraphResponse> => {
  const { data } = await axiosApiClient.get("/analytics/cargo/graph", {
    params: { month },
  });
  return data;
};

export const useCargoGraph = (month: string | number) => {
  return useQuery<GraphResponse>(["cargoGraph", month], () => fetchCargoGraph(month), {
    onError: (error) => {
      console.error("Error fetching cargo graph:", error);
    },
  });
};

const fetchCargoCustomerGraph = async (
  month: string | number
): Promise<GraphResponse> => {
  const { data } = await axiosApiClient.get("/analytics/cargo/customers/graph", {
    params: { month },
  });
  return data;
};

export const useCargoCustomerGraph = (month: string | number) => {
  return useQuery<GraphResponse>(
    ["cargoCustomerGraph", month],
    () => fetchCargoCustomerGraph(month),
    {
      onError: (error) => {
        console.error("Error fetching cargo customer graph:", error);
      },
    }
  );
};

const fetchSupportedCurrencies = async (): Promise<string[]> => {
  const { data } = await axiosApiClient.get("/fx-rates/supported-currencies");
  return data;
};

export const useSupportedCurrencies = () => {
  return useQuery<string[]>(
    ["supportedCurrencies"],
    () => fetchSupportedCurrencies(),
    {
      onError: (error) => {
        console.error("Error fetching supported currencies:", error);
      },
    }
  );
};

export const useCustomer = (id?: string) => {
  return useQuery<Customer | undefined>(
    ["customer", id],
    () => fetchCustomer(id!),
    {
      enabled: !!id,
      onError: (error) => {
        console.error("Error fetching customer:", error);
      },
    }
  );
};


const fetchCustomerByPhone = async (phone: string): Promise<Customer> => {
  const encodedPhone = encodeURIComponent(phone);
  const { data } = await axiosApiClient.get(`/customers/phone/${encodedPhone}`);
  return data;
};

export const useCustomerByPhone = (phone?: string) => {
  return useQuery<Customer | undefined>(
    ["customerByPhone", phone],
    () => fetchCustomerByPhone(phone!),
    {
      enabled: !!phone,
      onError: (error) => {
        console.error("Error fetching customer by phone:", error);
      },
    }
  );
};





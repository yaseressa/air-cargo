import {
  CustomersResponseType,
  UserStore,
  LoggedUserStore,
  Customer,
  CustomerStore,
  User,
  UsersResponseType,
  Cargo,
  CargoStore,
  CargoResponseType,
  Location,
  File,
  GraphResponse,
  CargoTracking,
  Notification,
  NotificationResponseType,
  FxRatesResponseType,
  FXRate,
  PickupCityRevenueReport,
  CargoTypeSummaryReport,
  ExpenseCurrencySummary,
  ExpenseMonthlyTrend,
} from "./types";
import { ColumnDef } from "@/components/data-table";
import { create } from "zustand";
import { persist } from "zustand/middleware";
type CutomersStoreProps = {
  data?: CustomersResponseType;
  columns: ColumnDef[];
  currentPage: number;
  perPage: number;
  totalElements: number;
  totalPages: number;
  sortBy: string;
  order: "asc" | "desc";
  updateCustomer: (updatedData: Customer) => void;
  searchCriteria?: string;
  fromDate: string;
  toDate: string;
  put: (input?: CustomersResponseType) => void;
  clear: () => void;
  setPageNo: (pageNo: number) => void;
  resetPageNo: () => void;
  setPerPage: (perPage: number) => void;
  setTotalElements: (totalElements: number) => void;
  setTotalPages: (totalPages: number) => void;
  setSearchCriteria: (criteria: string) => void;
  setFromDate: (date: string) => void;
  setSortBy: (sortBy: string) => void;
  setOrder: () => void;
  setToDate: (date: string) => void;
  setColumns: (columns: ColumnDef[]) => void;
  deleteCustomer: (id: string) => void;
  addCustomer: (customer: Customer) => void;
};

export const useCustomersStore = create<CutomersStoreProps>((set) => ({
  data: undefined,
  currentPage: 0,
  perPage: 5,
  totalElements: 0,
  totalPages: 0,
  columns: [],
  searchCriteria: "",
  sortBy: "createdAt",
  order: "desc",
  fromDate: "",
  toDate: "",
  put: (input?: CustomersResponseType) =>
    set(() => ({
      data: input,
    })),
  clear: () => set(() => ({ data: undefined })),

  setPageNo: (pageNo) =>
    set((state) => ({ currentPage: state.currentPage + pageNo })),
  resetPageNo: () => set(() => ({ currentPage: 0 })),

  setPerPage: (perPage) => set({ perPage }),
  setTotalElements: (totalElements) => set({ totalElements }),
  setTotalPages: (totalPages) => set({ totalPages }),

  setSearchCriteria: (criteria: string) =>
    set(() => ({ searchCriteria: criteria })),
  setFromDate: (date: string) =>
    set(() => ({
      fromDate: date,
    })),
  setToDate: (date: string) =>
    set(() => ({
      toDate: date,
    })),
  setSortBy: (sortBy) => set({ sortBy }),
  setOrder: () =>
    set((state) => ({ order: state.order === "asc" ? "desc" : "asc" })),

  setColumns: (columns: ColumnDef[]) =>
    set(() => ({
      columns,
    })),
  deleteCustomer: (id: string) =>
    set((state) => ({
      data: {
        ...state.data,
        content: state.data?.content.filter((customer) => customer.id !== id)!,
      },
    })),
  updateCustomer: (updatedData) =>
    set((state) => ({
      data: state.data
        ? {
            ...state.data,
            content: state.data?.content.map((customer) =>
              customer.id === updatedData.id ? updatedData : customer
            ),
          }
        : undefined,
    })),
  addCustomer: (customer) =>
    set((state) => ({
      data: state.data
        ? {
            ...state.data,
            content: [customer, ...state.data.content],
          }
        : undefined,
    })),
}));

export const useLoggedUserStore = create<LoggedUserStore>((set) => ({
  user: {
    id: undefined,
    firstName: undefined,
    lastName: undefined,
    email: undefined,
    phoneNumber: undefined,
    otp: undefined,
    preferredCurrencyCode: undefined,
    gender: undefined,
    loading: true,
    roles: undefined,
  },
  setUser: (newUser) =>
    set((state) => ({ user: { ...state.user, ...newUser, loading: false } })),
  setLoading: (loading) =>
    set((state) => ({ user: { ...state.user, loading } })),
  resetUser: () =>
    set(() => ({
      user: {
        firstName: undefined,
        lastName: undefined,
        email: undefined,
        phoneNumber: undefined,
        token: undefined,
        otp: undefined,
        gender: undefined,
        preferredCurrencyCode: undefined,
        loading: true,
        roles: [],
      },
    })),
}));

interface ModalNumber {
  modalNumber: number;
  type: "create" | "update";
  setModalNumberAndType: (number?: number, type?: "create" | "update") => void;
}

export const useModalNumber = create<ModalNumber>((set) => ({
  modalNumber: 0,
  type: "create",
  setModalNumberAndType: (number, type) =>
    set((state) => ({ ...state, modalNumber: number, type })),
}));

export const useSelectedUserStore = create<UserStore>((set) => ({
  user: undefined,
  setUser: (user) => set(() => ({ user })),
  resetOwner: () => set(() => ({ user: undefined })),
}));

type useSelectedFxRateType = {
  fxRate?: FXRate;
  setFxRate: (fxRate: Partial<FXRate>) => void;
  resetFxRate: () => void;
};
export const useSelectedFxRateStore = create<useSelectedFxRateType>((set) => ({
  fxRate: undefined,
  setFxRate: (fxRate: FXRate) => set(() => ({ fxRate })),
  resetFxRate: () => set(() => ({ fxRate: undefined })),
}));
export const useSelectedCustomerStore = create<CustomerStore>((set) => ({
  customer: undefined,
  setCustomer: (customer) => {
    return set(() => ({ customer }));
  },
  deleteReceivedCargo: (id: string) =>
    set((state) => ({
      customer: {
        ...state.customer,
        receivedCargos: state.customer?.receivedCargo!.filter(
          (cargo) => cargo.id !== id
        )!,
      },
    })),

  deleteSentCargo: (id: string) =>
    set((state) => ({
      customer: {
        ...state.customer,
        sentCargos: state.customer?.sentCargo!.filter((cargo) => {
          return cargo.id !== id;
        })!,
      },
    })),

  resetCustomer: () => set(() => ({ customer: undefined })),
}));
export const useSenderStore = create<CustomerStore>((set) => ({
  customer: undefined,
  setCustomer: (customer) => set(() => ({ customer })),
  resetCustomer: () => set(() => ({ customer: undefined })),
  deleteReceivedCargo: (id: string) =>
    set((state) => ({
      customer: {
        ...state.customer,
        receivedCargos: state.customer?.receivedCargo!.filter(
          (cargo) => cargo.id !== id
        )!,
      },
    })),
  deleteSentCargo: (id: string) =>
    set((state) => ({
      customer: {
        ...state.customer,
        sentCargos: state.customer?.sentCargo!.filter(
          (cargo) => cargo.id !== id
        )!,
      },
    })),
}));
export const useReceiverStore = create<CustomerStore>((set) => ({
  customer: undefined,
  setCustomer: (customer) => set(() => ({ customer })),
  resetCustomer: () => set(() => ({ customer: undefined })),
  deleteReceivedCargo: (id: string) =>
    set((state) => ({
      customer: {
        ...state.customer,
        receivedCargos: state.customer?.receivedCargo!.filter(
          (cargo) => cargo.id !== id
        )!,
      },
    })),
  deleteSentCargo: (id: string) =>
    set((state) => ({
      customer: {
        ...state.customer,
        sentCargos: state.customer?.sentCargo!.filter(
          (cargo) => cargo.id !== id
        )!,
      },
    })),
}));
export const useSelectedCargoStore = create<CargoStore>((set) => ({
  cargo: undefined,
  setCargo: (cargo) => set(() => ({ cargo })),
  resetCargo: () => set(() => ({ cargo: undefined })),
}));
type UsersStoreProps = {
  data?: UsersResponseType;
  columns: ColumnDef[];
  currentPage: number;
  perPage: number;
  totalElements: number;
  totalPages: number;
  sortBy: string;
  order: "asc" | "desc";
  updateUsers: (updatedData: User) => void;
  filter?: string;
  searchCriteria?: string;
  put: (input?: UsersResponseType) => void;
  clear: () => void;
  setPageNo: (pageNo: number) => void;
  resetPageNo: () => void;
  setPerPage: (perPage: number) => void;
  setTotalElements: (totalElements: number) => void;
  setTotalPages: (totalPages: number) => void;
  setSearchCriteria: (criteria: string) => void;
  setSortBy: (sortBy: string) => void;
  setOrder: () => void;
  setFilter: (filter: string) => void;
  setColumns: (columns: ColumnDef[]) => void;
  deleteUser: (id: string) => void;
  addUser: (user: User) => void;
};

export const useUsersStore = create<UsersStoreProps>((set) => ({
  data: undefined,
  currentPage: 0,
  perPage: 5,
  totalElements: 0,
  totalPages: 0,
  columns: [],
  searchCriteria: "",
  sortBy: "createdAt",
  order: "desc",
  filter: "",
  put: (input?: UsersResponseType) =>
    set(() => ({
      data: input,
    })),
  clear: () => set(() => ({ data: undefined })),

  setPageNo: (pageNo) =>
    set((state) => ({ currentPage: state.currentPage + pageNo })),
  resetPageNo: () => set(() => ({ currentPage: 0 })),

  setPerPage: (perPage) => set({ perPage }),
  setTotalElements: (totalElements) => set({ totalElements }),
  setTotalPages: (totalPages) => set({ totalPages }),

  setSearchCriteria: (criteria: string) =>
    set(() => ({ searchCriteria: criteria })),
  setSortBy: (sortBy) => set({ sortBy }),
  setOrder: () =>
    set((state) => ({ order: state.order === "asc" ? "desc" : "asc" })),

  setColumns: (columns: ColumnDef[]) =>
    set(() => ({
      columns,
    })),
  deleteUser: (id: string) =>
    set((state) => ({
      data: {
        ...state.data,
        content: state.data?.content.filter((user) => user.id !== id)!,
      },
    })),
  updateUsers: (updatedData) =>
    set((state) => ({
      data: state.data
        ? {
            ...state.data,
            content: state.data?.content.map((user) =>
              user.id === updatedData.id ? updatedData : user
            ),
          }
        : undefined,
    })),
  setFilter: (filter) => set(() => ({ filter })),
  addUser: (user) =>
    set((state) => ({
      data: state.data
        ? {
            ...state.data,
            content: [user, ...state.data.content],
          }
        : undefined,
    })),
}));

export type CargoStoreProps = {
  data?: CargoResponseType;
  columns: ColumnDef[];
  currentPage: number;
  perPage: number;
  totalElements: number;
  totalPages: number;
  sortBy: string;
  destination: string;
  pickupLocation: string;
  order: "asc" | "desc";
  updateCargo: (updatedData: Cargo) => void;
  searchCriteria?: string;
  fromDate: string;
  toDate: string;
  put: (input?: CargoResponseType) => void;
  clear: () => void;
  setPageNo: (pageNo: number) => void;
  resetPageNo: () => void;
  setPerPage: (perPage: number) => void;
  setTotalElements: (totalElements: number) => void;
  setTotalPages: (totalPages: number) => void;
  setSearchCriteria: (criteria: string) => void;
  setFromDate: (date: string) => void;
  setSortBy: (sortBy: string) => void;
  setOrder: () => void;
  setToDate: (date: string) => void;
  setPickupLocation: (location: string) => void;
  setDestination: (location: string) => void;
  setColumns: (columns: ColumnDef[]) => void;
  deleteCargo: (id: string) => void;
  addCargo: (cargo: Cargo) => void;
};

export const useAllCargoStore = create<CargoStoreProps>((set) => ({
  data: undefined,
  currentPage: 0,
  perPage: 5,
  totalElements: 0,
  totalPages: 0,
  columns: [],
  searchCriteria: "",
  sortBy: "createdAt",
  order: "desc",
  destination: "",
  pickupLocation: "",
  fromDate: "",
  toDate: "",
  put: (input?: CargoResponseType) =>
    set(() => ({
      data: input,
    })),
  clear: () => set(() => ({ data: undefined })),

  setPageNo: (pageNo) =>
    set((state) => ({ currentPage: state.currentPage + pageNo })),
  resetPageNo: () => set(() => ({ currentPage: 0 })),

  setPerPage: (perPage) => set({ perPage }),
  setTotalElements: (totalElements) => set({ totalElements }),
  setTotalPages: (totalPages) => set({ totalPages }),

  setSearchCriteria: (criteria: string) =>
    set(() => ({ searchCriteria: criteria })),
  setFromDate: (date: string) =>
    set(() => ({
      fromDate: date,
    })),
  setToDate: (date: string) =>
    set(() => ({
      toDate: date,
    })),
  setPickupLocation: (location: string) =>
    set(() => ({
      pickupLocation: location,
    })),
  setDestination: (location: string) =>
    set(() => ({
      destination: location,
    })),
  setSortBy: (sortBy) => set({ sortBy }),
  setOrder: () =>
    set((state) => ({ order: state.order === "asc" ? "desc" : "asc" })),

  setColumns: (columns: ColumnDef[]) =>
    set(() => ({
      columns,
    })),
  deleteCargo: (id: string) =>
    set((state) => ({
      data: {
        ...state.data,
        content: state.data?.content.filter((cargo) => cargo.id !== id)!,
      },
    })),
  updateCargo: (updatedData) =>
    set((state) => ({
      data: state.data
        ? {
            ...state.data,
            content: state.data?.content.map((cargo) =>
              cargo.id === updatedData.id ? updatedData : cargo
            ),
          }
        : undefined,
    })),
  addCargo: (cargo) =>
    set((state) => ({
      data: state.data
        ? {
            ...state.data,
            content: [cargo, ...state.data.content],
          }
        : undefined,
    })),
}));
type ForgotPassword = {
  forgotPassword?: {
    email: string;
    otp: string;
    validated: boolean;
  };
  setValidated: (valid: boolean) => void;
  setEmail: (email: string) => void;
  setOtp: (otp: string) => void;
  reset: () => void;
};

export const useForgotPasswordStore = create<ForgotPassword>((set) => ({
  forgotPassword: {
    email: "",
    otp: "",
    validated: false,
  },
  setEmail: (email) =>
    set((state) => ({ forgotPassword: { ...state.forgotPassword!, email } })),
  setOtp: (otp) =>
    set((state) => ({ forgotPassword: { ...state.forgotPassword!, otp } })),
  setValidated: (validated) =>
    set((state) => ({
      forgotPassword: { ...state.forgotPassword!, validated },
    })),
  reset: () =>
    set(() => ({ forgotPassword: { email: "", otp: "", validated: false } })),
}));

type CustomerCargoTableStoreProps = {
  data?: CargoResponseType;
  columns: ColumnDef[];
  currentPage: number;
  perPage: number;
  totalElements: number;
  totalPages: number;
  sortBy: string;
  order: "asc" | "desc";
  searchCriteria: string;
  put: (input?: CargoResponseType) => void;
  clear: () => void;
  setPageNo: (pageNo: number) => void;
  resetPageNo: () => void;
  setPerPage: (perPage: number) => void;
  setTotalElements: (totalElements: number) => void;
  setTotalPages: (totalPages: number) => void;
  setSearchCriteria: (criteria: string) => void;
  setSortBy: (sortBy: string) => void;
  setOrder: () => void;
  setColumns: (columns: ColumnDef[]) => void;
};

const createCustomerCargoTableStore = () =>
  create<CustomerCargoTableStoreProps>((set) => ({
    data: undefined,
    columns: [],
    currentPage: 0,
    perPage: 5,
    totalElements: 0,
    totalPages: 0,
    sortBy: "createdAt",
    order: "desc",
    searchCriteria: "",
    put: (input) =>
      set(() => ({
        data: input,
      })),
    clear: () => set(() => ({ data: undefined })),
    setPageNo: (pageNo) =>
      set((state) => ({ currentPage: Math.max(state.currentPage + pageNo, 0) })),
    resetPageNo: () => set(() => ({ currentPage: 0 })),
    setPerPage: (perPage) => set(() => ({ perPage })),
    setTotalElements: (totalElements) => set(() => ({ totalElements })),
    setTotalPages: (totalPages) => set(() => ({ totalPages })),
    setSearchCriteria: (criteria) => set(() => ({ searchCriteria: criteria })),
    setSortBy: (sortBy) => set(() => ({ sortBy })),
    setOrder: () =>
      set((state) => ({
        order: state.order === "asc" ? "desc" : "asc",
      })),
    setColumns: (columns) =>
      set(() => ({
        columns,
      })),
  }));

export const useCustomerSentCargoTableStore = createCustomerCargoTableStore();

export const useCustomerReceivedCargoTableStore = createCustomerCargoTableStore();

type CustomerReportStoreProps = {
  data?: CustomersResponseType;
  columns: ColumnDef[];
  currentPage: number;
  perPage: number;
  totalElements: number;
  totalPages: number;
  sortBy: string;
  order: "asc" | "desc";
  searchCriteria: string;
  fromDate: string;
  toDate: string;
  put: (input?: CustomersResponseType) => void;
  clear: () => void;
  setPageNo: (pageNo: number) => void;
  resetPageNo: () => void;
  setPerPage: (perPage: number) => void;
  setTotalElements: (totalElements: number) => void;
  setTotalPages: (totalPages: number) => void;
  setSearchCriteria: (criteria: string) => void;
  setSortBy: (sortBy: string) => void;
  setOrder: () => void;
  setFromDate: (date: string) => void;
  setToDate: (date: string) => void;
  setColumns: (columns: ColumnDef[]) => void;
};

export const useCustomerReportsStore = create<CustomerReportStoreProps>((set) => ({
  data: undefined,
  columns: [],
  currentPage: 0,
  perPage: 5,
  totalElements: 0,
  totalPages: 0,
  sortBy: "createdAt",
  order: "desc",
  searchCriteria: "",
  fromDate: "",
  toDate: "",
  put: (input) =>
    set(() => ({
      data: input,
    })),
  clear: () => set(() => ({ data: undefined })),
  setPageNo: (pageNo) =>
    set((state) => ({ currentPage: Math.max(state.currentPage + pageNo, 0) })),
  resetPageNo: () => set(() => ({ currentPage: 0 })),
  setPerPage: (perPage) => set(() => ({ perPage })),
  setTotalElements: (totalElements) => set(() => ({ totalElements })),
  setTotalPages: (totalPages) => set(() => ({ totalPages })),
  setSearchCriteria: (criteria) => set(() => ({ searchCriteria: criteria })),
  setSortBy: (sortBy) => set(() => ({ sortBy })),
  setOrder: () =>
    set((state) => ({ order: state.order === "asc" ? "desc" : "asc" })),
  setFromDate: (date) => set(() => ({ fromDate: date })),
  setToDate: (date) => set(() => ({ toDate: date })),
  setColumns: (columns) =>
    set(() => ({
      columns,
    })),
}));

type CargoReportStoreProps = {
  data?: CargoResponseType;
  columns: ColumnDef[];
  currentPage: number;
  perPage: number;
  totalElements: number;
  totalPages: number;
  sortBy: string;
  order: "asc" | "desc";
  searchCriteria: string;
  fromDate: string;
  toDate: string;
  put: (input?: CargoResponseType) => void;
  clear: () => void;
  setPageNo: (pageNo: number) => void;
  resetPageNo: () => void;
  setPerPage: (perPage: number) => void;
  setTotalElements: (totalElements: number) => void;
  setTotalPages: (totalPages: number) => void;
  setSearchCriteria: (criteria: string) => void;
  setSortBy: (sortBy: string) => void;
  setOrder: () => void;
  setFromDate: (date: string) => void;
  setToDate: (date: string) => void;
  setColumns: (columns: ColumnDef[]) => void;
};

export const useCargoReportsStore = create<CargoReportStoreProps>((set) => ({
  data: undefined,
  columns: [],
  currentPage: 0,
  perPage: 5,
  totalElements: 0,
  totalPages: 0,
  sortBy: "createdAt",
  order: "desc",
  searchCriteria: "",
  fromDate: "",
  toDate: "",
  put: (input) =>
    set(() => ({
      data: input,
    })),
  clear: () => set(() => ({ data: undefined })),
  setPageNo: (pageNo) =>
    set((state) => ({ currentPage: Math.max(state.currentPage + pageNo, 0) })),
  resetPageNo: () => set(() => ({ currentPage: 0 })),
  setPerPage: (perPage) => set(() => ({ perPage })),
  setTotalElements: (totalElements) => set(() => ({ totalElements })),
  setTotalPages: (totalPages) => set(() => ({ totalPages })),
  setSearchCriteria: (criteria) => set(() => ({ searchCriteria: criteria })),
  setSortBy: (sortBy) => set(() => ({ sortBy })),
  setOrder: () =>
    set((state) => ({ order: state.order === "asc" ? "desc" : "asc" })),
  setFromDate: (date) => set(() => ({ fromDate: date })),
  setToDate: (date) => set(() => ({ toDate: date })),
  setColumns: (columns) =>
    set(() => ({
      columns,
    })),
}));

type AggregateReportStoreProps<T> = {
  data?: T[];
  columns: ColumnDef[];
  searchCriteria: string;
  fromDate: string;
  toDate: string;
  put: (input?: T[]) => void;
  clear: () => void;
  setSearchCriteria: (criteria: string) => void;
  setFromDate: (date: string) => void;
  setToDate: (date: string) => void;
  setColumns: (columns: ColumnDef[]) => void;
};

const createAggregateReportStore = <T,>() =>
  create<AggregateReportStoreProps<T>>((set) => ({
    data: undefined,
    columns: [],
    searchCriteria: "",
    fromDate: "",
    toDate: "",
    put: (input) =>
      set(() => ({
        data: input,
      })),
    clear: () => set(() => ({ data: undefined })),
    setSearchCriteria: (criteria) => set(() => ({ searchCriteria: criteria })),
    setFromDate: (date) => set(() => ({ fromDate: date })),
    setToDate: (date) => set(() => ({ toDate: date })),
    setColumns: (columns) =>
      set(() => ({
        columns,
      })),
  }));

export const usePickupRevenueReportStore =
  createAggregateReportStore<PickupCityRevenueReport>();

export const useCargoTypeDistributionReportStore =
  createAggregateReportStore<CargoTypeSummaryReport>();

export const useExpenseCurrencySummaryStore =
  createAggregateReportStore<ExpenseCurrencySummary>();

export const useExpenseMonthlyTrendStore =
  createAggregateReportStore<ExpenseMonthlyTrend>();

type LocationStoreProps = {
  data?: Location[];
  columns: ColumnDef[];
  setColumns: (columns: ColumnDef[]) => void;
  put: (input?: Location[]) => void;
  clear: () => void;
  deleteLocation: (id: string) => void;
  addLocation: (location: Location) => void;
};

export const useLocationsStore = create<LocationStoreProps>((set) => ({
  data: undefined,
  columns: [],
  put: (input?: Location[]) =>
    set(() => ({
      data: input,
    })),
  clear: () => set(() => ({ data: undefined })),
  setColumns: (columns: ColumnDef[]) =>
    set(() => ({
      columns,
    })),
  deleteLocation: (id: string) =>
    set((state) => ({
      data: state.data?.filter((location) => location.id !== id)!,
    })),
  addLocation: (location) =>
    set((state) => ({
      data: [location, ...state.data!],
    })),
}));

type LocationStore = {
  location?: Location;
  setLocation: (location: Location) => void;
  resetLocation: () => void;
};

export const useLocationStore = create<LocationStore>((set) => ({
  location: undefined,
  setLocation: (location) => set(() => ({ location })),
  resetLocation: () => set(() => ({ location: undefined })),
}));

type ToggleCreateStore = {
  create: boolean;
  setCreate: (create: boolean) => void;
};
export const useToggleCreateStore = create<ToggleCreateStore>((set) => ({
  create: false,
  setCreate: (create) => set(() => ({ create })),
}));
type useFilesStoreType = {
  files: File[];
  setFiles: (files: File[]) => void;
  deleteFile: (id: string) => void;
  resetFiles: () => void;
};
export const useFilesStore = create<useFilesStoreType>((set) => ({
  files: [],
  setFiles: (files) => set(() => ({ files })),
  deleteFile: (id) =>
    set((state) => ({
      files: state.files.filter((file) => file.id !== id),
    })),
  resetFiles: () => set(() => ({ files: [] })),
}));
type useNumberOfCargosCreated = {
  numberOfCargos: number;
  incrementNumberOfCargos: () => void;
  reset: () => void;
};
export const useNumberOfCargosCreated = create<useNumberOfCargosCreated>(
  (set) => ({
    numberOfCargos: 0,
    incrementNumberOfCargos: () =>
      set((state) => ({ numberOfCargos: state.numberOfCargos + 1 })),
    reset: () => set(() => ({ numberOfCargos: 0 })),
  })
);

type useCurrentContainerStoreType = {
  container?: HTMLElement;
  setContainer: (container: HTMLElement) => void;
  resetContainer: () => void;
};

export const useCurrentContainerStore = create<useCurrentContainerStoreType>(
  (set) => ({
    container: undefined,
    setContainer: (container) => set(() => ({ container })),
    resetContainer: () => set(() => ({ container: undefined })),
  })
);

type useDashboardNumberOfMonthsStoreType = {
  numberOfMonths: number | string;
  setNumberOfMonths: (numberOfMonths: number | string) => void;
};

export const useDashboardNumberOfMonthsStore =
  create<useDashboardNumberOfMonthsStoreType>((set) => ({
    numberOfMonths: 7 / 30,
    setNumberOfMonths: (numberOfMonths) => set(() => ({ numberOfMonths })),
  }));

interface CargoState {
  cargoCount: number;
  cargoCustomerCount: number;
  cargoGraph: GraphResponse | null;
  cargoCustomerGraph: GraphResponse | null;
  setCargoCount: (data: number) => void;
  setCargoCustomerCount: (data: number) => void;
  setCargoGraph: (data: GraphResponse) => void;
  setCargoCustomerGraph: (data: GraphResponse) => void;
}

export const useCargoStore = create<CargoState>((set) => ({
  cargoCount: 0,
  cargoCustomerCount: 0,
  cargoGraph: null,
  cargoCustomerGraph: null,
  setCargoCount: (data) => set({ cargoCount: data }),
  setCargoCustomerCount: (data) => set({ cargoCustomerCount: data }),
  setCargoGraph: (data) => set({ cargoGraph: data }),
  setCargoCustomerGraph: (data) => set({ cargoCustomerGraph: data }),
}));

type useLoadingStoreType = {
  loading: boolean;
  setLoading: (loading: boolean) => void;
};

export const useLoadingStore = create<useLoadingStoreType>((set) => ({
  loading: false,
  setLoading: (loading) => set({ loading }),
}));

type useSidebarStoreType = {
  open: boolean;
  toggle: () => void;
};

export const useSidebarStore = create<useSidebarStoreType>((set) => ({
  open: true,
  toggle: () => set((state) => ({ open: !state.open })),
}));

type useCargoTrackingsStoreType = {
  data?: CargoTracking[];
  put: (input?: CargoTracking[]) => void;
  clear: () => void;
  deleteCargoTracking: (id: string) => void;
  addCargoTracking: (cargoTracking: CargoTracking) => void;
  updateCargoTracking: (updatedData: CargoTracking) => void;
};

export const useCargoTrackingsStore = create<useCargoTrackingsStoreType>(
  (set) => ({
    data: undefined,
    put: (input?: CargoTracking[]) =>
      set(() => ({
        data: input,
      })),
    clear: () => set(() => ({ data: undefined })),
    deleteCargoTracking: (id: string) =>
      set((state) => ({
        data: state.data?.filter((cargoTracking) => cargoTracking.id !== id)!,
      })),
    addCargoTracking: (cargoTracking) =>
      set((state) => ({
        data: [...state.data!, cargoTracking],
      })),
    updateCargoTracking: (updatedData) =>
      set((state) => ({
        data: state.data?.map((cargoTracking) =>
          cargoTracking.id === updatedData.id ? updatedData : cargoTracking
        ),
      })),
  })
);

type useSelectedCargoTrackingStoreType = {
  cargoTracking?: CargoTracking;
  setCargoTracking: (cargo: CargoTracking) => void;
  resetCargoTracking: () => void;
};

export const useSelectedCargoTrackingStore =
  create<useSelectedCargoTrackingStoreType>((set) => ({
    cargoTracking: undefined,
    setCargoTracking: (cargoTracking) => set(() => ({ cargoTracking })),
    resetCargoTracking: () => set(() => ({ cargoTracking: undefined })),
  }));

type useDefaultLanguageStoreType = {
  defaultLanguage: string;
  setDefaultLanguage: (language: string) => void;
  getDefualtLanguage: () => string;
};

export const useDefaultLanguageStore = create<useDefaultLanguageStoreType>()(
  persist(
    (set) => ({
      defaultLanguage: "en",
      setDefaultLanguage: (language) => set({ defaultLanguage: language }),
      getDefualtLanguage: () => "en",
    }),
    {
      name: "defaultLanguage",
    }
  )
);

type useSelectedCargoTabStoreType = {
  selectedCargoTab: string;
  setSelectedCargoTab: (tab: string) => void;
};

export const useSelectedCargoTabStore = create<useSelectedCargoTabStoreType>()(
  persist(
    (set) => ({
      selectedCargoTab: "general",
      setSelectedCargoTab: (tab) => set({ selectedCargoTab: tab }),
    }),
    {
      name: "selectedCargoTab",
    }
  )
);
type useGlobalLoadingStoreType = {
  globalLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;
};
export const useGlobalLoadingStore = create<useGlobalLoadingStoreType>(
  (set) => ({
    globalLoading: true,
    setGlobalLoading: (globalLoading) => set({ globalLoading }),
  })
);

type useNewNotificationsCount = {
  count: number;
  setCount: (count: number) => void;
  incrementCount: () => void;
  decrementCount: () => void;
};

export const useNewNotificationsCount = create<useNewNotificationsCount>(
  (set) => ({
    count: 0,
    setCount: (count) => set({ count }),
    incrementCount: () =>
      set((state) => ({ count: state.count + 1, globalLoading: false })),
    decrementCount: () =>
      set((state) => ({ count: state.count - 1, globalLoading: false })),
  })
);

type useFxRateStoreType = {
  data?: FxRatesResponseType;
  columns: ColumnDef[];
  currentPage: number;
  perPage: number;
  totalElements: number;
  totalPages: number;
  sortBy: string;
  order: "asc" | "desc";
  updateFxRates: (updatedData: FXRate) => void;
  searchCriteria?: string;

  put: (input?: FxRatesResponseType) => void;
  clear: () => void;
  setPageNo: (pageNo: number) => void;
  resetPageNo: () => void;
  setPerPage: (perPage: number) => void;
  setTotalElements: (totalElements: number) => void;
  setTotalPages: (totalPages: number) => void;
  setSearchCriteria: (criteria: string) => void;

  setColumns: (columns: ColumnDef[]) => void;
  deleteFxRates: (id: string) => void;
  addFxRates: (fxRates: FXRate) => void;
  setSortBy: (sortBy: string) => void;
  setOrder: () => void;
};

export const useFxRateStore = create<useFxRateStoreType>((set) => ({
  data: undefined,
  currentPage: 0,
  perPage: 5,
  totalElements: 0,
  totalPages: 0,
  columns: [],
  searchCriteria: "",
  sortBy: "createdAt",
  order: "desc",

  put: (input?: FxRatesResponseType) =>
    set(() => ({
      data: input,
    })),
  clear: () => set(() => ({ data: undefined })),

  setPageNo: (pageNo) =>
    set((state) => ({ currentPage: state.currentPage + pageNo })),
  resetPageNo: () => set(() => ({ currentPage: 0 })),

  setPerPage: (perPage) => set({ perPage }),
  setTotalElements: (totalElements) => set({ totalElements }),
  setTotalPages: (totalPages) => set({ totalPages }),

  setSearchCriteria: (criteria: string) =>
    set(() => ({ searchCriteria: criteria })),

  setSortBy: (sortBy) => set({ sortBy }),
  setOrder: () =>
    set((state) => ({ order: state.order === "asc" ? "desc" : "asc" })),

  setColumns: (columns: ColumnDef[]) =>
    set(() => ({
      columns,
    })),
  deleteFxRates: (id: string) =>
    set((state) => ({
      data: {
        ...state.data,
        content: state.data?.content.filter((fxRates) => fxRates.id !== id)!,
      },
    })),
  updateFxRates: (updatedData) =>
    set((state) => ({
      data: state.data
        ? {
            ...state.data,
            content: state.data?.content.map((fxRates) =>
              fxRates.id === updatedData.id ? updatedData : fxRates
            ),
          }
        : undefined,
    })),
  addFxRates: (fxRates) =>
    set((state) => ({
      data: state.data
        ? {
            ...state.data,
            content: [fxRates, ...state.data.content],
          }
        : undefined,
    })),
}));

interface CargoAssignmentState {
  assignedCargos: Record<string, boolean>;
  setAssigned: (cargoId: string, assigned: boolean) => void;
  resetAssignments: () => void;
}

export const useCargoAssignmentStore = create<CargoAssignmentState>((set) => ({
  assignedCargos: {},
  setAssigned: (cargoId, assigned) =>
    set((state) => ({
      assignedCargos: {
        ...state.assignedCargos,
        [cargoId]: assigned,
      },
    })),
  resetAssignments: () => set({ assignedCargos: {} }),
}));

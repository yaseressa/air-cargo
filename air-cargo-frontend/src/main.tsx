import { createRoot } from "react-dom/client";
import "./index.css";
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import { ThemeProvider } from "./components/theme-provider";
import { QueryClientProvider } from "react-query";
import { queryClient } from "./services/clients";
import { Toaster } from "./components/ui/toaster";
import * as sonner from "sonner";
import { NumberToModalMapper } from "./components/number-to-modal";
import {
  useDefaultLanguageStore,
  useGlobalLoadingStore,
  useLoggedUserStore,
  useModalNumber,
} from "./utils/store";
import { decodeJWT, logout } from "./utils";
import {
  useLoggedInUser,
  useSupportedCurrencies,
} from "./services/calls/queries";
import { useEffect, useState } from "react";
import { AuthResponse, Role } from "./utils/types";
import UsersPage from "./pages/UsersPage";
import CustomersPage from "./pages/CustomersPage";
import CustomerPage from "./pages/CustomerPage";
import CargoPage from "./pages/CargoPage";
import SettingsPage from "./pages/SettingsPage";
import { Label } from "./components/ui/label";
import { GradientPicker } from "./components/ui/color-picker";
import { ChangePasswdForm } from "./components/change-psswd-form";
import { ChangeUserForm } from "./components/change-user-form";
import GeneralSettingsPage from "./pages/GeneralSettingsPage";
import { AccessControl } from "./components/access-control";
import EditCargoPage from "./pages/EditCargoPage";
import ReportsPage from "./pages/ReportsPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import { TitleWrapper } from "./components/wrapper";
import DashboardPage from "./pages/DashboardPage";
import CargoDashboardPage from "./pages/CargoDashboardPage";
import ExpensesPage from "./pages/ExpensesPage";
import { Footer } from "./components/footer";
import AppSidebar from "./components/app-sidebar";
import { useHotkeys } from "react-hotkeys-hook";
import { PublicTrackingPage } from "./pages/PublicTrackingPage";
import { I18nextProvider, useTranslation } from "react-i18next";
import i18n from "./locales/i18n";
import { LoaderCircle } from "lucide-react";
import { Item, SelectWrapper } from "./components/re/select";
import { useUpdatePreferredCurrency } from "./services/calls/mutators";
import { toast } from "./components/ui/use-toast";

// Create separate components for settings pages that need translation
const SettingsAppPage = () => {
  const { t } = useTranslation();
  const user = useLoggedUserStore();
  const supportedCurrencies = useSupportedCurrencies();
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState(user.user.preferredCurrencyCode!);
  const { mutate: updatePreferredCurrency } = useUpdatePreferredCurrency();
  const [primary, setBackground] = useState<string>(
    localStorage.getItem("primary") || "221 83% 53%"
  );
  useEffect(() => {
    if (primary) {
      const root = document.documentElement;
      root.style.setProperty("--primary", primary);
      root.style.setProperty("--ring", primary);
      root.style.setProperty("--primary-foreground", primary);
      localStorage.setItem("primary", primary);
    }
  }, [primary]);

  return (
    <TitleWrapper title={t("appSettings")}>
      <div className="flex gap-5 flex-wrap pt-5">
        <div className="flex flex-col items-stretch gap-10 h-fit">
          <Label className="-translate-y-5 translate-x-1 text-xs">
            {t("theme")}
          </Label>
          <GradientPicker
            background={primary}
            setBackground={setBackground}
            className="h-10 p-2 "
          />
        </div>
        <div className="flex flex-col items-stretch gap-10 h-fit w-[220px]">
          <Label className="-translate-y-5 translate-x-1 text-xs">
            {t("preferredCurrency")}
          </Label>
          {supportedCurrencies.data && (
            <SelectWrapper
              value={value}
              data={
                supportedCurrencies.data.map((sc) => ({
                  label: sc,
                  value: sc,
                })) as Item[]
              }
              readonly={loading}
              onValueChange={async (value) => {
                setLoading(true);
                setValue(value);
                await updatePreferredCurrency(
                  {
                    userId: user.user.id,
                    preferredCurrency: value,
                  },
                  {
                    onSuccess: () => {
                      user.setUser({ ...user, preferredCurrencyCode: value });
                      toast({
                        title: t("success", { preferredCurrency: value }),
                        description: t("preferredCurrencySuccess"),
                      });
                    },
                    onError: () => {
                      toast({
                        title: t("error"),
                        description: t("preferredCurrencyError"),
                        variant: "destructive",
                      });
                    },
                  }
                );

                setLoading(false);
              }}
            />
          )}
        </div>
      </div>
    </TitleWrapper>
  );
};

const SettingsPasswordPage = () => {
  const { t } = useTranslation();
  return (
    <TitleWrapper title={t("passwordSettings")}>
      <ChangePasswdForm />
    </TitleWrapper>
  );
};

const SettingsUserPage = () => {
  const { t } = useTranslation();
  return (
    <TitleWrapper title={t("userSettings")}>
      <ChangeUserForm />
    </TitleWrapper>
  );
};

const FetchUserData = () => {
  const loggedUser = useLoggedUserStore();
  const loading = useGlobalLoadingStore();
  const email = decodeJWT("sub");
  const { data, isLoading, isError } = useLoggedInUser(email);

  useEffect(() => {
    loading.setGlobalLoading(isLoading);
    if (!isLoading && !isError) {
      loggedUser.setUser({
        ...(data as AuthResponse),
        roles: data?.roles.map((role) => role as Role),
      });
      loggedUser.setLoading(false);
    }
    if (isError) {
      logout();
    }
  }, [isLoading]);

  if (localStorage.getItem("primary")) {
    const root = document.documentElement;
    const primary = localStorage.getItem("primary");
    root.style.setProperty("--primary", primary);
    root.style.setProperty("--ring", primary);
  }

  return <></>;
};

const router = createBrowserRouter([
  {
    children: [
      {
        element: <AppLayout />,
        path: "/",
        children: [
          {
            index: true,
            element: <Navigate to="/login" />,
          },
          {
            path: "/login",
            element: localStorage.getItem("token") ? (
              <Navigate to="/dashboard" />
            ) : (
              <LoginPage />
            ),
          },
          {
            path: "/dashboard",
            element: <DashboardPage />,
            children: [
              {
                index: true,
                element: <Navigate to={"/dashboard/cargo"} />,
              },
              {
                path: "/dashboard/cargo",
                element: (
                  <AccessControl
                    roles={["ADMIN", "USER"]}
                    redirect="/dashboard"
                    showToast={false}
                    children={<CargoDashboardPage />}
                  />
                ),
              },
            ],
          },
          {
            path: "/users",
            element: (
              <AccessControl
                roles={["ADMIN"]}
                redirect="/dashboard"
                children={<UsersPage />}
              />
            ),
          },
          {
            path: "/customers",
            element: (
              <AccessControl
                roles={["ADMIN", "USER"]}
                redirect="/dashboard"
                children={<CustomersPage />}
              />
            ),
          },
          {
            path: "/customers/:id",
            element: (
              <AccessControl
                roles={["ADMIN", "USER"]}
                redirect="/dashboard"
                children={<CustomerPage />}
              />
            ),
          },
          {
            path: "/cargos",
            element: (
              <AccessControl
                roles={["ADMIN", "USER"]}
                redirect="/dashboard"
                children={<CargoPage />}
              />
            ),
          },
          {
            path: "/expenses",
            element: (
              <AccessControl
                roles={["ADMIN", "USER"]}
                redirect="/dashboard"
                children={<ExpensesPage />}
              />
            ),
          },
          {
            path: "/cargo/:customerId/:cargoId",
            element: (
              <AccessControl
                roles={["ADMIN", "USER"]}
                redirect="/dashboard"
                children={<EditCargoPage />}
              />
            ),
          },
          {
            path: "/settings",
            element: <SettingsPage />,
            children: [
              { index: true, element: <Navigate to="/settings/app" /> },
              {
                path: "/settings/app",
                element: (
                  <AccessControl
                    roles={["ADMIN", "USER"]}
                    redirect="/dashboard"
                    children={<SettingsAppPage />}
                  />
                ),
              },
              {
                path: "/settings/psswd",
                element: <SettingsPasswordPage />,
              },
              {
                path: "/settings/user",
                element: <SettingsUserPage />,
              },
              {
                path: "/settings/general",
                element: (
                  <AccessControl
                    roles={["ADMIN"]}
                    redirect="/dashboard"
                    children={<GeneralSettingsPage />}
                  />
                ),
              },
            ],
          },
          { path: "/reports", element: <ReportsPage /> },
          { path: "/forgot-password", element: <ForgotPasswordPage /> },
          { path: "/track/:id", element: <PublicTrackingPage /> },
          { path: "/track", element: <PublicTrackingPage /> },
          {
            path: "*",
            element: <Navigate to="/dashboard" />,
          },
        ],
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <I18nextProvider i18n={i18n}>
    <ThemeProvider defaultTheme="light" storageKey="vite-theme">
      <Toaster />
      <sonner.Toaster />
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ThemeProvider>
  </I18nextProvider>
);

function LoadDefaultLanguage() {
  const defaultLanguage = useDefaultLanguageStore();
  const { i18n } = useTranslation();
  useEffect(() => {
    i18n.changeLanguage(defaultLanguage.defaultLanguage);
  }, []);
  return <></>;
}

function GlobalLoadingScreen() {
  const globalLoading = useGlobalLoadingStore((s) => s.globalLoading);
  return (
    <div
      className={`${
        globalLoading ? "fixed" : "hidden"
      } top-0 left-0 backdrop-blur-sm w-screen h-screen z-[9999] flex items-center justify-center pointer-events-none`}
      tabIndex={-1}
    >
      <LoaderCircle
        className="animate-spin text-primary"
        size={100}
        strokeWidth={5}
      />
    </div>
  );
}

function AppLayout() {
  const loggedUser = useLoggedUserStore();
  const modal = useModalNumber();
  useHotkeys("ctrl+k", (event) => {
    event.preventDefault();
    modal.setModalNumberAndType(10);
  });

  return (
    <>
      <GlobalLoadingScreen />
      <FetchUserData />
      <LoadDefaultLanguage />
      <NumberToModalMapper />
      {!loggedUser.user.loading && (
        <>
          {loggedUser.user.roles ? (
            <>
              <div className="flex items-stretch">
                <AppSidebar />
                <div className="overflow-hidden flex-1">
                  <Outlet />
                </div>
              </div>
              <Footer />
            </>
          ) : (
            <Outlet />
          )}
        </>
      )}
    </>
  );
}





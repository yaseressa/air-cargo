import Header from "@/components/header";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AccessControl } from "@/components/access-control";

export default () => {
  const { t } = useTranslation();
  const pathname = useLocation().pathname;

  return (
    <div className="overflow-x-hidden">
      <Header />
      <main className="flex flex-col justify-center md:items-stretch min-h-full">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-[27%]">
            <div className="md:fixed grid grid-cols-2 grid-rows-2 md:flex md:flex-col flex-wrap gap-3 mr-1 md:w-[20%] p-2 pt-5 md:border-r-primary md:border-r md:backdrop-blur-md md:max-h-[90vh] md:min-h-[90vh] rounded bg-background">
              <AccessControl roles={["ADMIN", "USER"]} showToast={false}>
                <NavLink
                  to="/settings"
                  className={({ isActive }) =>
                    "text-sm whitespace-nowrap p-2 h-9 " +
                    (isActive && pathname === "/settings/app"
                      ? "  border-r-2 border md:bg-primary md:text-secondary rounded animate-fade-right"
                      : "")
                  }
                >
                  {t("appSettings")}
                </NavLink>
              </AccessControl>
              <NavLink
                to="/settings/psswd"
                className={({ isActive }) =>
                  "text-sm whitespace-nowrap p-2 h-10 " +
                  (isActive
                    ? "  border-r-2 border md:bg-primary md:text-secondary rounded animate-fade-right"
                    : "")
                }
              >
                {t("passwordSettings")}
              </NavLink>
              <NavLink
                to="/settings/user"
                className={({ isActive }) =>
                  "text-sm whitespace-nowrap p-2 h-10 " +
                  (isActive
                    ? "  border-r-2 border md:bg-primary md:text-secondary rounded animate-fade-right"
                    : "")
                }
              >
                {t("userSettings")}
              </NavLink>
              <AccessControl roles={["ADMIN"]} showToast={false}>
                <NavLink
                  to="/settings/general"
                  className={({ isActive }) =>
                    "text-sm whitespace-nowrap p-2 h-10 " +
                    (isActive
                      ? "  border-r-2 border md:bg-primary md:text-secondary rounded animate-fade-right"
                      : "")
                  }
                >
                  {t("generalSettings")}
                </NavLink>
              </AccessControl>
            </div>
          </div>
          <div className="w-full md:ml-14 m-4">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

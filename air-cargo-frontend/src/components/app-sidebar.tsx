import { useNumberOfCargosCreated, useSidebarStore } from "@/utils/store";
import { SideBarWrapperPropsType } from "@/utils/types";
import {
  BookUser,
  Package,
  LayoutDashboard,
  MapPinHouse,
  Route,
  UserCog2,
} from "lucide-react";
import { SideBarWrapper } from "./re/sidebar";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export default () => {
  const cargoCounter = useNumberOfCargosCreated();
  const { t } = useTranslation();

  const menuItems: SideBarWrapperPropsType = {
    items: [
      {
        groupTitle: t("mainGroup"),
        children: [
          {
            label: { name: t("dashboard"), icon: LayoutDashboard },
            link: "/dashboard",
            roles: ["ADMIN", "USER"],
          },
          {
            label: { name: t("customers"), icon: BookUser },
            link: "/customers",
            roles: ["ADMIN", "USER"],
          },
          {
            label: { name: t("cargo"), icon: Package },
            link: "/cargos",
            roles: ["ADMIN", "USER"],
            badge: cargoCounter.numberOfCargos,
          },

          {
            label: { name: t("reports"), icon: Route },
            link: "/reports",
            roles: ["ADMIN", "USER"],
          },
        ],
      },
      {
        groupTitle: t("administrationGroup"),
        children: [
          {
            label: { name: t("users"), icon: UserCog2 },
            link: "/users",
            roles: ["ADMIN"],
          },
        ],
      },
    ],
  };

  const isOpen = useSidebarStore((state) => state.open);

  return (
    <motion.div
      className="md:block hidden z-50"
      initial={{ width: 240 }}
      animate={{ width: isOpen ? 240 : 72 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <SideBarWrapper {...menuItems} />
    </motion.div>
  );
};

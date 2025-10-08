import { useLoggedUserStore } from "@/utils/store";
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "./ui/use-toast";
import { Role } from "@/utils/types";
import { useTranslation } from "react-i18next";

export const AccessControl = ({
  roles,
  children,
  showToast = true,
  redirect,
}: {
  roles: string[];
  children: ReactNode;
  showToast?: boolean;
  redirect?: string;
}) => {
  const { t } = useTranslation();
  const currentUser = useLoggedUserStore();

  if (currentUser?.user.roles) {
    if (roles?.some((role) => currentUser.user.roles?.includes(role as Role))) {
      return children;
    }
    if (redirect) {
      if (showToast) {
        toast({
          title: t("unauthorized"),
          description: t("notAuthorized"),
        });
      }
      return <Navigate to={redirect} />;
    }
  }

  if (!currentUser.user.roles && !currentUser.user.loading) {
    return <Navigate to="/login" />;
  }

  return null;
};

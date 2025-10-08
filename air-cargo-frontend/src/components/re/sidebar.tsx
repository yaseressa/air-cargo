import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { NavLink, useLocation } from "react-router-dom";
import type {
  PathDetailsType,
  Role,
  SideBarTab,
  SideBarWrapperPropsType,
} from "@/utils/types";
import { useLoggedUserStore, useSidebarStore } from "@/utils/store";
import { AccessControl } from "../access-control";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { ScrollArea } from "../ui/scroll-area";
import { Badge } from "../ui/badge";
import { ChevronDown, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const collapseVariants = {
  collapsed: { height: 0, opacity: 0 },
  expanded: { height: "auto", opacity: 1 },
};

const isLinkActive = (currentPath: string, link?: string) => {
  if (!link) return false;
  if (link === "/") {
    return currentPath === "/";
  }
  return currentPath === link || currentPath.startsWith(`${link}/`);
};

const capBadge = (badge?: number) => {
  if (typeof badge !== "number" || badge <= 0) {
    return undefined;
  }
  return badge > 99 ? "99+" : `${badge}`;
};

export const SideBarWrapper = ({ items }: SideBarWrapperPropsType) => {
  const { t } = useTranslation();
  const isOpen = useSidebarStore((state) => state.open);
  const { user } = useLoggedUserStore();
  const location = useLocation();

  const userRoles = user.roles ?? [];

  const visibleItems = useMemo(() => {
    const roles = new Set(userRoles as Role[]);
    return items
      .map((item: SideBarTab) => {
        const children = item.children.filter((child) => {
          if (!child.roles || child.roles.length === 0) return true;
          return child.roles.some((role) => roles.has(role as Role));
        });
        return { ...item, children };
      })
      .filter((item) => item.children.length > 0);
  }, [items, userRoles]);

  const [expandedGroups, setExpandedGroups] = useState<string[]>(() =>
    visibleItems.map((item) => item.groupTitle)
  );

  useEffect(() => {
    setExpandedGroups((prev) => {
      const preserved = visibleItems
        .filter((item) => prev.includes(item.groupTitle))
        .map((item) => item.groupTitle);
      const missing = visibleItems
        .map((item) => item.groupTitle)
        .filter((title) => !preserved.includes(title));
      return [...preserved, ...missing];
    });
  }, [visibleItems]);

  const handleToggleGroup = (title: string) => {
    setExpandedGroups((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  const renderNavLink = (child: PathDetailsType) => {
    const Icon = child.label.icon;
    const badgeValue = capBadge(child.badge);
    const active = isLinkActive(location.pathname, child.link);

    const baseClassName = cn(
      "relative group flex h-10 w-full items-center rounded px-2 text-sm font-medium transition-all",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
      isOpen ? "justify-start" : "justify-center",
      active && isOpen && "bg-primary text-background shadow",
      active && !isOpen && "bg-primary text-background",
      !active && "text-primary hover:bg-secondary/30 hover:text-primary"
    );

    const linkContent = (
      <NavLink end to={child.link ?? "#"} className={baseClassName}>
        {Icon ? (
          <Icon className={cn(isOpen ? "h-4 w-4" : "h-5 w-5")} />
        ) : (
          <span className={cn(isOpen ? "text-xs" : "text-sm font-semibold")}>
            {child.label.name.charAt(0)}
          </span>
        )}

        {isOpen && (
          <>
            <span className="ml-2 flex-1 truncate">{child.label.name}</span>
            {badgeValue && (
              <Badge
                variant={active ? "default" : "secondary"}
                className={cn(
                  "ml-auto h-5 min-w-[1.5rem] justify-center px-1 text-[11px]",
                  active && "bg-primary/15 text-primary"
                )}
              >
                {badgeValue}
              </Badge>
            )}
          </>
        )}

        {!isOpen && badgeValue && (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-[1rem] items-center justify-center rounded bg-primary-foreground/85 px-1 text-[10px] font-semibold text-primary shadow-sm">
            {badgeValue}
          </span>
        )}
      </NavLink>
    );

    if (isOpen) return linkContent;

    return (
      <Tooltip delayDuration={80}>
        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
        <TooltipContent
          side="right"
          className="ml-2 flex items-center gap-2 text-xs"
        >
          <span>{child.label.name}</span>
          {badgeValue && (
            <Badge
              variant="secondary"
              className="h-5 min-w-[1.5rem] justify-center px-1"
            >
              {badgeValue}
            </Badge>
          )}
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <TooltipProvider delayDuration={120}>
      <motion.aside
        className="fixed hidden h-screen overflow-hidden border-r bg-background text-sm shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/80 md:flex"
        initial={false}
        animate={{ width: isOpen ? 240 : 72 }}
        transition={{ duration: 0.28, ease: [0.24, 0.8, 0.25, 1] }}
      >
        <div className="flex h-full w-full flex-col">
          <div className="flex items-center justify-between gap-2 px-3 pb-3 pt-6">
            <div className="relative flex items-center gap-3">
              <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded bg-primary/10">
                <div className="absolute inset-0 rounded bg-primary/40 blur-xl" />
                <img
                  src="/logo.png"
                  className="relative h-8 w-8 object-contain"
                  alt="Logo"
                />
              </div>
              {isOpen && (
                <div className="flex flex-col">
                  <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                    {t("appName")}
                  </span>
                </div>
              )}
            </div>
          </div>

          <ScrollArea className="flex-1 px-2">
            <div className="space-y-2 pb-16">
              {visibleItems.map((item) => {
                const isExpanded = isOpen
                  ? expandedGroups.includes(item.groupTitle)
                  : true;
                const hasActiveChild = item.children.some((child) =>
                  isLinkActive(location.pathname, child.link)
                );

                return (
                  <div
                    key={item.groupTitle}
                    className={cn(
                      "group relative rounded px-1 py-1",
                      hasActiveChild && isOpen ? "bg-primary/10" : undefined
                    )}
                  >
                    {isOpen && (
                      <button
                        type="button"
                        onClick={() => handleToggleGroup(item.groupTitle)}
                        className={cn(
                          "flex w-full items-center justify-between rounded px-2 py-2 text-xs font-semibold uppercase tracking-wide transition-colors",
                          hasActiveChild
                            ? "text-primary"
                            : "text-muted-foreground/70 hover:text-primary/50"
                        )}
                        aria-expanded={isExpanded}
                      >
                        <span className="truncate">{item.groupTitle}</span>
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 shrink-0 transition-transform",
                            isExpanded ? "rotate-180" : "rotate-0"
                          )}
                        />
                      </button>
                    )}

                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          key="content"
                          initial="collapsed"
                          animate="expanded"
                          exit="collapsed"
                          variants={collapseVariants}
                          transition={{ duration: 0.18, ease: "easeInOut" }}
                        >
                          <div
                            className={cn(
                              "mt-1 flex w-full flex-col gap-1",
                              isOpen ? "px-1" : "px-0"
                            )}
                          >
                            {item.children.map((child) => (
                              <AccessControl
                                roles={child.roles ?? []}
                                key={child.link}
                              >
                                {renderNavLink(child)}
                              </AccessControl>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          <div className="w-full px-3 flex justify-center rounded-tl rounded-tr border border-t-primary">
            <AccessControl roles={["ADMIN", "USER"]}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <NavLink
                    to="/settings"
                    className={({ isActive }) =>
                      cn(
                        "relative flex justify-center h-10 w-full items-center gap-2 rounded px-3 text-sm font-medium transition-colors",
                        isOpen ? "justify-start" : "justify-center",
                        isActive
                          ? "bg-primary text-primary shadow"
                          : "text-foreground hover:bg-secondary/30 hover:text-background"
                      )
                    }
                  >
                    <Settings
                      className={cn("shrink-0", isOpen ? "h-4 w-4" : "h-5 w-5")}
                    />
                    {isOpen && <span className="text-xs">{t("settings")}</span>}
                  </NavLink>
                </TooltipTrigger>
                {!isOpen && (
                  <TooltipContent side="right" className="ml-2 text-xs">
                    {t("settings")}
                  </TooltipContent>
                )}
              </Tooltip>
            </AccessControl>
          </div>
        </div>
      </motion.aside>
    </TooltipProvider>
  );
};

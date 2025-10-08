import {
  BookUser,
  CircleUser,
  Menu,
  UsersRound,
  Package,
  Car,
  DollarSign,
  Search,
  UserCog2,
  LayoutDashboard,
  PanelLeftDashed,
  Command,
  MapPinHouse,
  Route,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { logout } from "@/utils";
import { AccessControl } from "./access-control";
import { useModalNumber, useSidebarStore } from "@/utils/store";
import { ThemeToggle } from "./theme-toggle";
import { LanguageToggle } from "./lang-toggle";
import { useTranslation } from "react-i18next";

const Header = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const modalNumber = useModalNumber();
  const sidebarToggle = useSidebarStore();

  return (
    <header className="md:h-auto h-20 sticky top-0 flex justify-between items-center gap-4 border-b bg-background/90 backdrop-blur-lg px-4 md:px-2 z-50">
      <div className="flex items-center gap-4">
        <Button
          variant={"outline"}
          size={"icon"}
          className="justify-center hidden md:flex"
          onClick={() => sidebarToggle.toggle()}
        >
          <PanelLeftDashed className="h-5 w-5 text-primary" />
        </Button>
        <Button
          variant={"outline"}
          size={"icon"}
          className="p-4 pr-1 md:flex hidden w-72 justify-between items-center"
          onClick={() => modalNumber.setModalNumberAndType(10)}
        >
          <div className="flex items-center gap-3 text-primary">
            <Search className="h-4 w-4" />
            <p className="text-xs">{t("searchPlaceholder")}</p>
          </div>
          <div className="rounded border bg-primary/70 p-1 text-xs text-background flex items-center gap-1">
            <Command className="h-3 w-3" />
            <span>K</span>
          </div>
        </Button>
      </div>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5 fill-primary" />
            <span className="sr-only">{t("toggleNavigationMenu")}</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <nav className="grid gap-6 text-lg font-medium my-5">
            <Link to="/dashboard" className="flex gap-2 hover:text-foreground">
              <LayoutDashboard className="h-5 w-5 fill-primary text-background" />
              <p>{t("dashboard")}</p>
            </Link>
            <AccessControl roles={["ADMIN", "CARGO"]}>
              <Link
                to="/customers"
                className="flex gap-2 hover:text-foreground"
              >
                <BookUser className="h-5 w-5 fill-primary text-background" />
                <p>{t("customers")}</p>
              </Link>
            </AccessControl>
            <AccessControl roles={["ADMIN", "CARGO"]}>
              <Link to="/cargos" className="flex gap-2 hover:text-foreground">
                <Package className="h-5 w-5 fill-primary text-background" />
                <p>{t("cargo")}</p>
              </Link>
            </AccessControl>
            <AccessControl roles={["ADMIN", "FLEET"]}>
              <Link to="/drivers" className="flex gap-2 hover:text-foreground">
                <UsersRound className="h-5 w-5 fill-primary text-background" />
                <p>{t("drivers")}</p>
              </Link>
            </AccessControl>
            <AccessControl roles={["ADMIN", "FLEET"]}>
              <Link to="/vehicles" className="flex gap-2 hover:text-foreground">
                <Car className="h-5 w-5 fill-primary text-background" />
                <p>{t("vehicles")}</p>
              </Link>
            </AccessControl>
            <AccessControl roles={["ADMIN", "FLEET"]}>
              <Link to="/expenses" className="flex gap-2 hover:text-foreground">
                <DollarSign className="h-5 w-5 fill-primary text-background" />
                <p>{t("expenses")}</p>
              </Link>
            </AccessControl>
            <AccessControl roles={["ADMIN", "FLEET", "CARGO"]}>
              <Link to="/trips" className="flex gap-2 hover:text-foreground">
                <Route className="h-5 w-5 fill-primary text-background" />
                <p>{t("trips")}</p>
              </Link>
            </AccessControl>
            <AccessControl roles={["ADMIN", "FLEET"]}>
              <Link to="/geofence" className="flex gap-2 hover:text-foreground">
                <MapPinHouse className="h-5 w-5 fill-primary text-background" />
                <p>{t("geofence")}</p>
              </Link>
            </AccessControl>
            <AccessControl roles={["ADMIN"]}>
              <Link to="/users" className="flex gap-2 hover:text-foreground">
                <UserCog2 className="h-5 w-5 fill-primary text-background" />
                <p>{t("users")}</p>
              </Link>
            </AccessControl>
          </nav>
        </SheetContent>
      </Sheet>

      <div className="flex w-full items-center justify-end gap-4 h-14">
        <Button
          variant={"outline"}
          size={"icon"}
          className="p-4 md:hidden"
          onClick={() => modalNumber.setModalNumberAndType(10)}
        >
          <Search className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <CircleUser className="h-4 w-5" />
              <span className="sr-only">{t("toggleUserMenu")}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{t("myAccount")}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              {t("settings")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>{t("logout")}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <ThemeToggle />
        <LanguageToggle />
      </div>
    </header>
  );
};

export default Header;

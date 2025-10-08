import React, { useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import {
  BookUser,
  Car,
  DollarSign,
  Fuel,
  HomeIcon,
  Package,
  Settings,
  Settings2,
  UserCog2,
  UsersRound,
} from "lucide-react";
import { useModalNumber } from "@/utils/store";
import { Link, useNavigate } from "react-router-dom";
import { PathDetailsType } from "@/utils/types";
import { useTranslation } from "react-i18next";

type SearchModalProps = {
  trigger?: React.ReactNode;
};

const SearchModal = ({ trigger }: SearchModalProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(!trigger);
  const modalNumber = useModalNumber();

  const mainPaths: PathDetailsType[] = [
    {
      label: {
        name: t("searching.dashboard"),
        icon: HomeIcon,
      },
      link: "/",
    },
    {
      label: {
        name: t("searching.customers"),
        icon: BookUser,
      },
      link: "/customers",
    },
    {
      label: {
        name: t("searching.users"),
        icon: UserCog2,
      },
      link: "/users",
    },
    {
      label: {
        name: t("searching.cargo"),
        icon: Package,
      },
      link: "/cargos",
    },
    {
      label: {
        name: t("searching.drivers"),
        icon: UsersRound,
      },
      link: "/drivers",
    },
    {
      label: {
        name: t("searching.vehicles"),
        icon: Car,
      },
      link: "/vehicles",
    },
    {
      label: {
        name: t("searching.expenses"),
        icon: DollarSign,
      },
      link: "/expenses",
    },
  ];

  const subPaths: PathDetailsType[] = [
    {
      label: {
        name: t("searching.maintenance"),
        icon: Settings,
      },
      link: "/expenses/maintenance",
    },
    {
      label: {
        name: t("searching.fuel"),
        icon: Fuel,
      },
      link: "/expenses/fuel",
    },
    {
      label: {
        name: t("searching.vehicleTypes"),
        icon: Settings2,
      },
      link: "/settings/general",
    },
    {
      label: {
        name: t("searching.appSettings"),
        icon: Settings2,
      },
      link: "/settings/app",
    },
    {
      label: {
        name: t("searching.changePassword"),
        icon: Settings2,
      },
      link: "/settings/psswd",
    },
    {
      label: {
        name: t("searching.changeUser"),
        icon: Settings2,
      },
      link: "/settings/user",
    },
  ];

  const handleOpenChange = async () => {
    await setOpen((prev) => !prev);
    if (!trigger) modalNumber.setModalNumberAndType(0);
  };

  return (
    <>
      <div onClick={handleOpenChange}>{trigger}</div>
      <CommandDialog open={open} onOpenChange={handleOpenChange}>
        <CommandInput placeholder={t("searching.placeholder")} />
        <CommandList>
          <CommandEmpty>{t("searching.noResults")}</CommandEmpty>
          <CommandGroup heading={t("searching.mainPaths")}>
            {mainPaths.map((data) => (
              <CommandItem
                key={data.link}
                onSelect={() => {
                  handleOpenChange();
                  navigate(data.link);
                  modalNumber.setModalNumberAndType(0);
                }}
              >
                <Link to={data.link} className="flex items-center">
                  {data.label.icon && <data.label.icon className="h-2 w-2" />}
                  <p className="ml-2">{data.label.name}</p>
                </Link>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading={t("searching.subPaths")}>
            {subPaths.map((data) => (
              <CommandItem
                key={data.link}
                onSelect={() => {
                  handleOpenChange();
                  navigate(data.link);
                  modalNumber.setModalNumberAndType(0);
                }}
              >
                <div className="flex items-center">
                  {data.label.icon && <data.label.icon className="h-2 w-2" />}
                  <p className="ml-2">{data.label.name}</p>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
};

export default SearchModal;

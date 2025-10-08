import { useMemo } from "react";
import { useModalNumber } from "@/utils/store";
import { ReactNode } from "react";
import { UploadModal } from "./upload-file";
import { CustomerForm } from "./customer-form";
import { UserForm } from "./user-form";
import { LocationForm } from "./location-form";

import SearchModal from "./search-modal";
import { CargoTrackingForm } from "./cargo-tracking-form";
import { useTranslation } from "react-i18next";
import { FxRateForm } from "./fx-rate-form";

export function NumberToModalMapper(): ReactNode {
  const modalNumber = useModalNumber();
  const { t } = useTranslation();

  const mappedModal = useMemo(() => {
    const mapper: Record<number, JSX.Element> = {
      1: <UserForm action={modalNumber.type} />,
      2: <CustomerForm action={modalNumber.type} />,
      3: <UploadModal name={t("uploadPhoto")} opened={true} />,
      5: <LocationForm action={modalNumber.type} />,
      10: <SearchModal />,
      12: <CargoTrackingForm action={modalNumber.type} />,
      14: <FxRateForm action={modalNumber.type} />,
    };

    return mapper[modalNumber.modalNumber] || null;
  }, [modalNumber.modalNumber, modalNumber.type]);

  return mappedModal;
}

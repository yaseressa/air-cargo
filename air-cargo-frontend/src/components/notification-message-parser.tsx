import { Activity, Ban, CircleDashed, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";

export default ({
  message,
  iconShown = false,
}: {
  message: string;
  iconShown?: boolean;
}) => {
  const { t } = useTranslation();

  const parts = message.split("|");
  const messageType = parts[0];

  if (messageType == "ST") {
    return iconShown ? (
      <div className="flex items-start gap-2">
        <CircleDashed className="text-primary" />
        <p>
          {t("vehicle") +
            " " +
            parts[1] +
            " " +
            (parts[3] === "exited"
              ? t("exitedGeofence")
              : t("enteredGeofence")) +
            " " +
            parts[4]}
        </p>
      </div>
    ) : (
      t("vehicle") +
        " " +
        parts[1] +
        " " +
        (parts[3] === "exited" ? t("exitedGeofence") : t("enteredGeofence")) +
        " " +
        parts[4]
    );
  } else if (messageType == "SCH") {
    if (parts[3] === "idle") {
      return (
        <div className="flex items-start gap-2">
          <Ban className="text-primary" />
          <p>{t("vehicle") + " " + parts[1] + " " + t("isIdle")}</p>
        </div>
      );
    } else if (parts[3] === "moving") {
      return (
        <div className="flex items-start gap-2">
          <Activity className="text-primary" />
          <p>{t("vehicle") + " " + parts[1] + " " + t("isMoving")}</p>
        </div>
      );
    } else if (parts[3] === "over_speed") {
      return (
        <div className="flex items-start gap-2">
          <Zap className="text-red-600" />
          <p>{t("vehicle") + " " + parts[1] + " " + t("isOverspeeding")}</p>
        </div>
      );
    } else if (parts[3] === "iginition_on") {
      return (
        <div className="flex items-start gap-2">
          <Activity className="text-primary" />
          <p>{t("vehicle") + " " + parts[1] + " " + t("ignitionOn")}</p>
        </div>
      );
    }
  }
};

export const parseNotificationText = (message: string): string => {
  const { t } = useTranslation();
  const parts = message.split("|");
  const messageType = parts[0];

  if (messageType == "ST") {
    return (
      t("vehicle") +
      " " +
      parts[1] +
      " " +
      (parts[3] === "exited" ? t("exitedGeofence") : t("enteredGeofence")) +
      " " +
      parts[4]
    );
  } else if (messageType == "SCH") {
    if (parts[3] === "idle") {
      return t("vehicle") + " " + parts[1] + " " + t("isIdle");
    } else if (parts[3] === "moving") {
      return t("vehicle") + " " + parts[1] + " " + t("isMoving");
    } else if (parts[3] === "over_speed") {
      return t("vehicle") + " " + parts[1] + " " + t("isOverspeeding");
    } else if (parts[3] === "iginition_on") {
      return t("vehicle") + " " + parts[1] + " " + t("ignitionOn");
    }
  }

  return "New notification"; // Fallback for unknown types
};

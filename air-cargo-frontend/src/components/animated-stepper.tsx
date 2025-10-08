import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Clock,
  Check,
  Package,
  AlertTriangle,
  MapPin,
  ChevronDown,
  SquarePen,
} from "lucide-react";
import { LuggageStatus } from "@/utils/types";
import { Button } from "./ui/button";
import { useTranslation } from "react-i18next";

const StatusIcon: React.FC<{
  status: LuggageStatus["status"];
  className?: string;
}> = ({ status, className }) => {
  const iconSize = 16;
  const iconClass = cn("stroke-[1.5]", className);

  switch (status?.toString()) {
    case "DELIVERED":
    case "ARRIVED":
      return <Check className={iconClass} size={iconSize} />;
    case "LOST":
      return <AlertTriangle className={iconClass} size={iconSize} />;
    case "IN_TRANSIT":
    case "CHECKED_IN":
    case "RETRIEVED":
      return <Package className={iconClass} size={iconSize} />;
    case "DAMAGED":
      return <AlertTriangle className={iconClass} size={iconSize} />;
    case "PENDING":
      return <Clock className={iconClass} size={iconSize} />;
    default:
      return <AlertTriangle className={iconClass} size={iconSize} />;
  }
};

interface Step {
  number: number;
  label: string;
  status?: LuggageStatus[];
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepNumber: number) => void;
  className?: string;
}

const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  onStepClick,
  className,
}) => {
  const { t } = useTranslation();
  currentStep = steps.length - 1;
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToCurrentStep = (stepIndex: number) => {
    const scrollArea = scrollAreaRef.current;
    if (scrollArea) {
      const stepElements = scrollArea.querySelectorAll(".step-container");
      if (stepElements[stepIndex]) {
        stepElements[stepIndex].scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  };

  useEffect(() => {
    scrollToCurrentStep(currentStep - 1);
  }, [currentStep]);

  const getStatusColor = (status?: LuggageStatus["status"]) => {
    switch (status?.toString()) {
      case "DELIVERED":
      case "ARRIVED":
        return "bg-green-500";
      case "LOST":
      case "DAMAGED":
        return "bg-red-500";
      case "IN_TRANSIT":
        return "bg-blue-500";
      case "CHECKED_IN":
        return "bg-purple-500";
      case "RETRIEVED":
        return "bg-indigo-500";
      case "PENDING":
        return "bg-amber-500";
      default:
        return "bg-gray-500";
    }
  };

  const getLatestStatus = (statuses: LuggageStatus[] | undefined) => {
    if (!statuses || statuses.length === 0) return null;
    return statuses.reduce((latest, current) =>
      new Date(current.createdAt || 0) > new Date(latest.createdAt || 0)
        ? current
        : latest
    );
  };

  const translateStatus = (status: string) => {
    switch (status?.toString()) {
      case "DELIVERED":
        return t("statusCategory.delivered");
      case "ARRIVED":
        return t("statusCategory.arrived");
      case "LOST":
        return t("statusCategory.lost");
      case "IN_TRANSIT":
        return t("statusCategory.inTransit");
      case "CHECKED_IN":
        return t("statusCategory.checkedIn");
      case "RETRIEVED":
        return t("statusCategory.retrieved");
      case "DAMAGED":
        return t("statusCategory.damaged");
      case "PENDING":
        return t("statusCategory.pending");
      default:
        return status?.toString().toLowerCase().replace(/_/g, " ");
    }
  };

  return (
    <div className={cn("w-full bg-background rounded", className)}>
      <ScrollArea ref={scrollAreaRef} className="h-fit w-full">
        <div className="relative p-8">
          <div className="absolute left-8 top-0 h-full w-px bg-border" />

          {steps.map((step) => {
            const isCurrent = step.number === currentStep;
            const isExpanded = expandedStep === step.number;
            const latestStatus = getLatestStatus(step.status);
            const statusCount = step.status?.length || 0;

            return (
              <div
                key={step.number}
                className={cn(
                  "step-container relative mb-6 pl-12 transition-all",
                  isCurrent ? "opacity-100" : "opacity-70 hover:opacity-90"
                )}
              >
                {/* Timeline dot */}
                <div
                  className={cn(
                    "absolute left-0 top-16 -ml-0.5 h-3 w-3 rounded-full border-2 border-background",
                    getStatusColor(latestStatus?.status),
                    isCurrent ? "scale-125 shadow-lg" : "scale-100"
                  )}
                />

                {/* Main card */}
                <motion.div
                  className={cn(
                    "group rounded border bg-background p-6 transition-all",
                    isCurrent
                      ? "border-primary shadow-md"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <h3 className="text-sm font-semibold">
                            {step.label}
                          </h3>
                        </div>
                        {onStepClick && (
                          <Button
                            variant={"ghost"}
                            size={"icon"}
                            onClick={() => onStepClick?.(step.number)}
                          >
                            <SquarePen className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        )}
                      </div>
                      {latestStatus && (
                        <div className="mt-4 flex items-center gap-3">
                          <span
                            className={cn(
                              "inline-flex h-8 w-8 items-center justify-center rounded-full",
                              getStatusColor(latestStatus.status)
                            )}
                          >
                            <StatusIcon
                              status={latestStatus.status}
                              className="text-background"
                            />
                          </span>
                          <div>
                            <p className="font-medium capitalize text-sm">
                              {translateStatus(
                                latestStatus.status?.toString()!
                              )}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(
                                latestStatus.createdAt || ""
                              ).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {statusCount > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setExpandedStep(isExpanded ? null : step.number)
                        }
                      >
                        <ChevronDown
                          className={cn(
                            "h-5 w-5 text-muted-foreground transition-transform",
                            isExpanded && "rotate-180"
                          )}
                        />
                      </Button>
                    )}
                  </div>

                  {/* Status history */}
                  <AnimatePresence>
                    {isExpanded && step.status && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 space-y-4 border-t pt-4"
                      >
                        {step.status
                          .sort(
                            (a, b) =>
                              new Date(b.createdAt || 0).getTime() -
                              new Date(a.createdAt || 0).getTime()
                          )
                          .map((status, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                              <span
                                className={cn(
                                  "inline-flex h-6 w-6 items-center justify-center rounded-full",
                                  getStatusColor(status.status)
                                )}
                              >
                                <StatusIcon
                                  status={status.status}
                                  className="h-3 w-3 text-white"
                                />
                              </span>
                              <div>
                                <p className="text-sm font-medium capitalize">
                                  {translateStatus(status.status?.toString()!)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(
                                    status.createdAt || ""
                                  ).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

export default Stepper;

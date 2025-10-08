import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

type IconLabelProps = {
  Icon: LucideIcon;
  label: string;
  iconClassName?: string;
};

const IconLabel = ({ Icon, label, iconClassName }: IconLabelProps) => {
  return (
    <div className="flex items-center space-x-2">
      <Icon className={cn("text-primary h-4 w-4", iconClassName)} />
      <span>{label}</span>
    </div>
  );
};

export default IconLabel;

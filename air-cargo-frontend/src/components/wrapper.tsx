import { cn } from "@/lib/utils";
import { useModalNumber } from "@/utils/store";
import { LucidePenBox, PlusSquareIcon } from "lucide-react";
import { FC, ReactNode } from "react";
interface TitleWrapperProps {
  title?: string | ReactNode;
  children: ReactNode;
  trigger?: ReactNode;
  className?: string;
  optype?: "create" | "update";
  modalNumber?: number;
  subHeader?: string;
}
export const TitleWrapper: FC<TitleWrapperProps> = ({
  title,
  children,
  className,
  optype,
  modalNumber,
  trigger,
  subHeader,
}) => {
  const setModalNumberAndType = useModalNumber(
    (state) => state.setModalNumberAndType
  );
  return (
    <div
      className={cn(
        "bg-background border p-4 rounded flex flex-col gap-6 max-h-fit min-h-[200px] backdrop-blur-sm z-0",
        className
      )}
    >
      <div className="flex flex-col ">
        <div className="flex justify-between text-lg items-center">
          {title}
          {trigger ? (
            <div onClick={() => setModalNumberAndType?.(modalNumber!, optype)}>
              {trigger}
            </div>
          ) : (
            modalNumber &&
            ((optype == "update" && (
              <LucidePenBox
                size={15}
                className="cursor-pointer"
                onClick={() => setModalNumberAndType?.(modalNumber!, optype)}
              />
            )) ||
              (optype == "create" && (
                <PlusSquareIcon
                  size={15}
                  className="cursor-pointer"
                  onClick={() => setModalNumberAndType?.(modalNumber!, optype)}
                />
              )))
          )}
        </div>
        {subHeader && <div className="text-muted-foreground">{subHeader}</div>}
      </div>
      {children}
    </div>
  );
};

import { ReactNode } from "react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "../ui/dialog";

type DialogProps = {
  title: ReactNode;
  trigger: ReactNode;
  children: ReactNode;
  className?: string;
  footer?: ReactNode;
};
const DialogWrapper = ({
  title,
  trigger,
  children,
  className,
  footer,
}: DialogProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className={className}>
        <DialogHeader>{title}</DialogHeader>
        {children}
        <DialogFooter>{footer}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DialogWrapper;

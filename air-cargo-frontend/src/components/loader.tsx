import { LoaderCircle } from "lucide-react";
import { cn } from "../lib/utils";

const Loader = ({ className }: { className?: string }) => {
  return (
    <div>
      <LoaderCircle className={cn("animate-spin", className)} />
    </div>
  );
};
export default Loader;

import { cn } from "@/lib/utils";
import { buildFileUrl } from "@/utils";

const SecureImage = ({
  fileURL,
  fileName,
  className = "",
}: {
  fileURL: string;
  fileName: string;
  className?: string;
}) => {
  return (
    <img
      src={buildFileUrl(fileURL)}
      alt={fileName}
      className={cn("object-cover w-full h-full", className)}
    />
  );
};

export default SecureImage;

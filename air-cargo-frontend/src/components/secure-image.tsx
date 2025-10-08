import { cn } from "@/lib/utils";

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
      src={import.meta.env.VITE_BACKEND_API_URL + "/api" + fileURL}
      alt={fileName}
      className={cn("object-cover w-full h-full", className)}
    />
  );
};

export default SecureImage;

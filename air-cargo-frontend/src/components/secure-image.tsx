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
  console.log(
    import.meta.env.VITE_BACKEND_API_URL + "/api/files/view?url=" + fileURL
  );
  return (
    <img
      src={buildFileUrl(
        import.meta.env.VITE_BACKEND_API_URL + "/api/files/view?url=" + fileURL
      )}
      alt={fileName}
      className={cn("object-cover w-full h-full", className)}
    />
  );
};

export default SecureImage;

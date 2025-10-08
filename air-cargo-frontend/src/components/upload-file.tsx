import { useAddPhotos } from "@/services/calls/mutators";
import { buildFileUrl } from "@/utils";
import {
  useGlobalLoadingStore,
  useModalNumber,
  useSelectedCargoStore,
} from "@/utils/store";
import { Dialog, DialogContent, DialogTitle } from "@components/ui/dialog";
import { Image, LoaderCircle, Luggage } from "lucide-react";
import { ReactNode, useState } from "react";
import { Button } from "@components/ui/button";
import { toast } from "./ui/use-toast";
import { File } from "@/utils/types";
import { useTranslation } from "react-i18next";

export const UploadFile = ({
  originalFile,
  fileType,
  AltImage = <Image size={40} />,
}: {
  originalFile?: File;
  fileType?: string;
  AltImage?: string | ReactNode;
}) => {
  const { t } = useTranslation();
  const [file, setFile] = useState<any>();
  const [fileUrl, setFileUrl] = useState<string>(
    originalFile ? buildFileUrl(originalFile.fileUrl) : ""
  );
  const cargoStore = useSelectedCargoStore();
  const { mutate: uploadPhoto, isLoading: isUploading } = useAddPhotos();
  const globalLoading = useGlobalLoadingStore();

  const handleFileChange = ({ target }: { target: HTMLInputElement }) => {
    const selectedFile = target.files?.[0];

    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        setFile(selectedFile);
        setFileUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const saveImage = async () => {
    globalLoading.setGlobalLoading(true);

    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      uploadPhoto(
        { photo: formData, cargoId: cargoStore.cargo?.id },
        {
          onSuccess: () => {
            toast({
              title: t("upload.success"),
              description: t("upload.photoUploaded"),
            });
            setFile(null);
          },
          onError: () => {
            toast({
              variant: "destructive",
              title: t("error"),
              description: t("upload.uploadFailed"),
            });
          },
          onSettled: () => {
            globalLoading.setGlobalLoading(false);
          },
        }
      );
    } else {
      toast({
        variant: "destructive",
        title: t("error"),
        description: t("upload.selectFile"),
      });
      globalLoading.setGlobalLoading(false);
    }
  };

  const isLoading = isUploading || globalLoading.globalLoading;

  return (
    <div>
      <div className="flex flex-col items-center justify-center gap-3 my-2">
        {fileUrl ? (
          <img
            src={fileUrl}
            className="md:w-[400px] md:h-[350px] w-40 h-40 rounded-lg"
            alt={t("upload.previewAlt")}
          />
        ) : (
          AltImage!
        )}
      </div>
      <input
        type="file"
        id="file-input"
        style={{ display: "none" }}
        accept={fileType}
        onChange={handleFileChange}
      />
      <div className="flex flex-col gap-2">
        <Button
          className="text-base w-full"
          variant={"outline"}
          id="upload-button"
          disabled={isLoading}
          onClick={() => {
            (document.getElementById("file-input") as HTMLElement).click();
          }}
        >
          {t("upload.edit")}
        </Button>
        <Button
          className="text-base w-full"
          disabled={!file || isLoading}
          onClick={saveImage}
        >
          {isLoading ? (
            <LoaderCircle className="h-5 w-5 animate-spin" />
          ) : (
            t("upload.uploadButton")
          )}
        </Button>
      </div>
    </div>
  );
};

export const UploadModal = ({
  opened = false,
  name = "upload.uploadPhoto",
  originalFile,
}: {
  opened?: boolean;
  name?: string;
  originalFile?: File;
}) => {
  const { t } = useTranslation();
  const modalNumber = useModalNumber();
  const [open, setOpen] = useState(opened);

  const handleOpenChange = () => {
    setOpen(false);
    modalNumber.setModalNumberAndType(0);
    location.reload();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {!open && (
        <Button variant={"ghost"} onClick={() => setOpen(true)}>
          {t("upload.editPhoto")}
        </Button>
      )}
      <DialogContent className="w-full">
        <DialogTitle>{t(name)}</DialogTitle>
        <div className="h-fit flex flex-col justify-evenly items-stretch">
          <UploadFile
            originalFile={originalFile}
            fileType="image/*"
            AltImage={<Luggage size={60} className="my-10" />}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

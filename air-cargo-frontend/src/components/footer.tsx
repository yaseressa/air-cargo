import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export const Footer = ({ className }: { className?: string }) => {
  const { t } = useTranslation();

  return (
    <div className="mt-14">
      <footer
        className={cn(
          "flex items-center justify-center w-full h-10 px-5 fixed bottom-0 border border-t-secondary bg-background/85 backdrop-blur-lg",
          className
        )}
      >
        <div className="flex items-center justify-start text-primary text-xs">
          &copy; {new Date().getFullYear()} {t("footer.copyright")}
        </div>
      </footer>
    </div>
  );
};

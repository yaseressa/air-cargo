import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
import { LoginForm } from "../components/login-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTranslation } from "react-i18next";
import { LanguageToggle } from "@/components/lang-toggle";

export default () => {
  const { t } = useTranslation();

  return (
    <div className="w-full grid sm:grid-col-1 lg:min-h-[600px] lg:grid-cols-[450px_1fr_60px] xl:min-h-[800px] h-screen bg-background overflow-y-hidden">
      <div className="flex items-center justify-center py-12 backdrop-brightness-150 backdrop-blur-2xl border z-10">
        <div className="mx-auto grid md:w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold text-mute">{t("login")}</h1>
          </div>
          <LoginForm />
        </div>
      </div>
      <div className="hidden lg:flex w-full  justify-center items-center z-0">
        <img src="logo.png" alt="Image" className="md:w-[400px]" />
      </div>
      <div className="flex justify-end items-start m-2 z-10 gap-2">
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger>
              <ThemeToggle />
            </TooltipTrigger>
            <TooltipContent side="right" className="slide-in-from-left-28 ">
              <p className="uppercase">{t("theme")}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <LanguageToggle />
      </div>
    </div>
  );
};

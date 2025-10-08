import { useTranslation } from "react-i18next";
import { SelectWrapper } from "./re/select";
import { Button } from "./ui/button";
import { useDefaultLanguageStore } from "@/utils/store";

export const LanguageToggle = () => {
  const { i18n } = useTranslation();
  const defaultLanguage = useDefaultLanguageStore();
  return (
    <Button size={"icon"} variant={"outline"}>
      <SelectWrapper
        caretVisible={false}
        data={[
          { value: "en", label: "EN" },
          { value: "so", label: "SO" },
        ]}
        onValueChange={(value) => {
          defaultLanguage.setDefaultLanguage(value);
          i18n.changeLanguage(value);
        }}
        defaultValue="en"
        className="p-0 m-0 border-0 shadow-none"
        trigger={
          <Button variant="ghost" size="icon" className="ml-2 text-xs">
            {defaultLanguage.defaultLanguage.toUpperCase()}
          </Button>
        }
      />
    </Button>
  );
};

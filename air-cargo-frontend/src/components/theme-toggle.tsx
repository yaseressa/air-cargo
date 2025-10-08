import { useTheme } from "./theme-provider";
import { Moon, SunDim } from "lucide-react";
import { Button } from "./ui/button";

export const ThemeToggle = () => {
  const { setTheme, theme } = useTheme();

  return (
    <Button
      size={"icon"}
      variant={"outline"}
      className="p-4"
      onClick={() => setTheme(theme == "dark" ? "light" : "dark")}
    >
      <div>
        {theme === "light" ? (
          <Moon size={16} className="cursor-pointer" />
        ) : (
          <SunDim size={16} className="cursor-pointer" />
        )}
      </div>
    </Button>
  );
};

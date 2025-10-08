import { Button } from "./button";
import { Input } from "./input";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { cn } from "@/lib/utils";
import { Paintbrush } from "lucide-react";
import { useState } from "react";

export function PickerExample() {
  const [background, setBackground] = useState("#B4D455");

  return (
    <div
      className="w-full h-full preview flex min-h-[350px] justify-center p-10 items-center rounded !bg-cover !bg-center transition-all"
      style={{ background }}
    >
      <GradientPicker background={background} setBackground={setBackground} />
    </div>
  );
}

export function GradientPicker({
  background,
  setBackground,
  className,
}: {
  background: string;
  setBackground: (background: string) => void;
  className?: string;
}) {
  const solids = [
    "221 83% 53%", // Royal blue
    "152 100% 32%",
    "198 93% 60%", // Sky blue
    "262 83% 58%", // Indigo
    "276 83% 53%", // Purple
    "0 72% 51%", // Bright red
    "24 95% 53%", // Orange
    "46 95% 54%", // Amber
    "142 71% 29%", // Emerald green
    "168 84% 78%", // Light teal
    "326 83% 53%",
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[220px] justify-start text-left font-normal",
            !background && "text-muted-foreground",
            className
          )}
        >
          <div className="w-full flex items-center gap-2">
            {background ? (
              <div
                className="h-4 w-4 rounded !bg-center !bg-cover transition-all"
                style={{ background: `hsl(${background})` }}
              ></div>
            ) : (
              <Paintbrush className="h-4 w-4" />
            )}
            <div className="truncate flex-1">
              {background ? background : "Pick a color"}
            </div>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="flex flex-wrap gap-1 mt-0">
          {solids.map((s) => (
            <div
              key={s}
              style={{ background: `hsl(${s})` }}
              className="rounded-md h-6 w-6 cursor-pointer active:scale-105"
              onClick={() => setBackground(s)}
            />
          ))}
        </div>
        <Input
          id="custom"
          value={background}
          className="col-span-2 h-8 mt-4"
          onChange={(e) => setBackground(e.currentTarget.value)}
        />
      </PopoverContent>
    </Popover>
  );
}

// const GradientButton = ({
//   background,
//   children,
// }: {
//   background: string;
//   children: React.ReactNode;
// }) => {
//   return (
//     <div
//       className="p-0.5 rounded-md relative !bg-cover !bg-center transition-all"
//       style={{ background }}
//     >
//       <div className="bg-popover/80 rounded-md p-1 text-xs text-center">
//         {children}
//       </div>
//     </div>
//   );
// };

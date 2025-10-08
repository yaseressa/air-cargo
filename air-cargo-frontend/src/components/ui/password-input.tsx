import { forwardRef, useState } from "react";
import { EyeIcon, EyeOffIcon, Shuffle } from "lucide-react";
import { Button } from "./button";
import { InputProps } from "./input";
import { cn } from "@/lib/utils";
import { FloatingLabelInput } from "../re/input";

interface PasswordInputProps extends InputProps {
  onPasswordGenerate?: (password: string) => void;
  passwordLength?: number;
  label?: string;
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    { className, onPasswordGenerate, passwordLength = 8, label, ...props },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const passwordGen = () => {
      const characters =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
      let password = "";
      for (let i = 0; i < passwordLength; i++) {
        password += characters.charAt(
          Math.floor(Math.random() * characters.length)
        );
      }
      return password;
    };

    const handleGeneratePassword = () => {
      const newPassword = passwordGen();
      onPasswordGenerate?.(newPassword);
    };

    const disabled =
      props.value === "" || props.value === undefined || props.disabled;
    // const splitted = props.name?.toLowerCase().split("password");
    // const rejoined = splitted?.join("").trim();
    return (
      <div className="relative">
        <FloatingLabelInput
          label={label}
          type={showPassword ? "text" : "password"}
          className={cn("hide-password-toggle pr-10", className)}
          ref={ref}
          {...props}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={() => setShowPassword((prev) => !prev)}
          disabled={disabled}
        >
          {showPassword && !disabled ? (
            <EyeIcon className="h-5 w-6 text-primary" aria-hidden="true" />
          ) : (
            <EyeOffIcon className="h-5 w-6 text-primary" aria-hidden="true" />
          )}
          <span className="sr-only">
            {showPassword ? "Hide password" : "Show password"}
          </span>
        </Button>
        {onPasswordGenerate && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-10 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={handleGeneratePassword}
          >
            <Shuffle className="h-5 w-6 text-primary" aria-hidden="true" />
          </Button>
        )}
        {/* Hides browser's password toggles */}
        <style>{`
          .hide-password-toggle::-ms-reveal,
          .hide-password-toggle::-ms-clear {
            visibility: hidden;
            pointer-events: none;
            display: none;
          }
        `}</style>
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";

export { PasswordInput };

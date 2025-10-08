import { ReactNode } from "react";
import { FormItem, FormLabel } from "../ui/form";
import { Checkbox } from "../ui/checkbox";

export type CheckboxWrapperProps = {
  label?: ReactNode;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  defaultValue?: boolean;
  disabled?: boolean;
  isForm?: boolean;
  className?: string;

  id?: string;
  required?: boolean;
};

export const CheckboxWrapper = ({
  label,
  checked,
  onCheckedChange,
  defaultValue,
  disabled = false,
  isForm = false,
  className,
  id,
  required = false,
}: CheckboxWrapperProps) => {
  const checkboxElement = (
    <Checkbox
      id={id}
      checked={checked}
      onCheckedChange={onCheckedChange}
      defaultChecked={defaultValue}
      disabled={disabled}
      className={className}
      required={required}
    />
  );

  if (isForm) {
    return (
      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
        {checkboxElement}
        {label && <FormLabel htmlFor={id}>{label}</FormLabel>}
      </FormItem>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      {checkboxElement}
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {label}
        </label>
      )}
    </div>
  );
};

import { ReactNode } from "react";
import { FormControl } from "../ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export type Item = {
  label: ReactNode;
  value: string;
};

export type SelectWrapperProps = {
  data: Item[];
  onValueChange: (value: string) => void;
  defaultValue?: string;
  placeholder?: string;
  value?: string;
  isForm?: boolean;
  trigger?: ReactNode;
  className?: string;
  readonly?: boolean;
  caretVisible?: boolean;
};
export const SelectWrapper = ({
  data,
  onValueChange,
  defaultValue,
  placeholder = "Select",
  trigger,
  isForm,
  value = "",
  className,
  readonly = false,
  caretVisible = true,
}: SelectWrapperProps) => {
  return (
    <Select
      onValueChange={onValueChange}
      defaultValue={defaultValue}
      value={value}
      disabled={readonly}
    >
      {isForm ? (
        <FormControl>
          <SelectTrigger className={className} caretVisible={caretVisible}>
            {trigger ? trigger : <SelectValue placeholder={placeholder} />}
          </SelectTrigger>
        </FormControl>
      ) : (
        <SelectTrigger className={className} caretVisible={caretVisible}>
          {trigger ? trigger : <SelectValue placeholder={placeholder} />}
        </SelectTrigger>
      )}
      <SelectContent>
        {data?.map((i) => (
          <SelectItem key={i.value} value={i.value}>
            {i.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

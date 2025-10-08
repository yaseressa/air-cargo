import { Search, X } from "lucide-react";
import { Input } from "../ui/input";

type CommmandInputProps = {
  setQuery: (query: string) => void;
  query: string;
  placeholder?: string;
};
const CommandInput = ({ setQuery, query, placeholder }: CommmandInputProps) => {
  return (
    <div className="flex items-center border-b px-3">
      <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
      <Input
        placeholder={placeholder}
        onChange={(e) => setQuery(e.target.value)}
        value={query}
        tabIndex={20}
        className="flex border-none focus-visible:ring-0 focus-visible:ring-transparent h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none focused:outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
      />
      <X className="h-4 w-4 cursor-pointer" onClick={() => setQuery("")} />
    </div>
  );
};

export { CommandInput };

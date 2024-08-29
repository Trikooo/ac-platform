import React, { useState, useRef, useEffect } from "react";
import { Check, ChevronDown, X, Search, Loader2, AlertCircle } from "lucide-react"; // Added AlertCircle
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export type Option = {
  value: string;
  label: string;
};

interface SelectProps {
  id: string;
  options: Option[];
  selectedOptions: Option[];
  onChange: (selectedOptions: Option[]) => void;
  multiple?: boolean;
  searchable?: boolean;
  loading?: boolean;
  error?: unknown; // Added error prop
}

const Select: React.FC<SelectProps> = ({
  id,
  options,
  selectedOptions,
  onChange,
  multiple = false,
  searchable = true,
  loading = false,
  error = false, // Default to false
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [positionAbove, setPositionAbove] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [isKeyboardNav, setIsKeyboardNav] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleOptionClick = (option: Option) => {
    if (multiple) {
      if (option.value === "none") {
        onChange([]);
      } else {
        const isSelected = selectedOptions.some((o) => o.value === option.value);
        const newSelectedOptions = isSelected
          ? selectedOptions.filter((o) => o.value !== option.value)
          : [...selectedOptions, option];
        onChange(newSelectedOptions);
      }
    } else {
      if (option.value === "none") {
        onChange([]);
      } else {
        onChange([option]);
        setOpen(false);
      }
    }
  };

  const handleRemoveSelectedOption = (option: Option, event: React.MouseEvent) => {
    event.stopPropagation();
    const newSelectedOptions = selectedOptions.filter((o) => o.value !== option.value);
    onChange(newSelectedOptions);
  };

  const filteredOptions = searchable
    ? [{ value: "none", label: "None" }, ...options.filter((option) =>
        option.label.toLowerCase().includes(search.toLowerCase())
      )]
    : [{ value: "none", label: "None" }, ...options];

  const handleClickOutside = (event: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
      setOpen(false);
      setFocusedIndex(-1);
      setIsKeyboardNav(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!open && event.key === "Enter" && document.activeElement === buttonRef.current) {
      event.preventDefault();
      setOpen(true);
      return;
    }

    if (!open) return;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setIsKeyboardNav(true);
        setFocusedIndex((prevIndex) =>
          prevIndex < filteredOptions.length - 1 ? prevIndex + 1 : prevIndex
        );
        break;
      case "ArrowUp":
        event.preventDefault();
        setIsKeyboardNav(true);
        setFocusedIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
        break;
      case "Enter":
        event.preventDefault();
        if (focusedIndex !== -1) {
          handleOptionClick(filteredOptions[focusedIndex]);
        }
        break;
      case "Escape":
        setOpen(false);
        setFocusedIndex(-1);
        setIsKeyboardNav(false);
        break;
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, focusedIndex, filteredOptions]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    if (open && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const availableSpaceBelow = window.innerHeight - containerRect.bottom;
      const dropdownHeight = 240; // Adjust this value based on your dropdown height

      setPositionAbove(availableSpaceBelow < dropdownHeight);
    }
  }, [open]);

  useEffect(() => {
    if (optionsRef.current && focusedIndex >= 0) {
      const focusedOption = optionsRef.current.children[focusedIndex] as HTMLElement;
      if (focusedOption) {
        focusedOption.scrollIntoView({ block: 'nearest', inline: 'start' });
      }
    }
  }, [focusedIndex]);

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-start w-full justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          "cursor-pointer"
        )}
      >
        <div className="flex flex-wrap gap-1">
          {selectedOptions.length > 0 ? (
            multiple ? (
              selectedOptions.map((o) => (
                <Badge
                  key={o.value}
                  variant="outline"
                  className="flex items-center cursor-pointer"
                  onClick={(event) => handleRemoveSelectedOption(o, event)}
                >
                  {o.label}
                  <X className="ml-1 h-3 w-3" />
                </Badge>
              ))
            ) : (
              <span>{selectedOptions[0].label}</span>
            )
          ) : (
            "Select options"
          )}
        </div>
        {error ? (
          <AlertCircle className="h-4 w-4 text-red-500" /> // Display error icon
        ) : loading ? (
          <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
        ) : (
          <ChevronDown className="h-4 w-4 opacity-50" />
        )}
      </button>
      {open && !loading && !error && (
        <div
          className={cn(
            "absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md",
            positionAbove ? "bottom-full mb-2 animate-drop-in" : "top-full mt-2 animate-dropdown-in"
          )}
        >
          <div className="sticky top-0 z-10 bg-background p-2">
            {searchable && (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex h-11 w-full rounded-md bg-transparent py-3 pl-10 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  ref={inputRef}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            )}
            <hr className="mt-2" />
          </div>
          <div className="p-1" ref={optionsRef}>
            {filteredOptions.map((option, index) => (
              <div
                key={option.value}
                onClick={() => handleOptionClick(option)}
                onMouseEnter={() => {
                  setFocusedIndex(index);
                  setIsKeyboardNav(false);
                }}
                className={cn(
                  "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm",
                  (isKeyboardNav && index === focusedIndex) && "bg-accent text-accent-foreground",
                  "hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {(option.value === "none" ? selectedOptions.length === 0 : selectedOptions.some((o) => o.value === option.value)) && (
                  <Check className="absolute left-2 h-4 w-4" />
                )}
                {option.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Select;

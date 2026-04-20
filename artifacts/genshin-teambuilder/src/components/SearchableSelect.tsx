import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface SearchableSelectProps {
  options: string[]
  value: string | null
  onChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  disabled?: boolean
  testId?: string
  getIcon?: (option: string) => string | null
}

function OptionIcon({ src, alt }: { src: string | null; alt: string }) {
  if (!src) {
    return (
      <div
        aria-hidden
        className="mr-2 h-6 w-6 shrink-0 rounded bg-secondary/50"
      />
    )
  }
  return (
    <img
      src={src}
      alt=""
      aria-hidden
      loading="lazy"
      className="mr-2 h-6 w-6 shrink-0 rounded object-cover bg-secondary/30"
      onError={(e) => {
        ;(e.currentTarget as HTMLImageElement).style.visibility = "hidden"
      }}
    />
  )
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  emptyText = "No results found.",
  disabled = false,
  testId,
  getIcon,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-card hover:bg-accent/50"
          disabled={disabled}
          data-testid={testId}
        >
          <span className="flex items-center min-w-0 truncate">
            {value && getIcon ? (
              <OptionIcon src={getIcon(value)} alt={value} />
            ) : null}
            <span className="truncate">{value ? value : placeholder}</span>
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-popover" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option}
                  value={option}
                  onSelect={() => {
                    onChange(option)
                    setOpen(false)
                  }}
                  data-testid={`${testId}-item-${option.replace(/\s+/g, '-').toLowerCase()}`}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 shrink-0",
                      value === option ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {getIcon ? <OptionIcon src={getIcon(option)} alt={option} /> : null}
                  <span className="truncate">{option}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

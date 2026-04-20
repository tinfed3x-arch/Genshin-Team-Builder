import { useEffect, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

export const SET_ALL_EVENT = "gtb:set-all-sections";

export type SetAllSectionsDetail = { open: boolean };

interface CollapsibleSectionProps {
  id: string;
  title: ReactNode;
  defaultOpen?: boolean;
  badge?: ReactNode;
  children: ReactNode;
  testId?: string;
}

export function CollapsibleSection({
  id: _id,
  title,
  defaultOpen = false,
  badge,
  children,
  testId,
}: CollapsibleSectionProps) {
  // Always start from the section's `defaultOpen` value on every page load —
  // we intentionally do NOT persist per-section state. The Expand-All /
  // Collapse-All toolbar buttons still work for the current session via
  // the SET_ALL_EVENT custom event below.
  const [open, setOpen] = useState<boolean>(defaultOpen);

  useEffect(() => {
    const handler = (ev: Event) => {
      const detail = (ev as CustomEvent<SetAllSectionsDetail>).detail;
      if (detail && typeof detail.open === "boolean") {
        setOpen(detail.open);
      }
    };
    window.addEventListener(SET_ALL_EVENT, handler as EventListener);
    return () => window.removeEventListener(SET_ALL_EVENT, handler as EventListener);
  }, []);

  return (
    <Collapsible open={open} onOpenChange={setOpen} data-testid={testId}>
      <CollapsibleTrigger
        className="flex w-full items-center justify-between gap-2 text-left group"
        data-testid={testId ? `${testId}-trigger` : undefined}
      >
        <div className="flex items-center gap-2 min-w-0">
          <h3 className="font-semibold text-primary truncate">{title}</h3>
          {badge}
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200",
            open ? "rotate-180" : "rotate-0",
          )}
          aria-hidden
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-3">{children}</CollapsibleContent>
    </Collapsible>
  );
}

export function dispatchSetAllSections(open: boolean) {
  window.dispatchEvent(
    new CustomEvent<SetAllSectionsDetail>(SET_ALL_EVENT, { detail: { open } }),
  );
}

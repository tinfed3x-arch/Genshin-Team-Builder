import { useEffect, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

export const SET_ALL_EVENT = "gtb:set-all-sections";
export const OPEN_SECTION_EVENT = "gtb:open-section";

export type SetAllSectionsDetail = { open: boolean };
export type OpenSectionDetail = { id: string };

interface CollapsibleSectionProps {
  id: string;
  title: ReactNode;
  defaultOpen?: boolean;
  badge?: ReactNode;
  children: ReactNode;
  testId?: string;
}

export function CollapsibleSection({
  id,
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
    // Bulk open/close from the toolbar buttons.
    const setAllHandler = (ev: Event) => {
      const detail = (ev as CustomEvent<SetAllSectionsDetail>).detail;
      if (detail && typeof detail.open === "boolean") {
        setOpen(detail.open);
      }
    };
    // Targeted "open this specific section" event used when a related
    // form field changes (e.g. picking a weapon opens Weapon Details).
    const openHandler = (ev: Event) => {
      const detail = (ev as CustomEvent<OpenSectionDetail>).detail;
      if (detail && detail.id === id) {
        setOpen(true);
      }
    };
    window.addEventListener(SET_ALL_EVENT, setAllHandler as EventListener);
    window.addEventListener(OPEN_SECTION_EVENT, openHandler as EventListener);
    return () => {
      window.removeEventListener(SET_ALL_EVENT, setAllHandler as EventListener);
      window.removeEventListener(OPEN_SECTION_EVENT, openHandler as EventListener);
    };
  }, [id]);

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

// Dispatch via a 0ms timeout so the event fires AFTER React commits — by
// then the target section is mounted and listening, even if it appeared
// for the first time as a result of the same field change.
export function openSection(id: string) {
  setTimeout(() => {
    window.dispatchEvent(
      new CustomEvent<OpenSectionDetail>(OPEN_SECTION_EVENT, { detail: { id } }),
    );
  }, 0);
}

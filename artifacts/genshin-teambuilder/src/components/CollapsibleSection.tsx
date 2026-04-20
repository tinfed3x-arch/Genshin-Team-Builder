import { useEffect, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

const STORAGE_PREFIX = "gtb:section:";
const BULK_KEY = "gtb:section:_bulk";
export const SET_ALL_EVENT = "gtb:set-all-sections";

export type SetAllSectionsDetail = { open: boolean };

function readStored(id: string, defaultOpen: boolean): boolean {
  try {
    // Per-section state takes precedence — explicit user choices on this section win.
    const v = localStorage.getItem(STORAGE_PREFIX + id);
    if (v === "1") return true;
    if (v === "0") return false;
    // Otherwise fall back to the most recent bulk action so newly-mounted
    // sections (e.g. Weapon Details after picking a weapon) honour the
    // user's last "Collapse All" / "Expand All" intent.
    const bulk = localStorage.getItem(BULK_KEY);
    if (bulk === "1") return true;
    if (bulk === "0") return false;
  } catch {
    /* localStorage may be unavailable */
  }
  return defaultOpen;
}

function writeStored(id: string, open: boolean) {
  try {
    localStorage.setItem(STORAGE_PREFIX + id, open ? "1" : "0");
  } catch {
    /* ignore */
  }
}

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
  defaultOpen = true,
  badge,
  children,
  testId,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState<boolean>(() => readStored(id, defaultOpen));

  useEffect(() => {
    writeStored(id, open);
  }, [id, open]);

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
  try {
    localStorage.setItem(BULK_KEY, open ? "1" : "0");
  } catch {
    /* ignore */
  }
  window.dispatchEvent(
    new CustomEvent<SetAllSectionsDetail>(SET_ALL_EVENT, { detail: { open } }),
  );
}

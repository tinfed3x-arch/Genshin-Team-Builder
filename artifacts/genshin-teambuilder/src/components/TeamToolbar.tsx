import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  useInventory,
  setOwnedOnlyCharacters,
  setOwnedOnlyWeapons,
} from "@/lib/inventory";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import {
  type TeamState,
  defaultTeam,
  encodeTeam,
  saveTeam,
  loadTeam,
  deleteTeam,
  getSavedTeamNames,
  teamExists,
} from "@/lib/teamState";
import { dispatchSetAllSections } from "@/components/CollapsibleSection";

interface TeamToolbarProps {
  team: TeamState;
  onLoad: (team: TeamState) => void;
}

export default function TeamToolbar({ team, onLoad }: TeamToolbarProps) {
  const { toast } = useToast();
  const {
    ownedOnlyCharacters,
    ownedOnlyWeapons,
    ownedChars,
    ownedWeapons,
  } = useInventory();
  const charsInventoryEmpty = ownedChars.size === 0;
  const weaponsInventoryEmpty = ownedWeapons.size === 0;
  const [savedNames, setSavedNames] = useState<string[]>([]);
  const [saveOpen, setSaveOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [name, setName] = useState("");
  const [shareUrl, setShareUrl] = useState("");

  const refreshNames = () => setSavedNames(getSavedTeamNames());

  useEffect(() => {
    refreshNames();
  }, []);

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (teamExists(trimmed)) {
      const ok = window.confirm(
        `A team named "${trimmed}" already exists. Overwrite it?`
      );
      if (!ok) return;
    }
    saveTeam(trimmed, team);
    refreshNames();
    setSaveOpen(false);
    setName("");
    toast({ title: "Team saved", description: `"${trimmed}" was saved to this browser.` });
  };

  const handleLoad = (n: string) => {
    const loaded = loadTeam(n);
    if (loaded) {
      onLoad(loaded);
      toast({ title: "Team loaded", description: `Loaded "${n}".` });
    }
  };

  const handleDelete = (n: string) => {
    deleteTeam(n);
    refreshNames();
    toast({ title: "Team deleted", description: `Removed "${n}".` });
  };

  const handleShare = async () => {
    const encoded = encodeTeam(team);
    const url = `${window.location.origin}${window.location.pathname}#team=${encoded}`;
    setShareUrl(url);
    setShareOpen(true);
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copied", description: "Share link copied to clipboard." });
    } catch {
      // clipboard may be blocked; the dialog still shows the URL
    }
  };

  const handleClear = () => {
    onLoad(defaultTeam());
    toast({ title: "Team cleared" });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogTrigger asChild>
          <Button variant="default" data-testid="button-save-team">
            Save Team
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save team</DialogTitle>
            <DialogDescription>
              Give this team a name. It will be stored in this browser.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="e.g. Hyperbloom Nahida"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
            }}
            data-testid="input-team-name"
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setSaveOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!name.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" data-testid="button-load-team">
            Load Team
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuLabel>Saved teams</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {savedNames.length === 0 ? (
            <DropdownMenuItem disabled>No saved teams yet</DropdownMenuItem>
          ) : (
            savedNames.map((n) => (
              <DropdownMenuItem
                key={n}
                onSelect={(e) => e.preventDefault()}
                className="flex justify-between gap-2"
              >
                <button
                  type="button"
                  className="flex-1 text-left truncate"
                  onClick={() => handleLoad(n)}
                  data-testid={`load-${n}`}
                >
                  {n}
                </button>
                <button
                  type="button"
                  className="text-destructive text-xs hover:underline"
                  onClick={() => handleDelete(n)}
                  data-testid={`delete-${n}`}
                >
                  Delete
                </button>
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button variant="outline" onClick={handleShare} data-testid="button-share-team">
        Share Link
      </Button>

      <Button
        variant="outline"
        onClick={() => dispatchSetAllSections(false)}
        data-testid="button-collapse-all"
        title="Collapse all detail sections across every slot"
      >
        Collapse All
      </Button>

      <Button
        variant="outline"
        onClick={() => dispatchSetAllSections(true)}
        data-testid="button-expand-all"
        title="Expand all detail sections across every slot"
      >
        Expand All
      </Button>

      <Button variant="ghost" onClick={handleClear} data-testid="button-clear-team">
        Clear
      </Button>

      <div className="flex items-center gap-3 ml-auto pl-2 border-l border-border/60 flex-wrap">
        <div className="flex items-center gap-2">
          <Switch
            id="owned-only-characters-toggle"
            checked={ownedOnlyCharacters}
            onCheckedChange={setOwnedOnlyCharacters}
            disabled={charsInventoryEmpty && !ownedOnlyCharacters}
            data-testid="toggle-owned-only-characters"
          />
          <Label
            htmlFor="owned-only-characters-toggle"
            className="text-sm cursor-pointer select-none"
            title={
              charsInventoryEmpty
                ? "Mark characters as owned in My Inventory first"
                : "Only show owned characters in the character picker"
            }
          >
            Owned characters
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="owned-only-weapons-toggle"
            checked={ownedOnlyWeapons}
            onCheckedChange={setOwnedOnlyWeapons}
            disabled={weaponsInventoryEmpty && !ownedOnlyWeapons}
            data-testid="toggle-owned-only-weapons"
          />
          <Label
            htmlFor="owned-only-weapons-toggle"
            className="text-sm cursor-pointer select-none"
            title={
              weaponsInventoryEmpty
                ? "Mark weapons as owned in My Inventory first"
                : "Only show owned weapons in the weapon picker"
            }
          >
            Owned weapons
          </Label>
        </div>
        <Link href="/inventory">
          <Button variant="outline" size="sm" data-testid="link-inventory">
            My Inventory
          </Button>
        </Link>
      </div>

      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share this team</DialogTitle>
            <DialogDescription>
              Anyone with this link will see the same team build.
            </DialogDescription>
          </DialogHeader>
          <Input
            readOnly
            value={shareUrl}
            onFocus={(e) => e.currentTarget.select()}
            data-testid="input-share-url"
          />
          <DialogFooter>
            <Button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(shareUrl);
                  toast({ title: "Link copied" });
                } catch {
                  toast({ title: "Copy failed", description: "Please copy manually." });
                }
              }}
            >
              Copy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

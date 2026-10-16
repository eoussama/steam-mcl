import type { TOwnership } from "@/features/ownership";

import { useQueryClient } from "@tanstack/react-query";
import { DatabaseZap, Import, Loader2, MoreHorizontal, RefreshCw } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ImportOwnershipDialog } from "@/features/ownership/ImportOwnershipDialog";
import { clearCachedData } from "@/lib/query/persister";



type TProfileActionsProps = {
  profileName: string;
  ownership: TOwnership;
  isRefreshing: boolean;
  onRefresh: () => void;
  compact: boolean;
  importOpen: boolean;
  onImportOpenChange: (open: boolean) => void;
};

/**
 * @description
 * Secondary profile actions: importing what the account owns, refreshing the library and clearing cached data.
 *
 * @param props - Component props.
 * @param props.profileName - Name of the profile.
 * @param props.ownership - Ownership state of the profile.
 * @param props.isRefreshing - Whether the library is being fetched again.
 * @param props.onRefresh - Fetches the profile and library again.
 * @param props.compact - Whether the header is in its condensed form.
 * @param props.importOpen - Whether the import dialog shows.
 * @param props.onImportOpenChange - Opens or closes the import dialog.
 * @returns The actions menu and its dialogs.
 */
export const ProfileActions: React.FC<TProfileActionsProps> = ({
  profileName,
  ownership,
  isRefreshing,
  onRefresh,
  compact,
  importOpen,
  onImportOpenChange,
}) => {
  const queryClient = useQueryClient();
  const [clearOpen, setClearOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const clear = async () => {
    setIsClearing(true);
    await clearCachedData(queryClient);
    // A fresh start runs the analysis from scratch with nothing left in memory.
    window.location.reload();
  };

  return (
    <>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger
            render={(
              <DropdownMenuTrigger
                render={<Button variant="outline" size={compact ? "icon-sm" : "icon"} aria-label="More actions" className="shrink-0" />}
              />
            )}
          >
            {isRefreshing ? <Loader2 className="animate-spin" /> : <MoreHorizontal />}
          </TooltipTrigger>
          <TooltipContent side="bottom">More actions</TooltipContent>
        </Tooltip>

        <DropdownMenuContent align="end" className="min-w-64">
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => onImportOpenChange(true)}>
              <Import />
              <span className="flex-1">Import what you own…</span>
              {ownership.imported && <span className="text-xs text-success">Imported</span>}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onRefresh} disabled={isRefreshing}>
              <RefreshCw />
              Refresh library
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => setClearOpen(true)}>
            <DatabaseZap />
            Clear cached data…
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ImportOwnershipDialog open={importOpen} onOpenChange={onImportOpenChange} profileName={profileName} ownership={ownership} />

      <Dialog open={clearOpen} onOpenChange={setClearOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear cached data?</DialogTitle>
            <DialogDescription>
              Profiles, libraries and store data are fetched from Steam again. Large libraries can take a few minutes,
              as Steam limits how fast it answers. Items you marked or imported stay as they are.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button variant="destructive" onClick={() => void clear()} disabled={isClearing}>
              {isClearing && <Loader2 className="animate-spin" />}
              Clear and reload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

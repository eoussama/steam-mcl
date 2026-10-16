import type { TOwnership } from "./use-ownership";
import type { TUserData } from "./userdata";

import { useForm } from "@tanstack/react-form";
import { ExternalLink, ShieldCheck, Trash2 } from "lucide-react";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

import { parseUserData, USERDATA_URL, UserDataError } from "./userdata";



type TImportOwnershipDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileName: string;
  ownership: TOwnership;
};

const numberFormat = new Intl.NumberFormat();
const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });

type TParseResult = { data: TUserData; error: null } | { data: null; error: string } | null;

function tryParse(text: string): TParseResult {
  if (!text.trim()) {
    return null;
  }

  try {
    return { data: parseUserData(text), error: null };
  }
  catch (error) {
    return { data: null, error: error instanceof UserDataError ? error.message : "That could not be read." };
  }
}

/**
 * @description
 * What a valid paste contains, or the format hint while nothing is pasted.
 *
 * @param props - Component props.
 * @param props.preview - Parse result of the current paste, null when empty.
 * @param props.profileName - Name of the profile the import applies to.
 * @returns The preview line.
 */
const ImportPreview: React.FC<{ preview: TParseResult; profileName: string }> = ({ preview, profileName }) => {
  const message = useMemo(() => {
    if (!preview) {
      return `It applies to ${profileName}, make sure you are signed in to that account.`;
    }

    if (preview.data === null) {
      return preview.error;
    }

    const { owned, ignored } = preview.data;

    return `Found ${numberFormat.format(owned.length)} owned apps${ignored.length > 0 ? ` and ${numberFormat.format(ignored.length)} ignored ones, which will be hidden` : ""}.`;
  }, [preview, profileName]);

  return <FieldDescription className={preview?.data ? "text-success" : undefined}>{message}</FieldDescription>;
};

/**
 * @description
 * Imports what a Steam account owns from the store userdata page, DLC included, which the public Web API leaves
 * out. The pasted page is parsed here and only app ids are kept, nothing is sent anywhere.
 *
 * @param props - Component props.
 * @param props.open - Whether the dialog shows.
 * @param props.onOpenChange - Opens or closes the dialog.
 * @param props.profileName - Name of the profile the import applies to.
 * @param props.ownership - Ownership state of the profile.
 * @returns The import dialog.
 */
export const ImportOwnershipDialog: React.FC<TImportOwnershipDialogProps> = ({ open, onOpenChange, profileName, ownership }) => {
  const form = useForm({
    defaultValues: { text: "" },
    validators: {
      onSubmit: ({ value }) => {
        const parsed = tryParse(value.text);

        if (!parsed) {
          return { fields: { text: "Paste the content of the userdata page first." } };
        }

        return parsed.error ? { fields: { text: parsed.error } } : undefined;
      },
    },
    onSubmit: ({ value }) => {
      ownership.importUserData(parseUserData(value.text));
      form.reset();
      onOpenChange(false);
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          form.reset();
        }

        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-lg [&>*]:min-w-0">
        <DialogHeader>
          <DialogTitle>Import what you own</DialogTitle>
          <DialogDescription>
            Steam only shares the games of a profile publicly, so DLC and soundtracks you own still show up as missing.
            Your store data lists everything your account owns.
          </DialogDescription>
        </DialogHeader>

        <ol className="list-inside list-decimal space-y-1.5 text-sm marker:font-semibold marker:text-steam-blue">
          <li>Sign in to the Steam store in this browser.</li>
          <li>
            Open
            {" "}
            <a href={USERDATA_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-link underline-offset-4 hover:underline">
              your store data
              <ExternalLink className="size-3.5" aria-hidden="true" />
            </a>
            .
          </li>
          <li>Select everything on that page, copy it and paste it below.</li>
        </ol>

        <form
          id="import-ownership"
          className="min-w-0"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            void form.handleSubmit();
          }}
        >
          <form.Field name="text">
            {(field) => {
              const errors = field.state.meta.errors.filter((error): error is string => typeof error === "string");
              const preview = errors.length === 0 ? tryParse(field.state.value) : null;

              return (
                <Field data-invalid={errors.length > 0 || undefined}>
                  <FieldLabel htmlFor="import-ownership-text">Store data</FieldLabel>
                  <Textarea
                    id="import-ownership-text"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => {
                      field.setErrorMap({ onSubmit: undefined });
                      field.handleChange(event.target.value);
                    }}
                    aria-invalid={errors.length > 0}
                    placeholder={`{"rgWishlist":[…],"rgOwnedPackages":[…],"rgOwnedApps":[…], …}`}
                    spellCheck={false}
                    autoComplete="off"
                    className="h-28 max-h-40 min-h-24 resize-y font-mono text-xs break-all field-sizing-fixed"
                  />
                  {errors.length > 0
                    ? <FieldError errors={errors.map(message => ({ message }))} />
                    : <ImportPreview preview={preview} profileName={profileName} />}
                </Field>
              );
            }}
          </form.Field>
        </form>

        {ownership.imported && (
          <div className="flex items-center justify-between gap-3 rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
            <span>
              Imported
              {" "}
              <strong className="text-foreground tabular-nums">{numberFormat.format(ownership.imported.owned)}</strong>
              {" "}
              owned apps on
              {" "}
              {dateFormat.format(ownership.imported.importedAt)}
              . Importing again replaces it.
            </span>
            <Button variant="ghost" size="sm" onClick={ownership.removeImport} className="shrink-0 text-destructive hover:text-destructive">
              <Trash2 />
              Remove
            </Button>
          </div>
        )}

        <DialogFooter className="items-center sm:justify-between">
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5 shrink-0 text-success" aria-hidden="true" />
            Read on this device, only app ids are kept.
          </p>
          <div className="flex gap-2">
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <form.Subscribe selector={state => state.isSubmitting}>
              {isSubmitting => <Button type="submit" form="import-ownership" disabled={isSubmitting}>Import</Button>}
            </form.Subscribe>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

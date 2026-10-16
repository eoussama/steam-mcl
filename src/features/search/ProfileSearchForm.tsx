import type { TSteamProfile } from "@/lib/steam";

import { useForm, useSelector } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Loader2, Search } from "lucide-react";
import { useRef } from "react";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";

import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { getProfileSlug } from "@/features/profile/queries";
import { STALE_TIMES } from "@/lib/query/cache-times";
import { getErrorCode } from "@/lib/query/retry";
import { profileInputSchema } from "@/lib/steam";
import { useTRPC } from "@/lib/trpc";
import { z } from "@/lib/zod";



const formSchema = z.object({ profile: profileInputSchema });

function getLookupMessage(error: unknown): string {
  switch (getErrorCode(error)) {
    case "NOT_FOUND":
      return "No Steam profile matches that name or ID";

    case "BAD_REQUEST":
      return "Enter a Steam ID64, a profile URL or a custom profile name";

    case "TOO_MANY_REQUESTS":
      return "Steam is busy right now, try again in a moment";

    default:
      return "Steam could not be reached, try again in a moment";
  }
}

function toMessages(errors: ReadonlyArray<unknown>): Array<{ message: string }> {
  return errors.flatMap((error) => {
    if (typeof error === "string") {
      return [{ message: error }];
    }

    if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
      return [{ message: error.message }];
    }

    return [];
  });
}

type TProfileSearchFormProps = {
  autoFocus?: boolean;
};

/**
 * @description
 * Profile lookup form. Resolves the profile before navigating so mistakes are reported inline, and seeds the
 * cache so the profile page renders straight away.
 *
 * @param props - Component props.
 * @param props.autoFocus - Whether to focus the field when the form shows.
 * @returns The search form.
 */
export const ProfileSearchForm: React.FC<TProfileSearchFormProps> = ({ autoFocus = false }) => {
  const trpc = useTRPC();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const resolvedRef = useRef<TSteamProfile | null>(null);

  const form = useForm({
    defaultValues: { profile: "" },
    // Always re-validate on submit, otherwise a stale error would block the next attempt.
    canSubmitWhenInvalid: true,
    validators: {
      onChange: formSchema,
      onSubmitAsync: async ({ value }) => {
        try {
          resolvedRef.current = await queryClient.fetchQuery({
            ...trpc.profile.resolve.queryOptions({ input: value.profile.trim() }),
            staleTime: STALE_TIMES.profile,
          });

          return null;
        }
        catch (error) {
          return { fields: { profile: getLookupMessage(error) } };
        }
      },
    },
    onSubmit: async () => {
      const profile = resolvedRef.current;

      if (!profile) {
        return;
      }

      const slug = getProfileSlug(profile);

      queryClient.setQueryData(trpc.profile.resolve.queryKey({ input: slug }), profile);
      await navigate({ to: "/$profile", params: { profile: slug } });
    },
  });

  const submissionAttempts = useSelector(form.store, state => state.submissionAttempts);

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}
    >
      <form.Field name="profile">
        {(field) => {
          // Format errors wait for a blur or a submit attempt so they do not nag while typing.
          const showErrors = field.state.meta.isBlurred || submissionAttempts > 0;
          const errors = showErrors ? toMessages(field.state.meta.errors) : [];
          const isInvalid = errors.length > 0;

          return (
            <Field data-invalid={isInvalid || undefined}>
              <FieldLabel htmlFor={field.name} className="text-base font-semibold">
                Steam profile
              </FieldLabel>

              <form.Subscribe selector={state => state.isSubmitting}>
                {isSubmitting => (
                  <InputGroup className="h-12 rounded-xl bg-background/60 dark:bg-input/30">
                    <InputGroupAddon>
                      <Search className="text-muted-foreground" />
                    </InputGroupAddon>

                    <InputGroupInput
                      id={field.name}
                      name={field.name}
                      autoFocus={autoFocus}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => {
                        // A lookup error belongs to the previous value.
                        field.setErrorMap({ onSubmit: undefined });
                        field.handleChange(event.target.value);
                      }}
                      aria-invalid={isInvalid}
                      aria-describedby={`${field.name}-hint`}
                      placeholder="Custom URL name, profile link or Steam ID64"
                      autoComplete="off"
                      autoCapitalize="off"
                      spellCheck={false}
                      enterKeyHint="search"
                      className="text-base"
                    />

                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        type="submit"
                        variant="default"
                        size="sm"
                        disabled={isSubmitting}
                        // The label is hidden on narrow screens.
                        aria-label={isSubmitting ? "Looking up" : "Find"}
                        className="h-9 rounded-lg px-3"
                      >
                        {isSubmitting ? <Loader2 className="animate-spin" /> : <ArrowRight />}
                        <span className="hidden sm:inline">{isSubmitting ? "Looking up" : "Find"}</span>
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>
                )}
              </form.Subscribe>

              {isInvalid
                ? <FieldError errors={errors} />
                : (
                    <FieldDescription id={`${field.name}-hint`}>
                      For example
                      {" "}
                      <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">gabelogannewell</code>
                      ,
                      {" "}
                      <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">steamcommunity.com/id/…</code>
                      {" "}
                      or
                      {" "}
                      <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">7656…</code>
                    </FieldDescription>
                  )}
            </Field>
          );
        }}
      </form.Field>
    </form>
  );
};

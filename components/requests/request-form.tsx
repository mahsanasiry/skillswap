"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, controlClass, describedBy } from "@/components/ui/form-fields";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/states";
import { useDemoUser } from "@/hooks/use-demo-user";
import { useCreateRequest } from "@/hooks/use-requests";
import { useSkills } from "@/hooks/use-skills";
import { ApiError } from "@/lib/api";
import { createRequestSchema } from "@/lib/schemas";
import type { CreateRequestInput, Skill, UserWithMatch } from "@/types";

const MESSAGE_LIMIT = 500;

type Props = { receiver: UserWithMatch; onClose: () => void };

/** Waits for the skill names, so the suggested message can use them. */
export function RequestForm(props: Props) {
  const skills = useSkills();
  if (skills.isError) {
    return <ErrorState message="We couldn't load the form." onRetry={() => void skills.refetch()} />;
  }
  if (!skills.data) return <Skeleton className="h-72 w-full" />;
  return <RequestFormFields {...props} skills={skills.data} />;
}

function RequestFormFields({ receiver, onClose, skills }: Props & { skills: Skill[] }) {
  const { user: me } = useDemoUser();
  const create = useCreateRequest();
  const container = useRef<HTMLElement>(null);

  const name = (id: string) => skills.find((s) => s.id === id)?.name ?? id;
  // Start with the best suggestion: a skill they teach that I want, and one I teach that they want.
  const learnDefault = receiver.match?.theyTeachMe[0] ?? receiver.teaches[0]?.skillId ?? "";
  const teachDefault = receiver.match?.iTeachThem[0] ?? me.teaches[0]?.skillId ?? "";

  const {
    register,
    handleSubmit,
    setError,
    setFocus,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateRequestInput>({
    resolver: zodResolver(createRequestSchema),
    defaultValues: {
      receiverId: receiver.id,
      learnSkillId: learnDefault,
      teachSkillId: teachDefault,
      message: `I'd love to exchange ${name(teachDefault)} knowledge for ${name(learnDefault)} guidance.`,
    },
  });

  // When the form opens, bring it into view and focus the first field.
  useEffect(() => {
    container.current?.scrollIntoView?.({ block: "nearest" });
    setFocus("learnSkillId");
  }, [setFocus]);

  const messageLength = useWatch({ control, name: "message" })?.length ?? 0;
  const serverError = errors.root?.serverError?.message;

  const onSubmit = handleSubmit(async (values) => {
    try {
      await create.mutateAsync(values);
    } catch (error) {
      if (error instanceof ApiError && error.fields) {
        // The server named the fields that are wrong: show each message under its field.
        let first = true;
        for (const [field, message] of Object.entries(error.fields)) {
          setError(field as keyof CreateRequestInput, { message }, { shouldFocus: first });
          first = false;
        }
        return;
      }
      setError("root.serverError", {
        type: "server",
        message: error instanceof ApiError ? error.message : "Something went wrong. Please try again.",
      });
    }
  });

  if (create.isSuccess) {
    return (
      <section ref={container} aria-labelledby="request-title" className="rounded-xl border border-line bg-surface p-6">
        <h2 id="request-title" className="text-xl font-semibold">
          Request sent
        </h2>
        <p role="status" className="mt-2 text-ink-soft">
          {receiver.name} will see your request and can accept or decline it. You can follow its
          status on the Requests page.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <ButtonLink href="/requests?tab=sent">View your requests</ButtonLink>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </section>
    );
  }

  if (me.teaches.length === 0) {
    return (
      <section ref={container} className="rounded-xl border border-line bg-surface p-6">
        <p>Add a skill you can teach to your profile before you send a request.</p>
      </section>
    );
  }

  const learnError = errors.learnSkillId?.message;
  const teachError = errors.teachSkillId?.message;
  const messageError = errors.message?.message;

  return (
    <section ref={container} aria-labelledby="request-title" className="rounded-xl border border-line bg-surface p-6">
      <h2 id="request-title" className="text-xl font-semibold">
        Request a skill swap with {receiver.name}
      </h2>

      <form onSubmit={onSubmit} noValidate className="mt-4 flex max-w-2xl flex-col gap-4">
        <input type="hidden" {...register("receiverId")} />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="swap-learn" label="You want to learn" error={learnError}>
            <select
              id="swap-learn"
              className={`${controlClass} h-11`}
              aria-invalid={Boolean(learnError)}
              aria-describedby={describedBy("swap-learn", { error: Boolean(learnError) })}
              {...register("learnSkillId")}
            >
              <option value="">Choose a skill</option>
              {receiver.teaches.map((t) => (
                <option key={t.skillId} value={t.skillId}>
                  {name(t.skillId)}
                </option>
              ))}
            </select>
          </Field>

          <Field id="swap-teach" label="You can teach" error={teachError}>
            <select
              id="swap-teach"
              className={`${controlClass} h-11`}
              aria-invalid={Boolean(teachError)}
              aria-describedby={describedBy("swap-teach", { error: Boolean(teachError) })}
              {...register("teachSkillId")}
            >
              <option value="">Choose a skill</option>
              {me.teaches.map((t) => (
                <option key={t.skillId} value={t.skillId}>
                  {name(t.skillId)}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field
          id="swap-message"
          label="Message"
          error={messageError}
          hint={`${messageLength}/${MESSAGE_LIMIT} characters`}
        >
          <textarea
            id="swap-message"
            rows={4}
            className={`${controlClass} py-2`}
            aria-invalid={Boolean(messageError)}
            aria-describedby={describedBy("swap-message", { hint: true, error: Boolean(messageError) })}
            {...register("message")}
          />
        </Field>

        {serverError && (
          <p role="alert" className="rounded-lg border border-red-600 p-3 text-sm font-medium text-red-700 dark:text-red-400">
            {serverError}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Send request"}
          </Button>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
        </div>
      </form>
    </section>
  );
}

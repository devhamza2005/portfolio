"use client";

import { AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { FieldError, Input, Label, Textarea } from "@/components/ui/input";
import { type ContactState, sendContactMessage } from "@/server/actions/contact.actions";

const INITIAL: ContactState = { status: "idle" };

export type ContactFormMessages = {
  name: string;
  namePlaceholder: string;
  email: string;
  emailPlaceholder: string;
  subject: string;
  subjectPlaceholder: string;
  message: string;
  messagePlaceholder: string;
  submit: string;
  submitting: string;
  successTitle: string;
  successBody: string;
  errorGeneric: string;
  honeypot: string;
};

/**
 * Formulaire de contact.
 *
 * ── Limite connue, assumée en phase A ────────────────────────────────────
 *
 * Les messages de confirmation et les erreurs de champ sont produits par la
 * Server Action `sendContactMessage`, qui reste EN FRANÇAIS — la consigne est
 * de ne pas toucher aux Server Actions. Le composant affiche donc ses propres
 * libellés traduits pour le succès et l'erreur générale ; seules les erreurs
 * de validation champ par champ restent francophones.
 */
export function ContactForm({ t }: { t: ContactFormMessages }) {
  const [state, formAction, isPending] = useActionState(sendContactMessage, INITIAL);

  if (state.status === "success") {
    return (
      <div
        role="status"
        className="border-success/30 bg-success/10 flex flex-col items-center gap-3 rounded-[var(--radius-lg)] border px-6 py-12 text-center"
      >
        <CheckCircle2 className="text-success size-8" />
        <p className="font-display text-base font-semibold">{t.successTitle}</p>
        <p className="text-muted max-w-sm text-sm">{t.successBody}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="grid gap-5" noValidate>
      {state.status === "error" ? (
        <div
          role="alert"
          className="border-danger/30 bg-danger/10 text-danger flex items-start gap-2.5 rounded-[var(--radius-md)] border px-4 py-3 text-sm"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{t.errorGeneric}</span>
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="contact-name">{t.name}</Label>
          <Input
            id="contact-name"
            name="name"
            autoComplete="name"
            placeholder={t.namePlaceholder}
            required
            aria-invalid={Boolean(state.fieldErrors?.["name"])}
            aria-describedby={state.fieldErrors?.["name"] ? "contact-name-error" : undefined}
          />
          <FieldError id="contact-name-error">{state.fieldErrors?.["name"]}</FieldError>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="contact-email">{t.email}</Label>
          <Input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder={t.emailPlaceholder}
            required
            aria-invalid={Boolean(state.fieldErrors?.["email"])}
            aria-describedby={state.fieldErrors?.["email"] ? "contact-email-error" : undefined}
          />
          <FieldError id="contact-email-error">{state.fieldErrors?.["email"]}</FieldError>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="contact-subject">{t.subject}</Label>
        <Input
          id="contact-subject"
          name="subject"
          placeholder={t.subjectPlaceholder}
          aria-invalid={Boolean(state.fieldErrors?.["subject"])}
          aria-describedby={state.fieldErrors?.["subject"] ? "contact-subject-error" : undefined}
        />
        <FieldError id="contact-subject-error">{state.fieldErrors?.["subject"]}</FieldError>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="contact-message">{t.message}</Label>
        <Textarea
          id="contact-message"
          name="message"
          rows={5}
          placeholder={t.messagePlaceholder}
          required
          aria-invalid={Boolean(state.fieldErrors?.["message"])}
          aria-describedby={state.fieldErrors?.["message"] ? "contact-message-error" : undefined}
        />
        <FieldError id="contact-message-error">{state.fieldErrors?.["message"]}</FieldError>
      </div>

      {/*
        Champ piège : invisible et hors du parcours de tabulation pour un
        humain, mais rempli par la plupart des robots à formulaire.
      */}
      <div aria-hidden className="absolute -start-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="contact-website">{t.honeypot}</label>
        <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <Button type="submit" size="lg" disabled={isPending} className="justify-self-start">
        {isPending ? (
          <>
            <Loader2 className="animate-spin" /> {t.submitting}
          </>
        ) : (
          <>
            <Send /> {t.submit}
          </>
        )}
      </Button>
    </form>
  );
}

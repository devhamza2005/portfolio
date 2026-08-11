"use client";

import { AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { FieldError, Input, Label, Textarea } from "@/components/ui/input";
import { type ContactState, sendContactMessage } from "@/server/actions/contact.actions";

const INITIAL: ContactState = { status: "idle" };

export function ContactForm() {
  const [state, formAction, isPending] = useActionState(sendContactMessage, INITIAL);

  if (state.status === "success") {
    return (
      <div
        role="status"
        className="border-success/30 bg-success/10 flex flex-col items-center gap-3 rounded-[var(--radius-lg)] border px-6 py-12 text-center"
      >
        <CheckCircle2 className="text-success size-8" />
        <p className="font-display text-base font-semibold">Message envoyé</p>
        <p className="text-muted max-w-sm text-sm">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="grid gap-5" noValidate>
      {state.status === "error" && state.message ? (
        <div
          role="alert"
          className="border-danger/30 bg-danger/10 text-danger flex items-start gap-2.5 rounded-[var(--radius-md)] border px-4 py-3 text-sm"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{state.message}</span>
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="contact-name">Nom</Label>
          <Input
            id="contact-name"
            name="name"
            autoComplete="name"
            placeholder="Votre nom"
            required
            aria-invalid={Boolean(state.fieldErrors?.["name"])}
            aria-describedby={state.fieldErrors?.["name"] ? "contact-name-error" : undefined}
          />
          <FieldError id="contact-name-error">{state.fieldErrors?.["name"]}</FieldError>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="contact-email">Email</Label>
          <Input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="vous@entreprise.com"
            required
            aria-invalid={Boolean(state.fieldErrors?.["email"])}
            aria-describedby={state.fieldErrors?.["email"] ? "contact-email-error" : undefined}
          />
          <FieldError id="contact-email-error">{state.fieldErrors?.["email"]}</FieldError>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="contact-subject">Sujet</Label>
        <Input
          id="contact-subject"
          name="subject"
          placeholder="Opportunité, mission freelance, question…"
          aria-invalid={Boolean(state.fieldErrors?.["subject"])}
        />
        <FieldError>{state.fieldErrors?.["subject"]}</FieldError>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="contact-message">Message</Label>
        <Textarea
          id="contact-message"
          name="message"
          rows={5}
          placeholder="Décrivez votre projet ou votre besoin…"
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
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="contact-website">Ne pas remplir</label>
        <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <Button type="submit" size="lg" disabled={isPending} className="justify-self-start">
        {isPending ? (
          <>
            <Loader2 className="animate-spin" /> Envoi…
          </>
        ) : (
          <>
            <Send /> Envoyer le message
          </>
        )}
      </Button>
    </form>
  );
}

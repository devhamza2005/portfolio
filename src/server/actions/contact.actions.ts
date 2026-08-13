"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";

import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { hit } from "@/lib/rate-limit";
import { makeContactSchema } from "@/schemas/contact.schema";
import { db } from "@/server/db";

export type ContactState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
};

/**
 * Réception d'un message du formulaire de contact.
 *
 * Trois protections, sans imposer de captcha au visiteur :
 *  1. champ piège (honeypot) invisible — écarte les robots basiques ;
 *  2. limitation à 3 envois par heure et par origine ;
 *  3. validation Zod stricte avant tout accès à la base.
 *
 * Le message est systématiquement enregistré et consultable dans
 * /admin/messages, même si aucun service d'email n'est configuré : la boîte de
 * réception du back-office est la garantie qu'aucune prise de contact ne se
 * perd, indépendamment de l'envoi d'email.
 *
 * ── Langue des messages (phase B) ─────────────────────────────────────────
 *
 * Les retours de cette action sont AFFICHÉS au visiteur : ils doivent suivre
 * la langue de la page. La locale arrive par un champ caché du formulaire, et
 * non par `headers()` : une Server Action n'est jamais mise en cache, mais
 * `next/root-params` n'y est pas disponible et lire un en-tête introduirait
 * une dépendance à la requête dont on n'a pas besoin. Une valeur absente ou
 * inconnue retombe sur le français.
 *
 * La logique métier — validation, honeypot, limitation de débit, écriture en
 * base — est strictement INCHANGÉE.
 */
export async function sendContactMessage(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const raw = String(formData.get("locale") ?? "");
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const dictionary = await getDictionary(locale);
  const t = dictionary.contactForm.errors;

  const parsed = makeContactSchema({
    nameRequired: t.nameRequired,
    nameTooLong: t.nameTooLong,
    emailRequired: t.emailRequired,
    emailInvalid: t.emailInvalid,
    subjectTooLong: t.subjectTooLong,
    messageTooShort: t.messageTooShort,
    messageTooLong: t.messageTooLong,
    rejected: t.rejected,
  }).safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
    website: formData.get("website") ?? "",
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "");
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }

    // Le piège rempli n'est jamais signalé comme tel : inutile d'expliquer
    // à un robot pourquoi il a échoué.
    if (fieldErrors["website"]) {
      return { status: "success", message: t.sent };
    }

    return { status: "error", message: t.checkFields, fieldErrors };
  }

  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || headerList.get("x-real-ip") || "unknown";
  const ipHash = createHash("sha256").update(ip).digest("hex").slice(0, 32);

  const limit = hit(`contact:${ipHash}`, 3, 3600);
  if (!limit.success) {
    return { status: "error", message: t.rateLimited };
  }

  try {
    await db.contactMessage.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        subject: parsed.data.subject || null,
        message: parsed.data.message,
        ipHash,
        userAgent: headerList.get("user-agent")?.slice(0, 300) ?? null,
      },
    });

    return { status: "success", message: t.sent };
  } catch (error) {
    console.error("[contact.actions]", error);
    return { status: "error", message: t.sendFailed };
  }
}

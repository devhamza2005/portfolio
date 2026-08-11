"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";

import { hit } from "@/lib/rate-limit";
import { contactSchema } from "@/schemas/contact.schema";
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
 * /admin/messages, même si aucun service d'email n'est configuré : aucune
 * prise de contact ne peut être perdue.
 */
export async function sendContactMessage(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const parsed = contactSchema.safeParse({
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
      return { status: "success", message: "Merci, votre message a bien été envoyé." };
    }

    return { status: "error", message: "Vérifiez les champs signalés.", fieldErrors };
  }

  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || headerList.get("x-real-ip") || "unknown";
  const ipHash = createHash("sha256").update(ip).digest("hex").slice(0, 32);

  const limit = hit(`contact:${ipHash}`, 3, 3600);
  if (!limit.success) {
    return {
      status: "error",
      message: "Vous avez déjà envoyé plusieurs messages. Réessayez dans une heure.",
    };
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

    return {
      status: "success",
      message: "Message envoyé. Je vous réponds dans les meilleurs délais.",
    };
  } catch (error) {
    console.error("[contact.actions]", error);
    return {
      status: "error",
      message: "L'envoi a échoué. Réessayez, ou écrivez-moi directement par email.",
    };
  }
}

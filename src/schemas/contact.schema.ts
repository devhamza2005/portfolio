import { z } from "zod";

/**
 * Formulaire de contact public.
 *
 * ── Pourquoi une fabrique plutôt qu'un schéma figé ────────────────────────
 *
 * Les messages de validation sont AFFICHÉS au visiteur : ils doivent donc
 * suivre la langue de la page. Le schéma reçoit ses libellés au lieu de les
 * coder en dur, ce qui permet à la Server Action de le construire dans la
 * locale de la requête. La logique de validation, elle, est strictement
 * identique dans les trois langues.
 */

export type ContactMessages = {
  nameRequired: string;
  nameTooLong: string;
  emailRequired: string;
  emailInvalid: string;
  subjectTooLong: string;
  messageTooShort: string;
  messageTooLong: string;
  rejected: string;
};

/** Libellés français — repli, et valeur utilisée par le back-office. */
export const CONTACT_MESSAGES_FR: ContactMessages = {
  nameRequired: "Votre nom est requis",
  nameTooLong: "120 caractères maximum",
  emailRequired: "Votre email est requis",
  emailInvalid: "Adresse email invalide",
  subjectTooLong: "200 caractères maximum",
  messageTooShort: "Votre message doit faire au moins 20 caractères",
  messageTooLong: "4000 caractères maximum",
  rejected: "Requête rejetée",
};

export function makeContactSchema(m: ContactMessages = CONTACT_MESSAGES_FR) {
  return z.object({
    name: z.string().trim().min(2, m.nameRequired).max(120, m.nameTooLong),
    email: z
      .string()
      .trim()
      .min(1, m.emailRequired)
      .email(m.emailInvalid)
      .max(200)
      .transform((value) => value.toLowerCase()),
    subject: z.string().trim().max(200, m.subjectTooLong).optional(),
    message: z.string().trim().min(20, m.messageTooShort).max(4000, m.messageTooLong),
    /**
     * Champ piège, invisible pour un humain.
     * Les robots remplissent tous les champs d'un formulaire : s'il est rempli,
     * la soumission est rejetée silencieusement.
     */
    website: z.string().max(0, m.rejected).optional(),
  });
}

/** Schéma français — conservé pour les appels qui n'ont pas de locale. */
export const contactSchema = makeContactSchema();

export type ContactInput = z.infer<typeof contactSchema>;

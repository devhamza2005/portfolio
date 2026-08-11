import { z } from "zod";

/** Formulaire de contact public. */
export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Votre nom est requis")
    .max(120, "120 caractères maximum"),
  email: z
    .string()
    .trim()
    .min(1, "Votre email est requis")
    .email("Adresse email invalide")
    .max(200)
    .transform((value) => value.toLowerCase()),
  subject: z.string().trim().max(200, "200 caractères maximum").optional(),
  message: z
    .string()
    .trim()
    .min(20, "Votre message doit faire au moins 20 caractères")
    .max(4000, "4000 caractères maximum"),
  /**
   * Champ piège, invisible pour un humain.
   * Les robots remplissent tous les champs d'un formulaire : s'il est rempli,
   * la soumission est rejetée silencieusement.
   */
  website: z.string().max(0, "Requête rejetée").optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;

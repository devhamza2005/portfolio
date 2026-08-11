import { z } from "zod";

import {
  optionalId,
  optionalNumber,
  optionalString,
  optionalText,
  optionalUrl,
  requiredString,
} from "./common";

/**
 * Validation du profil.
 *
 * Le profil est la seule ressource dont chaque champ se retrouve à l'écran
 * quelque part sur le site public — nom du Hero, titre de l'onglet, bio,
 * carte de contact, aperçu de partage. Les contraintes sont donc dictées par
 * l'affichage, pas par la base : `headline` tient sur une ligne sous le nom,
 * `seoDescription` doit rester sous la limite d'affichage de Google.
 *
 * Aucune valeur par défaut inventée : ce que l'administrateur laisse vide
 * devient `null`, et le composant concerné se masque de lui-même.
 */
export const profileSchema = z.object({
  fullName: requiredString("Le nom complet", 120),
  headline: requiredString("Le titre professionnel", 160),
  subline: optionalString(160),
  tagline: optionalString(240),

  bioShort: optionalText(1200),
  bioLong: optionalText(8000),

  email: z
    .string({ error: "L'email est requis" })
    .trim()
    .min(1, "L'email est requis")
    .email("Adresse email invalide"),
  phone: optionalString(40),
  location: optionalString(120),

  avatarId: optionalId(),

  cvUrl: optionalUrl(),
  cvLabel: optionalString(80),

  availability: z.enum(["OPEN_TO_WORK", "FREELANCE", "BUSY", "HIDDEN"]),
  availabilityLabel: optionalString(120),
  // Sert à calculer les « années d'expérience » affichées dans les statistiques :
  // une année future donnerait un nombre négatif.
  careerStartYear: optionalNumber(1970, 2100),

  seoTitle: optionalString(70),
  seoDescription: optionalText(320),
  ogImageId: optionalId(),
});

export type ProfileInput = z.infer<typeof profileSchema>;

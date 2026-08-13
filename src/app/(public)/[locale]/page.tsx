import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { About } from "@/components/sections/about";
import { Achievements } from "@/components/sections/achievements";
import { Certifications } from "@/components/sections/certifications";
import { Contact } from "@/components/sections/contact";
import { EducationSection } from "@/components/sections/education";
import { ExperienceSection } from "@/components/sections/experience";
import { Hero } from "@/components/sections/hero";
import { Projects } from "@/components/sections/projects";
import { Services } from "@/components/sections/services";
import { SkillsSection } from "@/components/sections/skills-section";
import { Stats } from "@/components/sections/stats";
import { Technologies } from "@/components/sections/technologies";
import { siteConfig } from "@/config/site";
import { getDictionary, requireLocale } from "@/lib/i18n/dictionaries";
import { alternatesFor, openGraph, resolveSeoIdentity, robotsFor, truncate, twitterCard } from "@/lib/seo";
import { personJsonLd, webSiteJsonLd } from "@/lib/structured-data";
import {
  getAchievements,
  getCertifications,
  getEducation,
  getExperiences,
  getLanguages,
  getProfile,
  getProjects,
  getQualities,
  getServices,
  getSkillGroups,
  getSocialLinks,
  getStats,
  getTechnologies,
} from "@/server/queries/portfolio";

/**
 * Page d'accueil — composition des sections.
 *
 * Ce fichier ne contient AUCUN contenu : il n'orchestre que la lecture des
 * données et l'ordre des sections. Chaque section se masque d'elle-même
 * lorsqu'elle n'a rien à afficher, si bien qu'un portfolio partiellement
 * rempli reste cohérent (§21).
 *
 * Toutes les lectures sont mises en cache et balisées : un enregistrement
 * dans /admin invalide la balise concernée et la page se régénère (§12).
 */

/**
 * Métadonnées de la page d'accueil, tirées de la base.
 *
 * `Profile.seoTitle` et `seoDescription` permettent de piloter ce que voit un
 * recruteur dans Google sans changer une ligne de ce qui s'affiche à l'écran —
 * et sans toucher au code (§12). Le titre est déclaré en `absolute` : la page
 * d'accueil porte déjà le nom, le gabarit « %s — Hamza Fanoune » le répéterait.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = requireLocale((await params).locale);
  const profile = await getProfile();
  const { name, title, description, ogImage } = resolveSeoIdentity(profile);
  const shortDescription = truncate(description);

  return {
    title: { absolute: title },
    description: shortDescription,
    alternates: alternatesFor(locale, "/"),
    robots: robotsFor(locale),
    openGraph: openGraph({
      title,
      description: shortDescription,
      path: "/",
      siteName: `${name} — Portfolio`,
      type: "website",
      image: ogImage,
      locale,
    }),
    twitter: twitterCard({ title, description: shortDescription, image: ogImage }),
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = requireLocale((await params).locale);
  const t = await getDictionary(locale);

  const [
    profile,
    socialLinks,
    stats,
    qualities,
    languages,
    services,
    skillGroups,
    technologies,
    experiences,
    education,
    projects,
    certifications,
    achievements,
  ] = await Promise.all([
    getProfile(),
    getSocialLinks(),
    getStats(),
    getQualities(),
    getLanguages(),
    getServices(),
    getSkillGroups(),
    getTechnologies(),
    getExperiences(),
    getEducation(),
    getProjects(),
    getCertifications(),
    getAchievements(),
  ]);

  const name = profile?.fullName ?? siteConfig.fallback.name;
  const email = profile?.email ?? "";
  const isAvailable =
    profile?.availability === "OPEN_TO_WORK" || profile?.availability === "FREELANCE";

  const heroLinks = socialLinks.filter((link) => link.inHero);

  /**
   * Graphe de données structurées.
   *
   * Tout provient de la base : le nom, le métier, la bio, les liens sociaux
   * visibles et les technologies réellement affichées. Rien n'est ajouté pour
   * « faire riche » — une propriété que la page ne montre pas ne doit pas
   * figurer ici.
   */
  const seo = resolveSeoIdentity(profile);
  const jsonLd = [
    personJsonLd({
      fullName: name,
      headline: profile?.headline ?? siteConfig.fallback.description,
      bioShort: profile?.bioShort ?? null,
      email,
      location: profile?.location ?? null,
      avatar: profile?.avatar ?? null,
      socialUrls: socialLinks.map((link) => link.url),
      knowsAbout: technologies.map((technology) => technology.name),
      locale,
    }),
    webSiteJsonLd(name, truncate(seo.description), locale),
  ];

  return (
    <>
      <JsonLd data={jsonLd} />

      <Hero
        name={name}
        headline={profile?.headline ?? siteConfig.fallback.description}
        subline={profile?.subline ?? null}
        tagline={profile?.tagline ?? null}
        location={profile?.location ?? null}
        availabilityLabel={profile?.availabilityLabel ?? null}
        isAvailable={isAvailable}
        cvUrl={profile?.cvUrl ?? null}
        cvLabel={profile?.cvLabel ?? null}
        socialLinks={heroLinks}
        t={t.hero}
        downloadCvLabel={t.nav.downloadCv}
      />

      <Stats stats={stats} />

      <About
        bioShort={profile?.bioShort ?? null}
        bioLong={profile?.bioLong ?? null}
        location={profile?.location ?? null}
        avatar={profile?.avatar ?? null}
        qualities={qualities}
        languages={languages}
        t={t.about}
      />

      <Services services={services} t={t.services} />

      <SkillsSection groups={skillGroups} t={t.skills} proficiency={t.enums.proficiency} />

      <Technologies technologies={technologies} t={t.technologies} />

      <ExperienceSection
        experiences={experiences}
        locale={locale}
        t={t.experience}
        employmentType={t.enums.employmentType}
        workMode={t.enums.workMode}
        todayLabel={t.dates.today}
      />

      <EducationSection
        education={education}
        locale={locale}
        t={t.education}
        status={t.enums.educationStatus}
      />

      <Projects projects={projects} locale={locale} t={t.projects} status={t.enums.projectStatus} />

      <Certifications certifications={certifications} locale={locale} t={t.certifications} />

      <Achievements achievements={achievements} locale={locale} t={t.achievements} />

      <Contact
        email={email}
        location={profile?.location ?? null}
        availabilityLabel={profile?.availabilityLabel ?? null}
        isAvailable={isAvailable}
        cvUrl={profile?.cvUrl ?? null}
        socialLinks={socialLinks}
        t={t.contact}
        form={t.contactForm}
        downloadCvLabel={t.nav.downloadCv}
      />
    </>
  );
}

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
export default async function HomePage() {
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

  return (
    <>
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
      />

      <Stats stats={stats} />

      <About
        bioShort={profile?.bioShort ?? null}
        bioLong={profile?.bioLong ?? null}
        location={profile?.location ?? null}
        avatar={profile?.avatar ?? null}
        qualities={qualities}
        languages={languages}
      />

      <Services services={services} />

      <SkillsSection groups={skillGroups} />

      <Technologies technologies={technologies} />

      <ExperienceSection experiences={experiences} />

      <EducationSection education={education} />

      <Projects projects={projects} />

      <Certifications certifications={certifications} />

      <Achievements achievements={achievements} />

      <Contact
        email={email}
        location={profile?.location ?? null}
        availabilityLabel={profile?.availabilityLabel ?? null}
        isAvailable={isAvailable}
        cvUrl={profile?.cvUrl ?? null}
        socialLinks={socialLinks}
      />
    </>
  );
}

import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { ScrollProgress } from "@/components/layout/scroll-progress";
import { siteConfig } from "@/config/site";
import { getCurrentYear } from "@/server/queries/now";
import { getProfile, getSocialLinks } from "@/server/queries/portfolio";

/**
 * Ossature du site public.
 *
 * La navbar et le footer lisent le profil depuis la base : changer son nom ou
 * ajouter un lien social depuis /admin les met à jour partout, sans toucher
 * au code (§12).
 */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [profile, socialLinks, year] = await Promise.all([
    getProfile(),
    getSocialLinks(),
    getCurrentYear(),
  ]);

  // Repli si la base n'est pas encore amorcée : le site reste affichable.
  const name = profile?.fullName ?? siteConfig.fallback.name;
  const headline = profile?.headline ?? siteConfig.fallback.description;
  const email = profile?.email ?? "";

  return (
    <>
      <ScrollProgress />
      <Navbar name={name} cvUrl={profile?.cvUrl ?? null} />

      <main id="main" className="flex-1">
        {children}
      </main>

      <Footer
        name={name}
        headline={headline}
        location={profile?.location ?? null}
        email={email}
        socialLinks={socialLinks}
        year={year}
      />
    </>
  );
}

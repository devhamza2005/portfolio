import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { Icon } from "@/components/admin/icon";
import { BrandMark } from "@/components/brand/monogram";
import { SECTION_NAV } from "@/config/nav";

type Props = {
  name: string;
  headline: string;
  location: string | null;
  email: string;
  socialLinks: { id: string; label: string; url: string; iconKey: string | null }[];
  /** Année du copyright — fournie par le layout, calculée dans un cache. */
  year: number;
};

/**
 * Pied de page — entièrement alimenté par la base : nom, titre, localisation,
 * email et liens sociaux viennent du profil et de la table SocialLink.
 */
export function Footer({ name, headline, location, email, socialLinks, year }: Props) {
  return (
    <footer className="border-border relative border-t">
      <div className="container-content py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <BrandMark name={name} />
            <p className="text-muted mt-4 max-w-xs text-sm leading-relaxed">{headline}</p>
            {location ? (
              <p className="text-subtle mt-3 flex items-center gap-1.5 text-sm">
                <Icon name="MapPin" className="size-3.5" />
                {location}
              </p>
            ) : null}
          </div>

          <nav aria-label="Navigation du pied de page">
            <h2 className="text-subtle mb-4 font-mono text-[0.6875rem] tracking-[0.18em] uppercase">
              Navigation
            </h2>
            <ul className="space-y-2.5">
              {SECTION_NAV.map((item) => (
                <li key={item.id}>
                  <a
                    href={item.href}
                    className="text-muted hover:text-foreground text-sm transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-subtle mb-4 font-mono text-[0.6875rem] tracking-[0.18em] uppercase">
              Me contacter
            </h2>
            <a
              href={`mailto:${email}`}
              className="text-foreground hover:text-brand mb-4 block text-sm font-medium break-all transition-colors"
            >
              {email}
            </a>

            {socialLinks.length > 0 ? (
              <ul className="flex flex-wrap gap-2">
                {socialLinks.map((link) => (
                  <li key={link.id}>
                    <a
                      href={link.url}
                      target={link.url.startsWith("http") ? "_blank" : undefined}
                      rel={link.url.startsWith("http") ? "noreferrer noopener" : undefined}
                      aria-label={link.label}
                      className="border-border text-muted hover:text-brand hover:border-brand/40 grid size-9 place-items-center rounded-full border transition-colors"
                    >
                      <Icon name={link.iconKey ?? "Link2"} className="size-4" />
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>

        <div className="border-border mt-12 flex flex-col items-center justify-between gap-4 border-t pt-6 sm:flex-row">
          <p className="text-subtle text-xs">
            © {year} {name}. Tous droits réservés.
          </p>

          <div className="text-subtle flex items-center gap-4 text-xs">
            <span className="font-mono">Next.js · Spring Boot state of mind</span>
            <Link
              href="/admin"
              className="hover:text-muted flex items-center gap-1 transition-colors"
            >
              Administration
              <ArrowUpRight className="size-3" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

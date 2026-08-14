import { Link } from "@tanstack/react-router";
import { Stamp } from "@/components/stamp";

const NAV: { label: string; hash?: string }[] = [
  { label: "الرئيسية" },
  { label: "المنتجات", hash: "products" },
  { label: "عن فريد", hash: "story" },
  { label: "التواصل", hash: "socials" },
  { label: "الجملة", hash: "wholesale" },
  { label: "المحمصة", hash: "contact" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink/25 bg-background/95 backdrop-blur-[2px]">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
        <Link to="/" className="flex items-center gap-2">
          <Stamp className="h-9 w-9 text-brass animate-float" />
          <span className="font-display text-2xl leading-none">بن فريد</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          {NAV.map((n) => (
            <Link
              key={n.label}
              to="/"
              {...(n.hash ? { hash: n.hash } : {})}
              onClick={(e) => {
                if (n.hash) {
                  const el = document.getElementById(n.hash);
                  if (el) {
                    e.preventDefault();
                    el.scrollIntoView({ behavior: "smooth" });
                    window.history.pushState(null, "", `#${n.hash}`);
                  }
                } else {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  window.history.pushState(null, "", "/");
                }
              }}
              className="transition-colors hover:text-brass font-medium"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="https://www.facebook.com/fareedcoffee"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 border border-ink bg-ink px-3.5 py-1.5 text-xs text-cream transition-all duration-300 hover:bg-brass hover:text-ink active:scale-95"
          >
            فيسبوك
          </a>
          <a
            href="https://www.instagram.com/fareedcoffee"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 border border-ink bg-kraft px-3.5 py-1.5 text-xs text-ink transition-all duration-300 hover:bg-ink hover:text-cream active:scale-95"
          >
            إنستجرام
          </a>
        </div>
      </div>
    </header>
  );
}

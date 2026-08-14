import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (hash?: string) => {
    setMobileMenuOpen(false);
    if (hash) {
      const el = document.getElementById(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        window.history.pushState(null, "", `#${hash}`);
      }
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
      window.history.pushState(null, "", "/");
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-ink/25 bg-background/95 backdrop-blur-[2px]">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
          <Link to="/" className="flex items-center gap-2.5">
            <img
              src="/fareed-logo.jpg"
              alt="شعار بن فريد"
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-full object-cover border border-ink/40 shadow-sm shrink-0"
            />
            <span className="font-display text-2xl leading-none">بن فريد</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            {NAV.map((n) => (
              <Link
                key={n.label}
                to="/"
                {...(n.hash ? { hash: n.hash } : {})}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(n.hash);
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
              className="inline-flex items-center gap-1 border border-ink bg-ink px-3 py-1.5 text-xs text-cream transition-all duration-300 hover:bg-brass hover:text-ink active:scale-95 sm:px-3.5"
            >
              فيسبوك
            </a>
            <a
              href="https://www.instagram.com/fareedcoffee"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 border border-ink bg-kraft px-3 py-1.5 text-xs text-ink transition-all duration-300 hover:bg-ink hover:text-cream active:scale-95 sm:px-3.5"
            >
              إنستجرام
            </a>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="القائمة"
              className="inline-flex items-center justify-center border border-ink p-1.5 text-ink transition-colors hover:bg-kraft md:hidden"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="border-b border-ink/25 bg-cream/98 px-5 py-4 transition-all duration-300 md:hidden animate-fade-in-up">
            <nav className="flex flex-col gap-3">
              {NAV.map((n) => (
                <button
                  key={n.label}
                  onClick={() => handleNavClick(n.hash)}
                  className="flex items-center justify-between border-b border-ink/10 pb-2.5 text-start font-display text-lg text-foreground hover:text-brass"
                >
                  <span>{n.label}</span>
                  <span className="text-xs text-brass">←</span>
                </button>
              ))}
            </nav>

            <div className="mt-4 pt-3 border-t border-ink/15 flex gap-2">
              <a
                href="https://www.facebook.com/fareedcoffee"
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2 text-center text-xs font-medium border border-ink bg-ink text-cream hover:bg-brass hover:text-ink"
              >
                فيسبوك الرسمية
              </a>
              <a
                href="https://www.instagram.com/fareedcoffee"
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2 text-center text-xs font-medium border border-ink bg-kraft text-ink hover:bg-ink hover:text-cream"
              >
                إنستجرام الرسمية
              </a>
            </div>
          </div>
        )}
      </header>
    </>
  );
}

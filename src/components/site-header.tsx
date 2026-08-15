import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, Minus, Plus, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/lib/cart";

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
  const [cartOpen, setCartOpen] = useState(false);
  const { count } = useCart();

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
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-5">
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
            <button
              onClick={() => setCartOpen(true)}
              className="inline-flex items-center gap-2 border border-ink bg-ink px-3 py-1.5 text-xs text-cream transition-all duration-300 hover:bg-brass hover:text-ink active:scale-95 sm:px-3.5 sm:text-sm font-medium"
              aria-label="سلة الطلبات"
            >
              <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">سلة الطلبات</span>
              <span className="inline sm:hidden">السلة</span>
              {count > 0 && (
                <span
                  className="min-w-5 rounded bg-brass px-1.5 py-0.5 text-xs font-bold text-ink"
                  dir="ltr"
                >
                  {count}
                </span>
              )}
            </button>

            <a
              href="https://www.facebook.com/fareedcoffee"
              target="_blank"
              rel="noreferrer"
              className="hidden lg:inline-flex items-center gap-1 border border-ink bg-cream px-3 py-1.5 text-xs text-ink transition-all duration-300 hover:bg-ink hover:text-cream active:scale-95"
            >
              فيسبوك
            </a>
            <a
              href="https://www.instagram.com/fareedcoffee"
              target="_blank"
              rel="noreferrer"
              className="hidden lg:inline-flex items-center gap-1 border border-ink bg-kraft px-3 py-1.5 text-xs text-ink transition-all duration-300 hover:bg-ink hover:text-cream active:scale-95"
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

            <div className="mt-4 pt-3 border-t border-ink/15 flex flex-col gap-2">
              <div className="flex gap-2">
                <a
                  href="https://www.facebook.com/fareedcoffee"
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2 text-center text-xs font-medium border border-ink bg-ink text-cream hover:bg-brass hover:text-ink"
                >
                  فيسبوك
                </a>
                <a
                  href="https://www.instagram.com/fareedcoffee"
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2 text-center text-xs font-medium border border-ink bg-kraft text-ink hover:bg-ink hover:text-cream"
                >
                  إنستجرام
                </a>
              </div>

              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-center text-xs font-bold border border-brass/60 bg-brass/10 text-ink hover:bg-brass hover:text-ink transition-colors"
              >
                ⚙️ لوحة تحكم الإدارة (Admin)
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Cart Drawer Panel */}
      {cartOpen && <CartPanel onClose={() => setCartOpen(false)} />}
    </>
  );
}

function CartPanel({ onClose }: { onClose: () => void }) {
  const { items, total, setQty, remove } = useCart();

  return (
    <div className="fixed inset-0 z-50 flex">
      <button
        aria-label="إغلاق"
        onClick={onClose}
        className="flex-1 bg-ink/60 transition-opacity"
      />
      <aside className="flex h-full w-full max-w-md flex-col border-s border-ink bg-cream shadow-2xl animate-fade-in-up">
        <div className="flex items-center justify-between border-b border-ink/25 px-5 py-4 bg-background">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-brass" />
            <h2 className="font-display text-2xl">طلبك</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="إغلاق"
            className="p-1 hover:bg-kraft transition-colors rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center pt-16 text-center text-muted-foreground">
              <ShoppingBag className="h-12 w-12 text-ink/30 mb-3" />
              <p className="text-base font-medium text-foreground">السلة فاضية</p>
              <p className="text-xs mt-1">اختار تحميصك المفضل من قائمة المنتجات.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((i) => (
                <li key={i.id} className="border border-ink/30 bg-background p-3.5 shadow-sm">
                  <div className="flex items-baseline justify-between">
                    <span className="font-display text-xl">{i.name}</span>
                    <span className="text-xs bg-kraft px-2 py-0.5 border border-ink/20 font-medium">
                      {i.weight}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center border border-ink/40 bg-cream">
                      <button
                        className="px-2 py-1 hover:bg-ink hover:text-cream transition-colors"
                        aria-label="نقصان"
                        onClick={() => setQty(i.id, i.qty - 1)}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold" dir="ltr">
                        {i.qty}
                      </span>
                      <button
                        className="px-2 py-1 hover:bg-ink hover:text-cream transition-colors"
                        aria-label="زيادة"
                        onClick={() => setQty(i.id, i.qty + 1)}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold">
                        <span dir="ltr">{i.price * i.qty}</span> ج.م
                      </span>
                      <button
                        onClick={() => remove(i.id)}
                        className="text-xs text-red-600 hover:underline"
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-ink/25 px-5 py-4 bg-background">
          <div className="flex items-center justify-between pb-3 font-display text-xl">
            <span>الإجمالي</span>
            <span>
              <span dir="ltr">{total}</span> ج.م
            </span>
          </div>
          <Link
            to="/checkout"
            onClick={onClose}
            className="block w-full border border-ink bg-ink px-4 py-3.5 text-center text-sm font-medium text-cream transition-all hover:bg-brass hover:text-ink active:scale-95 disabled:pointer-events-none disabled:opacity-40"
            disabled={items.length === 0}
          >
            إتمام الطلب
          </Link>
        </div>
      </aside>
    </div>
  );
}

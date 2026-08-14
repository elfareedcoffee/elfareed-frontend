import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/lib/cart";
import { Stamp } from "@/components/stamp";

const NAV: { label: string; hash?: string }[] = [
  { label: "الرئيسية" },
  { label: "المنتجات", hash: "products" },
  { label: "عن الفريد", hash: "story" },
  { label: "الجملة", hash: "wholesale" },
  { label: "تواصل", hash: "contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { count } = useCart();

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-ink/25 bg-background/95 backdrop-blur-[2px]">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-5">
          <Link to="/" className="flex items-center gap-2">
            <Stamp className="h-9 w-9 text-brass" />
            <span className="font-display text-2xl leading-none">بن الفريد</span>
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
                className="transition-colors hover:text-brass"
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <button
            onClick={() => setOpen(true)}
            className="ms-auto inline-flex items-center gap-2 border border-ink bg-ink px-4 py-2 text-sm text-cream transition-colors hover:bg-brass hover:text-ink"
          >
            <ShoppingBag className="h-4 w-4" />
            اطلب أونلاين
            {count > 0 && (
              <span className="min-w-5 border border-cream/50 px-1 text-xs" dir="ltr">
                {count}
              </span>
            )}
          </button>
        </div>
      </header>

      {open && <CartPanel onClose={() => setOpen(false)} />}
    </>
  );
}

function CartPanel({ onClose }: { onClose: () => void }) {
  const { items, total, setQty, remove } = useCart();

  return (
    <div className="fixed inset-0 z-50 flex">
      <button aria-label="إغلاق" onClick={onClose} className="flex-1 bg-ink/60" />
      <aside className="flex h-full w-full max-w-md flex-col border-s border-ink bg-cream">
        <div className="flex items-center justify-between border-b border-ink/25 px-5 py-4">
          <h2 className="font-display text-2xl">طلبك</h2>
          <button onClick={onClose} aria-label="إغلاق">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <p className="pt-10 text-center text-sm text-muted-foreground">
              السلة فاضية. اختار تحميصك من المنتجات.
            </p>
          ) : (
            <ul className="space-y-4">
              {items.map((i) => (
                <li key={i.id} className="border border-ink/30 p-3">
                  <div className="flex items-baseline justify-between">
                    <span className="font-display text-xl">{i.name}</span>
                    <span className="text-sm text-muted-foreground">{i.weight}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center border border-ink/40">
                      <button
                        className="px-2 py-1"
                        aria-label="زيادة"
                        onClick={() => setQty(i.id, i.qty + 1)}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm" dir="ltr">
                        {i.qty}
                      </span>
                      <button
                        className="px-2 py-1"
                        aria-label="نقصان"
                        onClick={() => setQty(i.id, i.qty - 1)}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm">
                        <span dir="ltr">{i.price * i.qty}</span> ج.م
                      </span>
                      <button
                        onClick={() => remove(i.id)}
                        className="text-xs text-muted-foreground underline"
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

        <div className="border-t border-ink/25 px-5 py-4">
          <div className="flex items-center justify-between pb-3 font-display text-xl">
            <span>الإجمالي</span>
            <span>
              <span dir="ltr">{total}</span> ج.م
            </span>
          </div>
          <Link
            to="/checkout"
            onClick={onClose}
            className="block border border-ink bg-ink px-4 py-3 text-center text-sm text-cream hover:bg-brass hover:text-ink aria-disabled:opacity-40"
            aria-disabled={items.length === 0}
          >
            إتمام الطلب
          </Link>
        </div>
      </aside>
    </div>
  );
}

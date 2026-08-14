import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useCart } from "@/lib/cart";
import { SiteHeader } from "@/components/site-header";
import { CONTACT } from "@/data/products";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "إتمام الطلب — بن الفريد" },
      {
        name: "description",
        content: "أكمل طلب البن: بيانات التوصيل والدفع عند الاستلام داخل القاهرة.",
      },
      { property: "og:title", content: "إتمام الطلب — بن الفريد" },
      {
        property: "og:description",
        content: "أكمل طلب البن من محمصة بن الفريد بالمرج القديمة.",
      },
    ],
  }),
  component: Checkout,
});

function Checkout() {
  const { items, total, clear, setQty } = useCart();
  const [done, setDone] = useState(false);
  const shipping = items.length ? 40 : 0;

  if (done) {
    return (
      <div className="paper min-h-screen">
        <SiteHeader />
        <main className="mx-auto max-w-xl px-5 py-24 text-center">
          <h1 className="font-display text-5xl">تم استلام طلبك</h1>
          <p className="mt-4 leading-8 text-muted-foreground">
            هنكلمك خلال ساعة على رقمك لتأكيد الطلب والتوصيل. أو كلّمنا على{" "}
            <span dir="ltr">{CONTACT.sales}</span>.
          </p>
          <Link
            to="/"
            className="mt-8 inline-block border border-ink bg-ink px-6 py-3 text-sm text-cream hover:bg-brass hover:text-ink"
          >
            الرجوع للرئيسية
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="paper min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-5 py-14">
        <h1 className="font-display text-5xl md:text-6xl">إتمام الطلب</h1>
        <div className="mt-10 grid gap-10 md:grid-cols-[1.2fr_1fr]">
          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              if (!items.length) {
                toast.error("السلة فاضية");
                return;
              }
              clear();
              setDone(true);
            }}
          >
            {[
              { name: "name", label: "الاسم بالكامل", type: "text" },
              { name: "phone", label: "رقم الموبايل", type: "tel" },
              { name: "address", label: "العنوان بالتفصيل", type: "text" },
              { name: "area", label: "المنطقة / المحافظة", type: "text" },
            ].map((f) => (
              <div key={f.name}>
                <label className="mb-1.5 block text-sm" htmlFor={f.name}>
                  {f.label}
                </label>
                <input
                  id={f.name}
                  name={f.name}
                  type={f.type}
                  required
                  dir={f.name === "phone" ? "ltr" : "rtl"}
                  className="w-full border border-ink/40 bg-cream px-3 py-2.5 text-sm outline-none focus:border-brass"
                />
              </div>
            ))}
            <div>
              <label className="mb-1.5 block text-sm" htmlFor="notes">
                ملاحظات (طحن للكنكة / فلتر / حبوب كاملة)
              </label>
              <textarea
                id="notes"
                rows={3}
                className="w-full border border-ink/40 bg-cream px-3 py-2.5 text-sm outline-none focus:border-brass"
              />
            </div>
            <p className="text-xs text-muted-foreground">الدفع عند الاستلام.</p>
            <button
              type="submit"
              className="w-full border border-ink bg-ink py-3.5 text-sm text-cream transition-colors hover:bg-brass hover:text-ink"
            >
              تأكيد الطلب
            </button>
          </form>

          <aside className="h-fit border border-ink bg-cream p-6">
            <h2 className="font-display text-3xl">ملخص الطلب</h2>
            {items.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                السلة فاضية —{" "}
                <Link to="/" hash="products" className="underline">
                  تصفح المنتجات
                </Link>
              </p>
            ) : (
              <ul className="mt-5 space-y-3 border-b border-ink/20 pb-5">
                {items.map((i) => (
                  <li key={i.id} className="flex items-baseline justify-between text-sm">
                    <span>
                      <span className="font-display text-xl">{i.name}</span>{" "}
                      <span className="text-muted-foreground">
                        {i.weight} × <span dir="ltr">{i.qty}</span>
                      </span>
                    </span>
                    <span className="flex items-center gap-3">
                      <span dir="ltr">{i.price * i.qty}</span>
                      <button
                        onClick={() => setQty(i.id, 0)}
                        className="text-xs text-muted-foreground underline"
                      >
                        حذف
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>المجموع</span>
                <span dir="ltr">{total} EGP</span>
              </div>
              <div className="flex justify-between">
                <span>التوصيل</span>
                <span dir="ltr">{shipping} EGP</span>
              </div>
              <div className="flex justify-between border-t border-ink/20 pt-3 font-display text-2xl">
                <span>الإجمالي</span>
                <span dir="ltr">{total + shipping} EGP</span>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useAdminStore, api } from "@/lib/admin-store";
import { SiteHeader } from "@/components/site-header";
import { CONTACT } from "@/data/products";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "إتمام الطلب — بن فريد | Fareed Coffee" },
      {
        name: "description",
        content:
          "أكمل طلب البن من محمصة بن فريد بالمرج القديمة: بيانات التوصيل والدفع عند الاستلام داخل القاهرة.",
      },
      { property: "og:title", content: "إتمام الطلب — بن فريد | Fareed Coffee" },
      {
        property: "og:description",
        content: "أكمل طلب البن من محمصة بن فريد بالمرج القديمة. توصيل سريع داخل القاهرة.",
      },
    ],
  }),
  component: Checkout,
});

function normalizeEgyptianPhone(phone: string): {
  valid: boolean;
  formatted: string;
  error?: string;
} {
  let cleaned = phone
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/[\s\-\(\)\.]/g, "")
    .trim();

  if (cleaned.startsWith("+20")) {
    cleaned = cleaned.substring(3);
  } else if (cleaned.startsWith("0020")) {
    cleaned = cleaned.substring(4);
  } else if (cleaned.startsWith("20")) {
    cleaned = cleaned.substring(2);
  }

  if (cleaned.startsWith("01")) {
    cleaned = cleaned.substring(1);
  }

  if (!/^1[0125][0-9]{8}$/.test(cleaned)) {
    return {
      valid: false,
      formatted: "",
      error: "يرجى إدخال رقم هاتف مصري صحيح يبدأ بـ 010 أو 011 أو 012 أو 015 (11 رقم)",
    };
  }

  return {
    valid: true,
    formatted: `+201${cleaned.substring(1)}`,
  };
}

function parseApiErrorMessage(errData: any): string {
  if (!errData) return "حدث خطأ أثناء تسجيل الطلب";
  if (typeof errData === "string") return errData;
  if (Array.isArray(errData.detail)) {
    const messages = errData.detail.map((d: any) => d.msg || d.message).filter(Boolean);
    if (messages.length) return messages.join(" - ");
  }
  if (typeof errData.detail === "string") return errData.detail;
  if (errData.detail?.message) return errData.detail.message;
  if (errData.error?.message) return errData.error.message;
  if (errData.message) return errData.message;
  return "حدث خطأ أثناء تسجيل الطلب";
}

function Checkout() {
  const { items, total, clear, setQty } = useCart();
  const { createOrder, settings, products } = useAdminStore();
  const [done, setDone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrderNumber, setCreatedOrderNumber] = useState<string>("");
  const shipping = items.length ? settings.deliveryFee : 0;

  if (done) {
    return (
      <div className="paper min-h-screen">
        <SiteHeader />
        <main className="mx-auto max-w-xl px-5 py-20 text-center animate-fade-in-up">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brass/20 text-brass mb-6">
            <CheckCircle2 className="h-12 w-12" />
          </div>
          <h1 className="font-display text-5xl">تم استلام طلبك بنجاح!</h1>
          {createdOrderNumber && (
            <div className="mt-3 inline-block rounded bg-ink px-4 py-1.5 text-sm font-mono font-bold text-cream">
              رقم الطلب: #{createdOrderNumber}
            </div>
          )}
          <p className="mt-4 text-base leading-8 text-muted-foreground">
            هنكلمك خلال وقت قصير على رقمك لتأكيد الطلب وميعاد التوصيل. للتواصل السريع كلمنا على{" "}
            <a
              href={`tel:${CONTACT.sales}`}
              dir="ltr"
              className="font-bold text-foreground underline"
            >
              {CONTACT.sales}
            </a>
            .
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/"
              className="border border-ink bg-ink px-8 py-3.5 text-sm font-medium text-cream hover:bg-brass hover:text-ink transition-colors"
            >
              الرجوع للرئيسية
            </Link>
            <a
              href="https://www.facebook.com/fareedcoffee"
              target="_blank"
              rel="noreferrer"
              className="border border-ink bg-kraft px-8 py-3.5 text-sm font-medium text-ink hover:bg-ink hover:text-cream transition-colors"
            >
              متابعتنا على فيسبوك
            </a>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="paper min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-5 py-12">
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl">إتمام الطلب</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          أدخل بيانات التوصيل لتأكيد طلبك من محمصة بن فريد.
        </p>

        <div className="mt-10 grid gap-10 md:grid-cols-[1.2fr_1fr]">
          <form
            className="space-y-5"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!items.length) {
                toast.error("سلة الطلبات فارغة");
                return;
              }

              const formData = new FormData(e.currentTarget);
              const rawPhone = (formData.get("phone") as string) || "";
              const phoneValidation = normalizeEgyptianPhone(rawPhone);
              if (!phoneValidation.valid) {
                toast.error(phoneValidation.error || "رقم الهاتف غير صحيح");
                return;
              }

              setIsSubmitting(true);
              try {
                const customer = {
                  name: ((formData.get("name") as string) || "").trim(),
                  phone: phoneValidation.formatted,
                  address: ((formData.get("address") as string) || "").trim(),
                  area: ((formData.get("area") as string) || "").trim(),
                  notes: ((formData.get("notes") as string) || "").trim(),
                };

                // Resolve variant IDs for all items upfront
                const resolvedItems = items
                  .map((item) => {
                    let variantId = item.variantId;
                    if (!variantId) {
                      const prod = products.find(
                        (p) => p.id === item.productId || p.name === item.name,
                      );
                      const weightObj = prod?.weights.find((w) => w.grams === item.grams);
                      variantId = weightObj?.id;
                    }
                    return { ...item, resolvedVariantId: variantId };
                  })
                  .filter((item) => item.resolvedVariantId);

                if (resolvedItems.length === 0) {
                  toast.error("لم يتم العثور على المنتجات في السلة");
                  setIsSubmitting(false);
                  return;
                }

                // Submit order directly in a single atomic request (0 intermediate cart calls)
                const orderPayload = {
                  customer_name: customer.name,
                  customer_phone: customer.phone,
                  governorate: customer.area || "القاهرة",
                  city: customer.area || "القاهرة",
                  delivery_address: customer.address,
                  delivery_notes: customer.notes || null,
                  payment_method: "COD",
                  items: resolvedItems.map((item) => ({
                    product_variant_id: item.resolvedVariantId,
                    quantity: item.qty,
                  })),
                };

                const res = await fetch(api("/api/v1/public/orders/"), {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(orderPayload),
                });

                if (res.ok) {
                  const data = await res.json();

                  // Update local UI state
                  const newOrd = createOrder({
                    customer,
                    items: [...items],
                    subtotal: total,
                    shipping,
                    total: total + shipping,
                  });
                  newOrd.id = data.id;
                  newOrd.orderNumber = data.order_number;

                  setCreatedOrderNumber(data.order_number);
                  clear();
                  setDone(true);
                  toast.success(`تم تسجيل طلبك بنجاح برقم #${data.order_number}`);
                } else {
                  const errData = await res.json().catch(() => ({}));
                  toast.error(parseApiErrorMessage(errData));
                }
              } catch (err) {
                console.error("Checkout failed:", err);
                toast.error("حدث خطأ في الاتصال بالخادم، يرجى المحاولة مرة أخرى");
              } finally {
                setIsSubmitting(false);
              }
            }}
          >
            {[
              { name: "name", label: "الاسم بالكامل", type: "text", placeholder: "أحمد محمد" },
              { name: "phone", label: "رقم الموبايل", type: "tel", placeholder: "01xxxxxxxxx" },
              {
                name: "address",
                label: "العنوان بالتفصيل",
                type: "text",
                placeholder: "اسم الشارع، رقم العمارة، رقم الشقة",
              },
              {
                name: "area",
                label: "المنطقة / المحافظة",
                type: "text",
                placeholder: "المرج، مصر الجديدة، التجمع...",
              },
            ].map((f) => (
              <div key={f.name}>
                <label className="mb-1.5 block text-sm font-medium" htmlFor={f.name}>
                  {f.label}
                </label>
                <input
                  id={f.name}
                  name={f.name}
                  type={f.type}
                  placeholder={f.placeholder}
                  required
                  dir={f.name === "phone" ? "ltr" : "rtl"}
                  className="w-full border border-ink/40 bg-cream px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-brass"
                />
              </div>
            ))}
            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="notes">
                ملاحظات الطلب أو الطحن (اختياري)
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={2}
                placeholder="اكتب درجة الطحن (كنكة / فلتر / إسبريسو / حصى) أو أي تفاصيل خاصة بالتوصيل..."
                className="w-full border border-ink/40 bg-cream px-3.5 py-2 text-sm outline-none transition-colors focus:border-brass"
              />
            </div>
            <div className="rounded border border-ink/20 bg-kraft/40 p-3 text-xs text-muted-foreground">
              💡 الدفع عند الاستلام داخل القاهرة. سيتم التواصل معك هاتفيًا قبل خروج المندوب.
            </div>
            <button
              type="submit"
              disabled={items.length === 0 || isSubmitting}
              className="w-full border border-ink bg-ink py-3.5 text-sm font-medium text-cream transition-all hover:bg-brass hover:text-ink active:scale-98 disabled:opacity-40"
            >
              {isSubmitting ? "جاري التسجيل..." : "تأكيد الطلب"}
            </button>
          </form>

          <aside className="h-fit border border-ink bg-cream p-6 shadow-sm">
            <div className="flex items-center gap-2 border-b border-ink/20 pb-4">
              <ShoppingBag className="h-5 w-5 text-brass" />
              <h2 className="font-display text-3xl">ملخص الطلب</h2>
            </div>
            {items.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                <p>السلة فاضية</p>
                <Link
                  to="/"
                  hash="products"
                  className="mt-2 inline-block font-medium text-brass underline"
                >
                  تصفح المنتجات وأضف للطلب
                </Link>
              </div>
            ) : (
              <ul className="mt-5 space-y-3 border-b border-ink/20 pb-5">
                {items.map((i) => (
                  <li key={i.id} className="flex items-baseline justify-between text-sm">
                    <div>
                      <span className="font-display text-xl">{i.name}</span>{" "}
                      <span className="text-xs text-muted-foreground">
                        ({i.weight} × <span dir="ltr">{i.qty}</span>)
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold" dir="ltr">
                        {i.price * i.qty} ج.م
                      </span>
                      <button
                        type="button"
                        onClick={() => setQty(i.id, 0)}
                        className="text-xs text-red-600 underline hover:text-red-800"
                      >
                        حذف
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>المجموع</span>
                <span>
                  <span dir="ltr">{total}</span> ج.م
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>التوصيل (داخل القاهرة)</span>
                <span>
                  <span dir="ltr">{shipping}</span> ج.م
                </span>
              </div>
              <div className="flex justify-between border-t border-ink/20 pt-3 font-display text-2xl">
                <span>الإجمالي النهائي</span>
                <span className="text-brass">
                  <span dir="ltr">{total + shipping}</span> ج.م
                </span>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

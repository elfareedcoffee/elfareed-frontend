import { useState } from "react";
import { toast } from "sonner";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart";
import type { AdminProduct } from "@/lib/admin-store";

export function ProductCard({ product }: { product: AdminProduct; index: number }) {
  const { add } = useCart();
  const [weightIdx, setWeightIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const w = product.weights[weightIdx]!;

  return (
    <article className="grain card-hover flex h-full flex-col border border-ink bg-cream overflow-hidden">
      {product.image ? (
        <div className="h-44 w-full overflow-hidden border-b border-ink/20 relative">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          />
          <div
            className="absolute top-2 right-2 h-3 w-3 rounded-full border border-cream shadow-xs"
            style={{ backgroundColor: product.marker }}
          />
        </div>
      ) : (
        <div className="h-2 w-full shrink-0" style={{ backgroundColor: product.marker }} />
      )}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-display text-4xl leading-none">{product.name}</h3>
            <p className="mt-2 text-xs tracking-widest text-muted-foreground uppercase">
              {product.latin} roast
            </p>
          </div>
          {!product.image && (
            <span
              className="mt-1 h-6 w-6 shrink-0 rounded-full transition-transform duration-300 hover:scale-125"
              style={{ backgroundColor: product.marker }}
              aria-hidden="true"
            />
          )}
        </div>

        <p className="mt-4 text-sm leading-7 text-muted-foreground">{product.desc}</p>
        <p className="mt-3 text-xs font-semibold text-brass">{product.note}</p>

        <div className="mt-auto pt-6">
          <p className="text-xs text-ink/70 font-medium mb-2">اختار الوزن:</p>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {product.weights.map((weight, i) => (
              <button
                key={weight.grams}
                onClick={() => setWeightIdx(i)}
                className={`border px-2.5 py-1 text-xs sm:text-sm font-medium transition-all duration-200 ${
                  i === weightIdx
                    ? "border-ink bg-ink text-cream shadow-sm"
                    : "border-ink/35 hover:border-ink hover:bg-kraft/50 text-foreground"
                }`}
              >
                {weight.label}
              </button>
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-ink/20 pt-4">
            <div className="flex items-center border border-ink/40 bg-background">
              <button
                className="px-2.5 py-1 transition-colors hover:bg-ink hover:text-cream"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="نقصان"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-7 text-center text-sm font-semibold" dir="ltr">
                {qty}
              </span>
              <button
                className="px-2.5 py-1 transition-colors hover:bg-ink hover:text-cream"
                onClick={() => setQty((q) => q + 1)}
                aria-label="زيادة"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            <span className="font-display text-2xl">
              <span dir="ltr">{w.price * qty}</span> ج.م
            </span>
          </div>

          <button
            onClick={() => {
              add(
                {
                  productId: product.id,
                  variantId: w.id,
                  name: product.name,
                  weight: w.label,
                  grams: w.grams,
                  price: w.price,
                },
                qty,
              );
              toast.success(`تمت إضافة ${product.name} (${w.label} × ${qty}) إلى سلة الطلبات`);
            }}
            className="mt-4 flex w-full items-center justify-center gap-2 border border-ink bg-ink py-3 text-sm font-medium text-cream transition-all duration-200 hover:bg-brass hover:text-ink hover:shadow-md active:scale-[0.98]"
          >
            <ShoppingBag className="h-4 w-4" />
            أضف للطلب
          </button>
        </div>
      </div>
    </article>
  );
}

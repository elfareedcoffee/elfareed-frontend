import { useState } from "react";
import { toast } from "sonner";
import { useCart } from "@/lib/cart";
import type { Product } from "@/data/products";

export function ProductCard({ product, index }: { product: Product; index: number }) {
  const { add } = useCart();
  const [weightIdx, setWeightIdx] = useState(1);
  const [qty, setQty] = useState(1);
  const w = product.weights[weightIdx]!;

  return (
    <article
      className="grain card-hover flex h-full flex-col border border-ink bg-cream"
    >
      <div className="h-2 w-full shrink-0" style={{ backgroundColor: product.marker }} />
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-display text-4xl leading-none">{product.name}</h3>
            <p className="mt-2 text-xs tracking-widest text-muted-foreground uppercase">
              {product.latin} roast
            </p>
          </div>
          <span
            className="mt-1 h-6 w-6 shrink-0 rounded-full transition-transform duration-300 hover:scale-125"
            style={{ backgroundColor: product.marker }}
            aria-hidden="true"
          />
        </div>

        <p className="mt-4 text-sm leading-7 text-muted-foreground">{product.desc}</p>
        <p className="mt-3 text-xs font-medium text-brass">{product.note}</p>

        <div className="mt-auto pt-6">
          <div className="flex flex-wrap gap-2">
            {product.weights.map((weight, i) => (
              <button
                key={weight.grams}
                onClick={() => setWeightIdx(i)}
                className={`border px-3 py-1.5 text-sm transition-all duration-200 ${
                  i === weightIdx
                    ? "border-ink bg-ink text-cream shadow-sm"
                    : "border-ink/35 hover:border-ink hover:bg-kraft/50"
                }`}
              >
                {weight.label}
              </button>
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-ink/20 pt-4">
            <div className="flex items-center border border-ink/40">
              <button
                className="px-3 py-1.5 transition-colors hover:bg-ink hover:text-cream"
                onClick={() => setQty((q) => q + 1)}
              >
                +
              </button>
              <span className="w-8 text-center text-sm font-semibold" dir="ltr">
                {qty}
              </span>
              <button
                className="px-3 py-1.5 transition-colors hover:bg-ink hover:text-cream"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >
                −
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
                  name: product.name,
                  weight: w.label,
                  grams: w.grams,
                  price: w.price,
                },
                qty,
              );
              toast.success(`تمت إضافة ${product.name} — ${w.label}`);
            }}
            className="mt-4 w-full border border-ink bg-background py-3 text-sm font-medium transition-all duration-200 hover:bg-ink hover:text-cream hover:shadow-md active:scale-[0.98]"
          >
            أضف للطلب
          </button>
        </div>
      </div>
    </article>
  );
}

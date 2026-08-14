import { useState } from "react";
import type { Product } from "@/data/products";

export function ProductCard({ product }: { product: Product; index: number }) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const selectedWeight = product.weights[selectedIdx]!;

  return (
    <article className="grain card-hover flex h-full flex-col border border-ink bg-cream">
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
        <p className="mt-3 text-xs font-semibold text-brass">{product.note}</p>

        <div className="mt-auto pt-6">
          <p className="text-xs text-ink/70 font-medium mb-2">الأوزان المتاحة:</p>
          <div className="flex flex-wrap gap-2">
            {product.weights.map((weight, i) => (
              <button
                key={weight.grams}
                onClick={() => setSelectedIdx(i)}
                className={`border px-3 py-1.5 text-sm transition-all duration-200 ${
                  i === selectedIdx
                    ? "border-ink bg-ink text-cream shadow-sm"
                    : "border-ink/35 hover:border-ink hover:bg-kraft/50"
                }`}
              >
                {weight.label}
              </button>
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-ink/20 pt-4">
            <span className="text-xs text-muted-foreground">السعر:</span>
            <span className="font-display text-2xl">
              <span dir="ltr">{selectedWeight.price}</span> ج.م
            </span>
          </div>

          <a
            href="https://www.facebook.com/fareedcoffee"
            target="_blank"
            rel="noreferrer"
            className="mt-4 flex w-full items-center justify-center border border-ink bg-ink py-3 text-sm font-medium text-cream transition-all duration-200 hover:bg-brass hover:text-ink hover:shadow-md active:scale-[0.98]"
          >
            تواصل للاستفسار والطلب
          </a>
        </div>
      </div>
    </article>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, Phone } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { ProductCard } from "@/components/product-card";
import { Stamp } from "@/components/stamp";
import { ScrollReveal } from "@/components/scroll-reveal";
import { products, CONTACT } from "@/data/products";
import heroBeans from "@/assets/hero-beans.jpg";
import storyPour from "@/assets/story-pour.jpg";
import wholesaleSacks from "@/assets/wholesale-sacks.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "بن الفريد — اختيار الملوك | محمصة بن بالمرج القديمة" },
      {
        name: "description",
        content:
          "بن الفريد: محوج، وسط، فاتح، غامق — بن محمص طازج بالمرج القديمة، القاهرة. اطلب أونلاين أو اتواصل للجملة.",
      },
      { property: "og:title", content: "بن الفريد — اختيار الملوك" },
      {
        property: "og:description",
        content: "بن محمص طازج: محوج، وسط، فاتح، غامق. توصيل داخل القاهرة وأسعار جملة.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="paper min-h-screen">
      <SiteHeader />

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-ink/25">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 pt-16 pb-24 md:grid-cols-12 md:pt-24">
          <div className="animate-fade-in-up md:col-span-7 md:pt-6">
            <p className="text-xs tracking-[0.35em] text-brass uppercase">
              Alfareed Coffee · Cairo
            </p>
            <h1 className="mt-6 font-display text-[clamp(3.5rem,11vw,7.5rem)] leading-[0.95]">
              بن الفريد
            </h1>
            <p className="hand-underline mt-2 inline-block font-display text-[clamp(1.75rem,5vw,3rem)] text-brass">
              اختيار الملوك
            </p>
            <p className="mt-8 max-w-md text-sm leading-8 text-muted-foreground">
              محمصة صغيرة في المرج القديمة. بنحمّص على دفعات قليلة كل يوم، وبنطحن
              الطلب وقت ما تطلبه — مش قبلها.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <a
                href="#products"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="border border-ink bg-ink px-7 py-3.5 text-sm text-cream transition-all duration-300 hover:bg-brass hover:text-ink hover:shadow-md active:scale-95 cursor-pointer"
              >
                اطلب أونلاين
              </a>
              <a
                href="#products"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="border border-ink px-7 py-3.5 text-sm transition-all duration-300 hover:bg-kraft active:scale-95 cursor-pointer"
              >
                تصفح المنتجات
              </a>
            </div>

            {/* roast tags — aligned straight on the exact same horizontal line */}
            <ul className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm">
              {products.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center gap-2 font-medium transition-transform duration-200 hover:scale-105"
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full animate-pulse-subtle"
                    style={{ backgroundColor: p.marker }}
                  />
                  {p.name}
                </li>
              ))}
            </ul>
          </div>

          <div className="animate-fade-in-up relative md:col-span-5">
            <div className="grain relative md:-me-24 md:translate-y-6">
              <img
                src={heroBeans}
                alt="حبوب بن محمصة تتساقط من شوال خيش"
                width={1200}
                height={1504}
                className="h-[26rem] w-full border border-ink object-cover transition-transform duration-700 hover:scale-[1.01] md:h-[34rem]"
              />
              <div className="animate-float absolute -bottom-6 start-4 flex h-24 w-24 items-center justify-center rounded-full bg-background text-brass shadow-lg md:-start-8">
                <Stamp className="h-24 w-24" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section id="products" className="mx-auto max-w-6xl px-5 py-20">
        <ScrollReveal>
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-ink pb-5">
            <h2 className="font-display text-5xl md:text-6xl">التحميصات</h2>
            <p className="max-w-sm text-sm text-muted-foreground">
              أربع درجات. اختار الوزن والكمية وضيفها لطلبك — التوصيل داخل القاهرة.
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-12 grid gap-7 items-stretch sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p, i) => (
            <ScrollReveal key={p.id} delay={i * 120}>
              <ProductCard product={p} index={i} />
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* STORY */}
      <section
        id="story"
        className="torn-top grain border-y border-ink/25 bg-ink text-cream"
      >
        <ScrollReveal className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-24 md:grid-cols-2">
          <div>
            <p className="text-xs tracking-[0.3em] text-brass uppercase">عن الفريد</p>
            <h2 className="mt-5 font-display text-5xl leading-tight md:text-6xl">
              محمصة جديدة،
              <br />
              بمزاج قديم
            </h2>
            <p className="mt-7 max-w-lg text-sm leading-9 text-cream/80">
              بدأنا بمكنة تحميص واحدة وشوال خيش. النية بسيطة: بن نظيف، تحميص أمين،
              وسعر عادل. بنختار الحبة بنفسنا، وبنحمّص دفعات صغيرة عشان الفنجان يوصلك
              وهو لسه فايح.
            </p>
            <p className="mt-5 max-w-lg text-sm leading-9 text-cream/80">
              «اختيار الملوك» مش شعار للزينة — ده المعيار اللي بنرفض بيه أي دفعة
              تحميص مش على المستوى.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <Stamp className="h-16 w-16 text-brass animate-float" />
              <span className="text-xs text-cream/60">
                ختم المحمصة — كل شوال بيتختم قبل ما يخرج
              </span>
            </div>
          </div>
          <img
            src={storyPour}
            alt="يد تصب بن محمص في وعاء فخاري بجانب أدوات قهوة نحاسية"
            loading="lazy"
            width={1200}
            height={912}
            className="border border-cream/25 object-cover transition-transform duration-500 hover:scale-[1.02] md:translate-x-6"
          />
        </ScrollReveal>
      </section>

      {/* WHOLESALE */}
      <section id="wholesale" className="mx-auto max-w-6xl px-5 py-20">
        <ScrollReveal>
          <div className="grid border border-ink md:grid-cols-2">
            <img
              src={wholesaleSacks}
              alt="شوالات بن مكدسة داخل مخزن المحمصة"
              loading="lazy"
              width={1408}
              height={800}
              className="h-full w-full object-cover"
            />
            <div className="bg-kraft p-9">
              <p className="text-xs tracking-[0.3em] text-ink/60 uppercase">B2B</p>
              <h2 className="mt-4 font-display text-4xl">الجملة</h2>
              <p className="mt-5 text-sm leading-8">
                توريد للكافيهات، المطاعم، والمحلات. أسعار حسب الكمية، تحميص وطحن على
                مواصفاتك، وتعاقد شهري بتوريد ثابت.
              </p>
              <dl className="mt-7 space-y-3 text-sm">
                <div className="flex items-center justify-between border-b border-ink/25 pb-2">
                  <dt>الحد الأدنى للطلب</dt>
                  <dd dir="ltr">10 kg</dd>
                </div>
                <div className="flex items-center justify-between border-b border-ink/25 pb-2">
                  <dt>مواعيد التوريد</dt>
                  <dd>خلال ٤٨ ساعة</dd>
                </div>
              </dl>
              <div className="mt-7 space-y-2">
                <p className="text-xs text-ink/70">أرقام الجملة</p>
                {CONTACT.wholesale.map((n) => (
                  <a
                    key={n}
                    href={`tel:${n}`}
                    dir="ltr"
                    className="block w-fit border border-ink px-4 py-2 font-mono text-sm transition-colors hover:bg-ink hover:text-cream"
                  >
                    {n}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* LOCATION / CONTACT */}
      <section id="contact" className="border-t border-ink/25 bg-cream">
        <ScrollReveal className="mx-auto grid max-w-6xl gap-10 px-5 py-20 md:grid-cols-2">
          <div>
            <h2 className="font-display text-5xl">المحمصة</h2>
            <p className="mt-6 flex items-start gap-3 text-sm leading-8">
              <MapPin className="mt-1 h-4 w-4 shrink-0 text-brass" />
              {CONTACT.address}
            </p>
            <p className="mt-3 flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 shrink-0 text-brass" />
              <a href={`tel:${CONTACT.sales}`} dir="ltr" className="font-mono">
                {CONTACT.sales}
              </a>
              <span className="text-muted-foreground">— للطلبات</span>
            </p>
            <p className="mt-6 text-sm text-muted-foreground">
              مفتوح يوميًا من ٩ صباحًا حتى ١١ مساءً.
            </p>
          </div>
          <iframe
            title="موقع محمصة بن الفريد على الخريطة"
            src="https://www.openstreetmap.org/export/embed.html?bbox=31.32%2C30.14%2C31.36%2C30.17&layer=mapnik&marker=30.155,31.34"
            className="h-72 w-full border border-ink"
            loading="lazy"
          />
        </ScrollReveal>
      </section>

      <footer className="border-t border-ink/25 bg-ink text-cream">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-5 py-10">
          <div>
            <p className="font-display text-3xl">بن الفريد</p>
            <p className="mt-1 text-xs text-cream/60">اختيار الملوك</p>
          </div>
          <div className="text-sm text-cream/80">
            <p>
              الطلبات:{" "}
              <a href={`tel:${CONTACT.sales}`} dir="ltr" className="font-mono">
                {CONTACT.sales}
              </a>
            </p>
            <p className="mt-1">
              الجملة:{" "}
              <span dir="ltr" className="font-mono">
                {CONTACT.wholesale.join(" / ")}
              </span>
            </p>
          </div>
          <div className="flex gap-4 text-sm text-cream/70">
            <a href="https://facebook.com" target="_blank" rel="noreferrer">
              فيسبوك
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer">
              إنستجرام
            </a>
            <a href={`https://wa.me/2${CONTACT.sales}`} target="_blank" rel="noreferrer">
              واتساب
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

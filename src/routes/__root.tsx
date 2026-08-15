import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Toaster } from "../components/ui/sonner";
import { CartProvider } from "../lib/cart";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl text-brass">٤٠٤</h1>
        <h2 className="mt-4 font-display text-2xl text-foreground">الصفحة مش موجودة</h2>
        <p className="mt-2 text-sm text-muted-foreground">يمكن الرابط اتغير أو الصفحة اتشالت.</p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center border border-ink bg-ink px-4 py-2 text-sm text-cream hover:bg-brass hover:text-ink"
          >
            الرجوع للرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-2xl text-foreground">الصفحة ما اتحملتش</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          حصلت مشكلة عندنا. جرّب تحدّث الصفحة أو ارجع للرئيسية.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center border border-ink bg-ink px-4 py-2 text-sm text-cream hover:bg-brass hover:text-ink"
          >
            حاول تاني
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center border border-ink px-4 py-2 text-sm text-foreground hover:bg-kraft"
          >
            الرئيسية
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "بن فريد — اختيار الملوك | Fareed Coffee" },
      {
        name: "description",
        content:
          "محمصة بن فريد بالمرج القديمة: محوج، وسط، فاتح، غامق. تصفح منتجاتنا وتواصل معنا عبر الفيسبوك والإنستجرام.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Rakkas&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600&display=swap",
      },
      { rel: "icon", href: "/favicon.jpg", type: "image/jpeg" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <Outlet />
        <Toaster position="top-center" />
      </CartProvider>
    </QueryClientProvider>
  );
}

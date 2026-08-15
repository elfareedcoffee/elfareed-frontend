import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ExternalLink, Store, Clock, RefreshCw } from "lucide-react";
import { useAdminStore } from "@/lib/admin-store";
import fareedLogo from "@/assets/fareed-logo.jpg";

export function AdminHeader() {
  const { settings, updateSettings, analytics, resetToDefaults } = useAdminStore();
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const update = () => {
      setTime(
        new Date().toLocaleTimeString("ar-EG", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-ink/25 bg-background/98 backdrop-blur shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5 group">
            <img
              src={fareedLogo}
              alt="شعار بن فريد"
              className="h-10 w-10 rounded-full object-cover border border-brass shadow-sm transition-transform group-hover:scale-105"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-2xl leading-none">بن فريد</span>
                <span className="rounded bg-ink px-1.5 py-0.5 text-[10px] font-bold text-cream">
                  الإدارة
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground">لوحة تحكم المحمصة والطلبات</p>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {/* Live time */}
          <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground font-mono bg-cream px-2.5 py-1 border border-ink/20">
            <Clock className="h-3.5 w-3.5 text-brass" />
            <span dir="ltr">{time}</span>
          </div>

          {/* Store status badge toggle */}
          <button
            onClick={() => updateSettings({ isOpen: !settings.isOpen })}
            className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium border transition-colors ${
              settings.isOpen
                ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                : "border-red-600 bg-red-50 text-red-800"
            }`}
            title="انقر لتغيير حالة استقبال الطلبات"
          >
            <span
              className={`h-2 w-2 rounded-full ${
                settings.isOpen ? "bg-emerald-500 animate-pulse" : "bg-red-500"
              }`}
            />
            {settings.isOpen ? "المتجر مفتوح" : "المتجر مغلق مؤقتًا"}
          </button>

          {/* Pending orders alert badge */}
          {analytics.pendingOrders > 0 && (
            <span className="hidden sm:inline-flex items-center gap-1 bg-brass px-2.5 py-1 text-xs font-bold text-ink rounded shadow-sm">
              <span>{analytics.pendingOrders}</span>
              <span className="text-[11px] font-normal">طلب جديد</span>
            </span>
          )}

          {/* Storefront button */}
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 border border-ink bg-ink px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium text-cream transition-all hover:bg-brass hover:text-ink active:scale-95"
          >
            <Store className="h-4 w-4" />
            <span>عرض المتجر</span>
            <ExternalLink className="h-3 w-3 opacity-70" />
          </Link>
        </div>
      </div>
    </header>
  );
}

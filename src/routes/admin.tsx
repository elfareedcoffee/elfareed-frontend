import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { BarChart3, ShoppingBag, Coffee, Settings } from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminLogin } from "@/components/admin/admin-login";
import { Loader2 } from "lucide-react";
import { InsightsTab } from "@/components/admin/insights-tab";
import { OrdersTab } from "@/components/admin/orders-tab";
import { ProductsTab } from "@/components/admin/products-tab";
import { SettingsTab } from "@/components/admin/settings-tab";
import { useAdminStore } from "@/lib/admin-store";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "لوحة التحكم | محمصة بن فريد — Fareed Coffee Admin" },
      {
        name: "description",
        content: "لوحة تحكم إدارة الطلبات، الأسعار، المنتجات، والتحليلات لمحمصة بن فريد.",
      },
    ],
  }),
  component: AdminPage,
});

type TabKey = "insights" | "orders" | "products" | "settings";

function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("insights");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { analytics, orders, fetchAdminData } = useAdminStore();

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
    if (!token) {
      setIsAuthenticated(false);
      return;
    }
    fetch("/api/v1/admin/auth/me", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then(res => {
        if (res.ok) {
          setIsAuthenticated(true);
          fetchAdminData();
        } else {
          localStorage.removeItem("admin_token");
          localStorage.removeItem("admin_csrf");
          setIsAuthenticated(false);
        }
      })
      .catch(() => setIsAuthenticated(false));
  }, []);

  if (isAuthenticated === null) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="w-10 h-10 animate-spin text-brass" /></div>;
  }

  if (isAuthenticated === false) {
    return (
      <AdminLogin
        onLoginSuccess={() => {
          setIsAuthenticated(true);
          fetchAdminData();
        }}
      />
    );
  }

  const tabs: { key: TabKey; label: string; icon: typeof BarChart3; badge?: number | string }[] = [
    { key: "insights", label: "التحليلات والمؤشرات", icon: BarChart3 },
    { key: "orders", label: "إدارة الطلبات", icon: ShoppingBag, badge: orders.length },
    { key: "products", label: "المنتجات والأسعار والصور", icon: Coffee },
    { key: "settings", label: "إعدادات المتجر", icon: Settings },
  ];

  return (
    <div className="paper min-h-screen bg-background text-foreground pb-20">
      <AdminHeader
        onLogout={() => {
          localStorage.removeItem("admin_token");
          localStorage.removeItem("admin_csrf");
          setIsAuthenticated(false);
        }}
      />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 pt-8">
        {/* Navigation Tabs Bar */}
        <div className="flex overflow-x-auto border-b border-ink/25 gap-1.5 sm:gap-2 pb-px mb-6 sm:mb-8 scrollbar-none touch-pan-x -mx-4 px-4 sm:mx-0 sm:px-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-3.5 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer shrink-0 ${
                  isActive
                    ? "border-brass text-ink bg-cream/80 shadow-xs"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-cream/40"
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${isActive ? "text-brass" : "text-muted-foreground"}`}
                />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-bold ${
                      isActive ? "bg-ink text-cream" : "bg-kraft text-ink"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Views */}
        <div>
          {activeTab === "insights" && (
            <InsightsTab onNavigateToOrders={() => setActiveTab("orders")} />
          )}

          {activeTab === "orders" && <OrdersTab />}

          {activeTab === "products" && <ProductsTab />}

          {activeTab === "settings" && <SettingsTab />}
        </div>
      </main>
    </div>
  );
}

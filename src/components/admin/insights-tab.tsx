import { DollarSign, ShoppingBag, Clock, TrendingUp, Award, ArrowUpRight } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useAdminStore } from "@/lib/admin-store";

export function InsightsTab({ onNavigateToOrders }: { onNavigateToOrders: () => void }) {
  const { analytics, orders } = useAdminStore();

  const kpis = [
    {
      title: "إجمالي المبيعات",
      value: `${analytics.totalRevenue.toLocaleString("ar-EG")} ج.م`,
      subtitle: "من الطلبات المؤكدة والمسلّمة",
      icon: DollarSign,
      color: "text-emerald-700 bg-emerald-50 border-emerald-300",
    },
    {
      title: "عدد الطلبات",
      value: `${analytics.totalOrders}`,
      subtitle: `${analytics.completedOrders} تم تسليمها بنجاح`,
      icon: ShoppingBag,
      color: "text-amber-800 bg-amber-50 border-amber-300",
    },
    {
      title: "طلبات قيد التجهيز",
      value: `${analytics.pendingOrders}`,
      subtitle: "تحتاج متابعة وتوصيل",
      icon: Clock,
      color: "text-blue-800 bg-blue-50 border-blue-300",
    },
    {
      title: "متوسط قيمة الطلب",
      value: `${analytics.averageOrderValue} ج.م`,
      subtitle: "لكل عميل",
      icon: TrendingUp,
      color: "text-purple-800 bg-purple-50 border-purple-300",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.title}
              className="grain card-hover border border-ink/30 bg-cream p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground uppercase">{kpi.title}</p>
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full border ${kpi.color}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-3 font-display text-3xl sm:text-4xl">{kpi.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{kpi.subtitle}</p>
            </div>
          );
        })}
      </div>

      {/* Charts & Breakdown Section */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Sales Trend Chart */}
        <div className="border border-ink/30 bg-cream p-6 shadow-sm lg:col-span-8">
          <div className="flex items-center justify-between border-b border-ink/20 pb-4">
            <div>
              <h3 className="font-display text-2xl">حركة المبيعات والطلبات</h3>
              <p className="text-xs text-muted-foreground">
                توزيع الإيرادات على مدار الأيام الأخيرة
              </p>
            </div>
            <span className="text-xs font-medium text-brass bg-background px-3 py-1 border border-ink/20">
              آخر ٧ أيام
            </span>
          </div>

          <div className="mt-6 h-72 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={analytics.dailySalesData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C9933B" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#C9933B" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#888" fontSize={12} tickLine={false} />
                <YAxis stroke="#888" fontSize={12} tickLine={false} unit=" ج.م" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length > 0 && payload[0]) {
                      const data = payload[0].payload as {
                        date: string;
                        sales: number;
                        orders: number;
                      };
                      if (!data) return null;
                      return (
                        <div className="border border-ink bg-ink p-3 text-cream shadow-md text-xs text-right">
                          <p className="font-bold">{data.date}</p>
                          <p className="mt-1 text-brass font-mono">
                            المبيعات: {data.sales.toLocaleString()} ج.م
                          </p>
                          <p className="text-cream/70 font-mono">الطلبات: {data.orders} طلب</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#261710"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#salesGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Roast Sales Breakdown */}
        <div className="border border-ink/30 bg-cream p-6 shadow-sm lg:col-span-4 flex flex-col">
          <div className="flex items-center gap-2 border-b border-ink/20 pb-4">
            <Award className="h-5 w-5 text-brass" />
            <h3 className="font-display text-2xl">أكثر التحميصات طلباً</h3>
          </div>

          <p className="mt-2 text-xs text-muted-foreground">
            نسبة مساهمة كل درجة تحميص في إجمالي المبيعات
          </p>

          <div className="mt-6 flex-1 space-y-4">
            {analytics.roastSalesBreakdown.map((r) => {
              const percentage =
                analytics.totalRevenue > 0
                  ? Math.round((r.sales / analytics.totalRevenue) * 100)
                  : 0;
              return (
                <div key={r.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 font-bold">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: r.marker }}
                      />
                      {r.name}
                    </span>
                    <span className="font-mono text-muted-foreground">
                      {r.sales.toLocaleString()} ج.م ({percentage}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-kraft rounded-full overflow-hidden border border-ink/10">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(5, percentage)}%`,
                        backgroundColor: r.marker,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Orders Preview */}
      <div className="border border-ink/30 bg-cream p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-ink/20 pb-4">
          <div>
            <h3 className="font-display text-2xl">أحدث الطلبات الواردة</h3>
            <p className="text-xs text-muted-foreground">آخر المعاملات المسجلة في المتجر</p>
          </div>
          <button
            onClick={onNavigateToOrders}
            className="inline-flex items-center gap-1 text-xs font-semibold text-brass hover:text-ink underline cursor-pointer"
          >
            <span>عرض كل الطلبات</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-ink/20 text-muted-foreground">
                <th className="pb-3 pr-2">رقم الطلب</th>
                <th className="pb-3">العميل</th>
                <th className="pb-3">المنطقة</th>
                <th className="pb-3">المنتجات</th>
                <th className="pb-3">الإجمالي</th>
                <th className="pb-3">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {orders.slice(0, 5).map((ord) => (
                <tr key={ord.id} className="hover:bg-kraft/40 transition-colors">
                  <td className="py-3 pr-2 font-mono font-bold">{ord.orderNumber}</td>
                  <td className="py-3 font-medium">{ord.customer.name}</td>
                  <td className="py-3 text-muted-foreground">{ord.customer.area}</td>
                  <td className="py-3">
                    {ord.items.map((i) => `${i.name} (${i.weight})`).join(" + ")}
                  </td>
                  <td className="py-3 font-bold font-mono">{ord.total} ج.م</td>
                  <td className="py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                        ord.status === "تم التوصيل"
                          ? "bg-emerald-100 text-emerald-800"
                          : ord.status === "قيد التجهيز"
                            ? "bg-blue-100 text-blue-800"
                            : ord.status === "ملغي"
                              ? "bg-red-100 text-red-800"
                              : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {ord.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

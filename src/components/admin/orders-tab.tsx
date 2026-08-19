import { useState, useMemo, useEffect } from "react";
import {
  Search,
  Filter,
  Phone,
  MessageSquare,
  MapPin,
  Eye,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  X,
  RefreshCw,
} from "lucide-react";
import { useAdminStore, type Order, type OrderStatus } from "@/lib/admin-store";
import { toast } from "sonner";

const STATUS_OPTIONS: OrderStatus[] = ["جديد", "قيد التجهيز", "تم التوصيل", "ملغي"];

export function OrdersTab() {
  const { orders, updateOrderStatus, deleteOrder, fetchAdminData } = useAdminStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("الكل");
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchAdminData();
      toast.success("تم تحديث قائمة الطلبات بنجاح");
    } catch {
      toast.error("فشل تحديث قائمة الطلبات");
    } finally {
      setIsRefreshing(false);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const orderNum = (o.orderNumber || "").toLowerCase();
      const customerName = (o.customer?.name || "").toLowerCase();
      const customerPhone = o.customer?.phone || "";
      const customerArea = (o.customer?.area || "").toLowerCase();
      const query = searchQuery.toLowerCase();

      const matchesSearch =
        orderNum.includes(query) ||
        customerName.includes(query) ||
        customerPhone.includes(searchQuery) ||
        customerArea.includes(query);

      const matchesStatus = selectedStatus === "الكل" || o.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, selectedStatus]);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "تم التوصيل":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "قيد التجهيز":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "ملغي":
        return "bg-red-100 text-red-800 border-red-300";
      case "جديد":
      default:
        return "bg-amber-100 text-amber-800 border-amber-300";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Controls: Search & Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border border-ink/30 bg-cream p-4 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث برقم الطلب، اسم العميل، أو رقم الهاتف..."
            className="w-full border border-ink/30 bg-background py-2 pr-9 pl-4 text-xs sm:text-sm outline-none focus:border-brass"
          />
        </div>

        {/* Filter Pills & Refresh Button */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {["الكل", ...STATUS_OPTIONS].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 text-xs font-medium border transition-colors cursor-pointer ${
                selectedStatus === st
                  ? "border-ink bg-ink text-cream"
                  : "border-ink/20 bg-background text-muted-foreground hover:bg-kraft"
              }`}
            >
              {st}
              {st === "الكل"
                ? ` (${orders.length})`
                : ` (${orders.filter((o) => o.status === st).length})`}
            </button>
          ))}

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border border-ink/30 bg-background hover:bg-ink hover:text-cream transition-colors cursor-pointer disabled:opacity-50"
            title="تحديث البيانات من السيرفر"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-brass" : ""}`} />
            <span>تحديث</span>
          </button>
        </div>
      </div>

      {/* Mobile Orders Cards View (md:hidden) */}
      <div className="space-y-3 md:hidden">
        {filteredOrders.length === 0 ? (
          <div className="border border-ink/30 bg-cream p-8 text-center text-xs text-muted-foreground">
            لا توجد طلبات مطابقة للبحث أو الفلتر المختار.
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="border border-ink/30 bg-cream p-4 shadow-xs space-y-3 transition-colors"
            >
              {/* Card Header: Order #, Status, Date */}
              <div className="flex items-center justify-between border-b border-ink/15 pb-2.5">
                <div>
                  <span className="font-mono font-bold text-sm">#{order.orderNumber}</span>
                  <p className="text-[11px] text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString("ar-EG", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                <select
                  value={order.status}
                  onChange={(e) => {
                    const newStatus = e.target.value as OrderStatus;
                    updateOrderStatus(order.id, newStatus);
                    toast.success(`تم تغيير حالة الطلب ${order.orderNumber} إلى ${newStatus}`);
                  }}
                  className={`rounded border px-2 py-1 text-xs font-semibold outline-none ${getStatusBadge(
                    order.status,
                  )}`}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Customer & Area */}
              <div className="flex items-start justify-between text-xs">
                <div>
                  <p className="font-bold text-foreground">{order.customer.name}</p>
                  <p className="text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3 text-brass shrink-0" />
                    {order.customer.area}
                  </p>
                </div>
                <a
                  href={`tel:${order.customer.phone}`}
                  dir="ltr"
                  className="font-mono text-xs font-bold text-brass bg-background px-2 py-1 border border-ink/20 flex items-center gap-1"
                >
                  <Phone className="h-3 w-3" />
                  {order.customer.phone}
                </a>
              </div>

              {/* Items summary */}
              <div className="bg-background/80 p-2 border border-ink/10 text-xs">
                <p className="text-muted-foreground font-medium">
                  {order.items.map((i) => `${i.name} (${i.weight} × ${i.qty})`).join(" + ")}
                </p>
              </div>

              {/* Card Footer: Total & Actions */}
              <div className="flex items-center justify-between border-t border-ink/15 pt-2.5">
                <div className="text-xs">
                  <span className="text-muted-foreground">الإجمالي: </span>
                  <span className="font-bold font-mono text-sm text-foreground">
                    {order.total} ج.م
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveOrder(order)}
                    className="inline-flex items-center gap-1 border border-ink bg-ink px-3 py-1.5 text-xs font-bold text-cream hover:bg-brass hover:text-ink transition-colors cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    التفاصيل
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`هل أنت متأكد من حذف الطلب ${order.orderNumber}؟`)) {
                        deleteOrder(order.id);
                        toast.info(`تم حذف الطلب ${order.orderNumber}`);
                      }
                    }}
                    className="p-1.5 border border-red-300 text-red-600 hover:bg-red-600 hover:text-white transition-colors cursor-pointer rounded"
                    title="حذف الطلب"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Orders Table (hidden on mobile, visible on md+) */}
      <div className="hidden md:block border border-ink/30 bg-cream shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs sm:text-sm">
            <thead className="border-b border-ink/20 bg-background/60 text-muted-foreground text-xs">
              <tr>
                <th className="py-3.5 pr-4">رقم الطلب</th>
                <th className="py-3.5">العميل</th>
                <th className="py-3.5">رقم الهاتف</th>
                <th className="py-3.5">المنطقة</th>
                <th className="py-3.5">المنتجات</th>
                <th className="py-3.5">الإجمالي</th>
                <th className="py-3.5">تاريخ الطلب</th>
                <th className="py-3.5">الحالة</th>
                <th className="py-3.5 pl-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-muted-foreground">
                    لا توجد طلبات مطابقة للبحث أو الفلتر المختار.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-kraft/40 transition-colors">
                    <td className="py-3.5 pr-4 font-mono font-bold">{order.orderNumber}</td>
                    <td className="py-3.5 font-medium">{order.customer.name}</td>
                    <td className="py-3.5 font-mono text-xs" dir="ltr">
                      <a
                        href={`tel:${order.customer.phone}`}
                        className="hover:text-brass underline"
                      >
                        {order.customer.phone}
                      </a>
                    </td>
                    <td className="py-3.5 text-muted-foreground">{order.customer.area}</td>
                    <td className="py-3.5">
                      <span className="font-semibold">
                        {order.items.reduce((s, i) => s + i.qty, 0)} عبوة
                      </span>{" "}
                      <span className="text-xs text-muted-foreground">
                        ({order.items.map((i) => i.name).join("، ")})
                      </span>
                    </td>
                    <td className="py-3.5 font-bold font-mono text-foreground">
                      {order.total} ج.م
                    </td>
                    <td className="py-3.5 text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString("ar-EG", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3.5">
                      <select
                        value={order.status}
                        onChange={(e) => {
                          const newStatus = e.target.value as OrderStatus;
                          updateOrderStatus(order.id, newStatus);
                          toast.success(
                            `تم تغيير حالة الطلب ${order.orderNumber} إلى ${newStatus}`,
                          );
                        }}
                        className={`rounded border px-2 py-1 text-xs font-semibold outline-none cursor-pointer ${getStatusBadge(
                          order.status,
                        )}`}
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3.5 pl-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setActiveOrder(order)}
                          className="p-1.5 border border-ink/30 bg-background hover:bg-ink hover:text-cream transition-colors rounded cursor-pointer"
                          title="تفاصيل الطلب"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`هل أنت متأكد من حذف الطلب ${order.orderNumber}؟`)) {
                              deleteOrder(order.id);
                              toast.info(`تم حذف الطلب ${order.orderNumber}`);
                            }
                          }}
                          className="p-1.5 border border-red-300 text-red-600 hover:bg-red-600 hover:text-white transition-colors rounded cursor-pointer"
                          title="حذف الطلب"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {activeOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-fade-in-up">
          <div className="relative w-full max-w-2xl border border-ink bg-cream p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-ink/20 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-3xl">طلب #{activeOrder.orderNumber}</span>
                  <span
                    className={`rounded border px-2.5 py-0.5 text-xs font-bold ${getStatusBadge(
                      activeOrder.status,
                    )}`}
                  >
                    {activeOrder.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  بتاريخ: {new Date(activeOrder.createdAt).toLocaleString("ar-EG")}
                </p>
              </div>
              <button
                onClick={() => setActiveOrder(null)}
                className="p-1.5 hover:bg-kraft border border-ink/20 rounded cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Customer Info & Direct Contacts */}
            <div className="mt-5 grid gap-4 sm:grid-cols-2 border border-ink/20 bg-background p-4">
              <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase">
                  بيانات العميل
                </p>
                <p className="mt-1 font-bold text-base">{activeOrder.customer.name}</p>
                <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-brass shrink-0" />
                  {activeOrder.customer.address} ({activeOrder.customer.area})
                </p>
                {activeOrder.customer.notes && (
                  <div className="mt-3 bg-kraft/50 p-2.5 border border-ink/20 text-xs">
                    <span className="font-bold block text-brass">ملاحظات الطحن:</span>
                    <p className="mt-0.5 text-foreground">{activeOrder.customer.notes}</p>
                  </div>
                )}
              </div>

              {/* Quick Communication Actions */}
              <div className="flex flex-col justify-center gap-2.5 border-t sm:border-t-0 sm:border-r border-ink/15 sm:pr-4 pt-3 sm:pt-0">
                <p className="text-xs text-muted-foreground font-semibold uppercase">
                  تواصل فوري مع العميل
                </p>
                <a
                  href={`https://wa.me/2${activeOrder.customer.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                    `أهلاً بك أستاذ ${activeOrder.customer.name}، بخصوص طلبك من محمصة بن فريد رقم (${activeOrder.orderNumber})...`,
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 border border-emerald-600 bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-emerald-700 rounded shadow-xs"
                >
                  <MessageSquare className="h-4 w-4" />
                  مراسلة واتساب فورية
                </a>

                <a
                  href={`tel:${activeOrder.customer.phone}`}
                  className="flex items-center justify-center gap-2 border border-ink bg-ink px-4 py-2.5 text-xs font-bold text-cream transition-colors hover:bg-brass hover:text-ink rounded shadow-xs"
                >
                  <Phone className="h-4 w-4" />
                  اتصال هاتفي ({activeOrder.customer.phone})
                </a>
              </div>
            </div>

            {/* Itemized Products List */}
            <div className="mt-6">
              <h4 className="text-sm font-bold border-b border-ink/20 pb-2">المنتجات المطلوبة</h4>
              <ul className="mt-3 divide-y divide-ink/10 border border-ink/20 bg-background">
                {activeOrder.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between p-3 text-xs sm:text-sm"
                  >
                    <div>
                      <span className="font-display text-lg">{item.name}</span>{" "}
                      <span className="bg-kraft border border-ink/20 px-2 py-0.5 text-xs font-semibold mr-1">
                        {item.weight}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground font-mono">
                        {item.qty} × {item.price} ج.م
                      </span>
                      <span className="font-bold font-mono text-base">
                        {item.price * item.qty} ج.م
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Financial Breakdown */}
            <div className="mt-4 border border-ink/20 bg-background p-4 space-y-1.5 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span>المجموع الفرعي</span>
                <span className="font-mono">{activeOrder.subtotal} ج.م</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>سعر التوصيل (القاهرة)</span>
                <span className="font-mono">{activeOrder.shipping} ج.م</span>
              </div>
              <div className="flex justify-between border-t border-ink/20 pt-2 font-display text-xl sm:text-2xl text-brass font-bold">
                <span>الإجمالي للدفع عند الاستلام</span>
                <span className="font-mono">{activeOrder.total} ج.م</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-ink/20 pt-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold">تغيير الحالة:</span>
                <select
                  value={activeOrder.status}
                  onChange={(e) => {
                    const newStatus = e.target.value as OrderStatus;
                    updateOrderStatus(activeOrder.id, newStatus);
                    setActiveOrder({ ...activeOrder, status: newStatus });
                    toast.success(`تم تحديث حالة الطلب إلى ${newStatus}`);
                  }}
                  className="border border-ink bg-background px-3 py-1.5 text-xs font-bold outline-none"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setActiveOrder(null)}
                className="border border-ink bg-ink px-6 py-2 text-xs font-bold text-cream hover:bg-brass hover:text-ink transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

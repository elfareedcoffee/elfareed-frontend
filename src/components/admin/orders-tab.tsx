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
  Copy,
  Check,
  FileText,
  Truck,
  User,
  Coffee,
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
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  const copyCourierDetails = (order: Order) => {
    const itemsList = order.items
      .map((i) => `  • ${i.name} (${i.weight}) × ${i.qty} = ${i.price * i.qty} ج.م`)
      .join("\n");

    const notesText = order.customer.notes ? `\n📝 ملاحظات: ${order.customer.notes}` : "";

    const text = `📦 *طلب توصيل - محمصة بن فريد*
━━━━━━━━━━━━━━━━━━
🔢 رقم الطلب: #${order.orderNumber}
👤 العميل: ${order.customer.name}
📱 الهاتف: ${order.customer.phone}
📍 العنوان: ${order.customer.address} (${order.customer.area})${notesText}
━━━━━━━━━━━━━━━━━━
☕ *المنتجات:*
${itemsList}
━━━━━━━━━━━━━━━━━━
🚚 التوصيل: ${order.shipping} ج.م
💵 *المطلوب تحصيله (دفع عند الاستلام): ${order.total} ج.م*`;

    navigator.clipboard.writeText(text);
    setCopiedId(order.id);
    toast.success("تم نسخ بيانات الطلب للدليفري بنجاح!");
    setTimeout(() => setCopiedId(null), 3000);
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const orderNum = (o.orderNumber || "").toLowerCase();
      const customerName = (o.customer?.name || "").toLowerCase();
      const customerPhone = o.customer?.phone || "";
      const customerArea = (o.customer?.area || "").toLowerCase();
      const customerNotes = (o.customer?.notes || "").toLowerCase();
      const query = searchQuery.toLowerCase();

      const matchesSearch =
        orderNum.includes(query) ||
        customerName.includes(query) ||
        customerPhone.includes(searchQuery) ||
        customerArea.includes(query) ||
        customerNotes.includes(query);

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border border-ink/20 bg-cream/90 p-4 rounded-lg shadow-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث برقم الطلب، اسم العميل، الهاتف، أو الملاحظات..."
            className="w-full border border-ink/25 bg-background py-2 pr-9 pl-4 text-xs sm:text-sm rounded outline-none focus:border-brass focus:ring-1 focus:ring-brass"
          />
        </div>

        {/* Filter Pills & Refresh Button */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {["الكل", ...STATUS_OPTIONS].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 text-xs font-semibold rounded border transition-colors cursor-pointer ${
                selectedStatus === st
                  ? "border-ink bg-ink text-cream shadow-xs"
                  : "border-ink/20 bg-background text-muted-foreground hover:bg-kraft/60"
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
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded border border-ink/30 bg-background hover:bg-ink hover:text-cream transition-colors cursor-pointer disabled:opacity-50"
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
          <div className="border border-ink/20 bg-cream p-8 text-center text-xs text-muted-foreground rounded-lg">
            لا توجد طلبات مطابقة للبحث أو الفلتر المختار.
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="border border-ink/20 bg-cream p-4 rounded-lg shadow-xs space-y-3 transition-colors"
            >
              {/* Card Header: Order #, Status, Date */}
              <div className="flex items-center justify-between border-b border-ink/10 pb-2.5">
                <div>
                  <span className="font-mono font-bold text-sm text-foreground">
                    #{order.orderNumber}
                  </span>
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
                  className={`rounded border px-2.5 py-1 text-xs font-bold outline-none cursor-pointer ${getStatusBadge(
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
                  className="font-mono text-xs font-bold text-brass bg-background px-2.5 py-1 rounded border border-ink/20 flex items-center gap-1 hover:bg-brass hover:text-ink transition-colors"
                >
                  <Phone className="h-3 w-3" />
                  {order.customer.phone}
                </a>
              </div>

              {/* Customer Notes in Mobile Card (if added) */}
              {order.customer.notes && (
                <div className="bg-amber-500/10 border border-amber-500/30 p-2.5 rounded text-xs text-amber-950">
                  <span className="font-bold flex items-center gap-1 text-amber-900 mb-0.5">
                    <MessageSquare className="h-3.5 w-3.5 text-amber-700 shrink-0" />
                    ملاحظات العميل:
                  </span>
                  <p className="font-medium">{order.customer.notes}</p>
                </div>
              )}

              {/* Items summary */}
              <div className="bg-background/90 p-2.5 rounded border border-ink/10 text-xs">
                <p className="text-muted-foreground font-medium leading-relaxed">
                  {order.items.map((i) => `${i.name} (${i.weight} × ${i.qty})`).join(" + ")}
                </p>
              </div>

              {/* Card Footer: Total & Actions */}
              <div className="flex items-center justify-between border-t border-ink/10 pt-2.5">
                <div className="text-xs">
                  <span className="text-muted-foreground">الإجمالي: </span>
                  <span className="font-bold font-mono text-sm text-foreground">
                    {order.total} ج.م
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyCourierDetails(order)}
                    className="p-1.5 border border-ink/25 bg-background hover:bg-kraft rounded text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    title="نسخ للدليفري"
                  >
                    {copiedId === order.id ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => setActiveOrder(order)}
                    className="inline-flex items-center gap-1 border border-ink bg-ink px-3 py-1.5 text-xs font-bold text-cream hover:bg-brass hover:text-ink rounded transition-colors cursor-pointer shadow-xs"
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
      <div className="hidden md:block border border-ink/20 bg-cream rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs sm:text-sm">
            <thead className="border-b border-ink/15 bg-background/80 text-muted-foreground text-xs font-semibold">
              <tr>
                <th className="py-3.5 pr-4">رقم الطلب</th>
                <th className="py-3.5">العميل والملاحظات</th>
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
                    <td className="py-3.5 pr-4 font-mono font-bold text-foreground">
                      #{order.orderNumber}
                    </td>
                    <td className="py-3.5">
                      <div className="font-semibold text-foreground">{order.customer.name}</div>
                      {order.customer.notes ? (
                        <div
                          className="mt-0.5 inline-flex items-center gap-1 text-[11px] bg-amber-500/15 text-amber-900 border border-amber-500/30 px-2 py-0.5 rounded font-medium max-w-xs truncate"
                          title={order.customer.notes}
                        >
                          <MessageSquare className="h-3 w-3 shrink-0 text-amber-700" />
                          <span className="truncate">{order.customer.notes}</span>
                        </div>
                      ) : null}
                    </td>
                    <td className="py-3.5 font-mono text-xs" dir="ltr">
                      <a
                        href={`tel:${order.customer.phone}`}
                        className="hover:text-brass underline font-semibold"
                      >
                        {order.customer.phone}
                      </a>
                    </td>
                    <td className="py-3.5 text-muted-foreground text-xs">{order.customer.area}</td>
                    <td className="py-3.5">
                      <span className="font-semibold">
                        {order.items.reduce((s, i) => s + i.qty, 0)} عبوة
                      </span>{" "}
                      <span className="text-xs text-muted-foreground">
                        ({order.items.map((i) => i.name).join("، ")})
                      </span>
                    </td>
                    <td className="py-3.5 font-bold font-mono text-foreground text-sm">
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
                        className={`rounded border px-2.5 py-1 text-xs font-bold outline-none cursor-pointer ${getStatusBadge(
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
                          onClick={() => copyCourierDetails(order)}
                          className="p-1.5 border border-ink/25 bg-background hover:bg-kraft rounded text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                          title="نسخ بيانات الطلب للدليفري"
                        >
                          {copiedId === order.id ? (
                            <Check className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => setActiveOrder(order)}
                          className="p-1.5 border border-ink/30 bg-ink text-cream hover:bg-brass hover:text-ink transition-colors rounded cursor-pointer"
                          title="عرض تفاصيل الطلب والملاحظات"
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

      {/* Redesigned Luxury Order Details Window (Modal Dialog) */}
      {activeOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-ink/70 backdrop-blur-xs animate-fade-in-up"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveOrder(null);
          }}
        >
          <div className="relative w-full max-w-3xl rounded-xl border border-ink/30 bg-background p-5 sm:p-7 shadow-2xl max-h-[92vh] overflow-y-auto space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-ink/15 pb-4">
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h3 className="font-display text-2xl sm:text-3xl text-foreground font-bold">
                    طلب #{activeOrder.orderNumber}
                  </h3>
                  <span
                    className={`rounded-full border px-3 py-0.5 text-xs font-bold ${getStatusBadge(
                      activeOrder.status,
                    )}`}
                  >
                    {activeOrder.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-brass" />
                  <span>
                    تاريخ الطلب:{" "}
                    {new Date(activeOrder.createdAt).toLocaleDateString("ar-EG", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </p>
              </div>

              <button
                onClick={() => setActiveOrder(null)}
                className="p-2 hover:bg-kraft/80 border border-ink/20 rounded-full transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
                title="إغلاق"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Customer Notes Card (Highlighted Prominently) */}
            <div
              className={`rounded-lg p-4 border transition-all ${
                activeOrder.customer.notes
                  ? "bg-amber-500/10 border-amber-500/40 shadow-xs"
                  : "bg-cream/40 border-ink/10"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <MessageSquare
                    className={`h-4 w-4 ${
                      activeOrder.customer.notes ? "text-amber-700" : "text-muted-foreground"
                    }`}
                  />
                  <span>ملاحظات العميل والتوصيل / الطحن:</span>
                </div>
                {activeOrder.customer.notes && (
                  <span className="text-[11px] bg-amber-500/20 text-amber-900 border border-amber-500/30 px-2 py-0.5 rounded font-bold">
                    ملاحظة خاصة مسجلة
                  </span>
                )}
              </div>

              {activeOrder.customer.notes ? (
                <div className="mt-2.5 rounded-md bg-background/90 p-3.5 border border-amber-500/30 text-sm font-medium text-foreground leading-relaxed shadow-xs">
                  {activeOrder.customer.notes}
                </div>
              ) : (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  لا توجد ملاحظات إضافية مسجلة من العميل مع هذا الطلب.
                </p>
              )}
            </div>

            {/* Two Columns Grid: Customer Details & Contact Actions */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Customer Info Card */}
              <div className="rounded-lg border border-ink/15 bg-cream/50 p-4 space-y-3">
                <div className="flex items-center gap-2 border-b border-ink/10 pb-2 text-xs font-bold text-foreground uppercase">
                  <User className="h-4 w-4 text-brass" />
                  <span>بيانات العميل والعنوان</span>
                </div>

                <div className="space-y-2 text-xs sm:text-sm">
                  <div>
                    <span className="text-muted-foreground text-xs block">اسم العميل:</span>
                    <span className="font-bold text-foreground text-base">
                      {activeOrder.customer.name}
                    </span>
                  </div>

                  <div>
                    <span className="text-muted-foreground text-xs block">رقم الهاتف:</span>
                    <span className="font-mono font-bold text-foreground" dir="ltr">
                      {activeOrder.customer.phone}
                    </span>
                  </div>

                  <div>
                    <span className="text-muted-foreground text-xs block">العنوان بالتفصيل:</span>
                    <p className="font-medium text-foreground flex items-start gap-1.5 mt-0.5">
                      <MapPin className="h-4 w-4 text-brass shrink-0 mt-0.5" />
                      <span>
                        {activeOrder.customer.address} ({activeOrder.customer.area})
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Communication Actions Card */}
              <div className="rounded-lg border border-ink/15 bg-cream/50 p-4 flex flex-col justify-between space-y-3">
                <div className="flex items-center gap-2 border-b border-ink/10 pb-2 text-xs font-bold text-foreground uppercase">
                  <Phone className="h-4 w-4 text-brass" />
                  <span>التواصل السريع وتجهيز الشحن</span>
                </div>

                <div className="space-y-2.5">
                  <a
                    href={`https://wa.me/2${activeOrder.customer.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                      `أهلاً بك أستاذ ${activeOrder.customer.name}، بخصوص طلبك من محمصة بن فريد رقم (${activeOrder.orderNumber})...`,
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 w-full border border-emerald-600 bg-emerald-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white transition-colors hover:bg-emerald-700 rounded-md shadow-xs"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>مراسلة واتساب فورية</span>
                  </a>

                  <a
                    href={`tel:${activeOrder.customer.phone}`}
                    className="flex items-center justify-center gap-2 w-full border border-ink bg-ink px-4 py-2.5 text-xs sm:text-sm font-bold text-cream transition-colors hover:bg-brass hover:text-ink rounded-md shadow-xs"
                  >
                    <Phone className="h-4 w-4" />
                    <span>اتصال بالعميل ({activeOrder.customer.phone})</span>
                  </a>

                  <button
                    onClick={() => copyCourierDetails(activeOrder)}
                    className="flex items-center justify-center gap-2 w-full border border-ink/30 bg-background hover:bg-kraft px-4 py-2 text-xs font-bold text-foreground rounded-md transition-colors cursor-pointer"
                  >
                    {copiedId === activeOrder.id ? (
                      <>
                        <Check className="h-4 w-4 text-emerald-600" />
                        <span className="text-emerald-700">تم نسخ بيانات التوصيل!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        <span>نسخ بيانات الطلب لمندوب الدليفري</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Ordered Products Table */}
            <div className="rounded-lg border border-ink/15 bg-cream/30 overflow-hidden">
              <div className="bg-background/80 px-4 py-2.5 border-b border-ink/10 flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-2">
                  <Coffee className="h-4 w-4 text-brass" />
                  المنتجات المطلوبة ({activeOrder.items.reduce((s, i) => s + i.qty, 0)} عبوة)
                </span>
              </div>

              <div className="divide-y divide-ink/10">
                {activeOrder.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3.5 text-xs sm:text-sm hover:bg-background/60 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-brass/20 text-brass flex items-center justify-center font-bold font-display text-sm">
                        ☕
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-sm">{item.name}</p>
                        <span className="inline-block mt-0.5 bg-kraft/70 border border-ink/20 px-2 py-0.5 text-[11px] font-semibold rounded">
                          الوزن: {item.weight}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-left">
                      <span className="text-muted-foreground font-mono text-xs">
                        {item.qty} × {item.price} ج.م
                      </span>
                      <span className="font-bold font-mono text-foreground text-sm sm:text-base">
                        {item.price * item.qty} ج.م
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary Box */}
            <div className="rounded-lg border border-ink/20 bg-cream/70 p-4 space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>المجموع الفرعي للمنتجات:</span>
                <span className="font-mono font-semibold">{activeOrder.subtotal} ج.م</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>مصاريف التوصيل:</span>
                <span className="font-mono font-semibold">{activeOrder.shipping} ج.م</span>
              </div>
              <div className="flex justify-between border-t border-ink/20 pt-3 text-base sm:text-lg font-bold text-foreground">
                <span>الإجمالي المطلوب تحصيله عند الاستلام:</span>
                <span className="font-mono text-brass font-extrabold text-xl sm:text-2xl">
                  {activeOrder.total} ج.م
                </span>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink/15 pt-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-muted-foreground">تحديث الحالة:</span>
                <select
                  value={activeOrder.status}
                  onChange={(e) => {
                    const newStatus = e.target.value as OrderStatus;
                    updateOrderStatus(activeOrder.id, newStatus);
                    setActiveOrder({ ...activeOrder, status: newStatus });
                    toast.success(`تم تحديث حالة الطلب إلى ${newStatus}`);
                  }}
                  className="rounded border border-ink/30 bg-background px-3 py-1.5 text-xs font-bold outline-none cursor-pointer focus:border-brass"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (confirm(`هل أنت متأكد من حذف الطلب ${activeOrder.orderNumber}؟`)) {
                      deleteOrder(activeOrder.id);
                      setActiveOrder(null);
                      toast.info(`تم حذف الطلب ${activeOrder.orderNumber}`);
                    }
                  }}
                  className="px-3 py-2 text-xs font-bold border border-red-300 text-red-600 hover:bg-red-600 hover:text-white rounded transition-colors cursor-pointer"
                >
                  حذف الطلب
                </button>
                <button
                  onClick={() => setActiveOrder(null)}
                  className="border border-ink bg-ink px-6 py-2 text-xs font-bold text-cream hover:bg-brass hover:text-ink rounded transition-colors cursor-pointer shadow-xs"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useMemo, useEffect, Fragment } from "react";
import { createPortal } from "react-dom";
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
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useAdminStore, type Order, type OrderStatus } from "@/lib/admin-store";
import { formatWhatsAppPhone } from "@/lib/utils";
import { toast } from "sonner";

const STATUS_OPTIONS: OrderStatus[] = ["جديد", "قيد التجهيز", "تم التوصيل", "ملغي"];

export function OrdersTab() {
  const { orders, updateOrderStatus, deleteOrder, fetchAdminData } = useAdminStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("الكل");
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
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

  const toggleExpandOrder = (orderId: string) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
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

  // Lock body scroll when modal is active
  useEffect(() => {
    if (!activeOrder || typeof document === "undefined") return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [activeOrder]);

  // Modal element mounted via Portal with explicit Top-Anchored viewport style
  const modalElement =
    activeOrder && typeof document !== "undefined" ? (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 999999,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          paddingTop: "24px",
          paddingBottom: "24px",
          paddingLeft: "16px",
          paddingRight: "16px",
          overflowY: "auto",
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) setActiveOrder(null);
        }}
      >
        <div className="relative w-full max-w-4xl rounded-xl border border-ink/30 bg-background p-4 sm:p-5 shadow-2xl overflow-hidden flex flex-col my-auto sm:my-0">
          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-ink/15 pb-3 shrink-0">
            <div className="flex items-center gap-3">
              <h3 className="font-display text-xl sm:text-2xl text-foreground font-bold">
                طلب #{activeOrder.orderNumber}
              </h3>
              <span
                className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${getStatusBadge(
                  activeOrder.status,
                )}`}
              >
                {activeOrder.status}
              </span>
              <span className="hidden sm:inline-block text-xs text-muted-foreground">
                (
                {new Date(activeOrder.createdAt).toLocaleDateString("ar-EG", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                )
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => copyCourierDetails(activeOrder)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded border border-ink/25 bg-cream hover:bg-kraft text-foreground transition-colors cursor-pointer"
                title="نسخ بيانات الطلب للدليفري"
              >
                {copiedId === activeOrder.id ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-emerald-700">تم النسخ!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-brass" />
                    <span>نسخ للدليفري</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setActiveOrder(null)}
                className="p-1.5 hover:bg-kraft/80 border border-ink/20 rounded-full transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
                title="إغلاق"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Compact 2-Column Content */}
          <div className="grid gap-3.5 md:grid-cols-2 pt-3">
            {/* Left Column: Customer Details, Notes, & Quick Contacts */}
            <div className="space-y-3 flex flex-col justify-between">
              {/* Customer Info Card */}
              <div className="rounded-lg border border-ink/15 bg-cream/40 p-3 space-y-2 text-xs sm:text-sm">
                <div className="flex items-center justify-between border-b border-ink/10 pb-1.5">
                  <span className="font-bold text-foreground flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-brass" />
                    بيانات العميل
                  </span>
                  <span className="font-mono text-xs font-semibold text-brass" dir="ltr">
                    {activeOrder.customer.phone}
                  </span>
                </div>

                <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 text-xs">
                  <span className="text-muted-foreground">الاسم:</span>
                  <span className="font-bold text-foreground">{activeOrder.customer.name}</span>

                  <span className="text-muted-foreground">العنوان:</span>
                  <span className="font-medium text-foreground flex items-start gap-1">
                    <MapPin className="h-3 w-3 text-brass shrink-0 mt-0.5" />
                    {activeOrder.customer.address} ({activeOrder.customer.area})
                  </span>
                </div>
              </div>

              {/* Customer Notes (Highlighted Callout Box) */}
              <div
                className={`rounded-lg p-3 border text-xs transition-all ${
                  activeOrder.customer.notes
                    ? "bg-amber-500/10 border-amber-500/40 text-amber-950 shadow-xs"
                    : "bg-cream/30 border-ink/10 text-muted-foreground"
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1.5">
                    <MessageSquare
                      className={`h-3.5 w-3.5 ${
                        activeOrder.customer.notes ? "text-amber-700" : "text-muted-foreground"
                      }`}
                    />
                    ملاحظات العميل والتوصيل / الطحن:
                  </span>
                  {activeOrder.customer.notes && (
                    <span className="text-[10px] bg-amber-500/20 text-amber-900 border border-amber-500/30 px-1.5 py-0.2 rounded font-bold">
                      مسجلة
                    </span>
                  )}
                </div>

                {activeOrder.customer.notes ? (
                  <p className="mt-1.5 font-medium leading-relaxed bg-background/90 p-2 rounded border border-amber-500/30 text-foreground">
                    {activeOrder.customer.notes}
                  </p>
                ) : (
                  <p className="mt-1 text-[11px]">لا توجد ملاحظات مسجلة مع هذا الطلب.</p>
                )}
              </div>

              {/* Quick Actions Card */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <a
                  href={`https://wa.me/${formatWhatsAppPhone(activeOrder.customer.phone)}?text=${encodeURIComponent(
                    `أهلاً بك أستاذ ${activeOrder.customer.name}، بخصوص طلبك من محمصة بن فريد رقم (${activeOrder.orderNumber})...`,
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 border border-emerald-600 bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-emerald-700 rounded-md shadow-xs"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>مراسلة واتساب</span>
                </a>

                <a
                  href={`tel:${activeOrder.customer.phone}`}
                  className="flex items-center justify-center gap-1.5 border border-ink bg-ink px-3 py-2 text-xs font-bold text-cream transition-colors hover:bg-brass hover:text-ink rounded-md shadow-xs"
                >
                  <Phone className="h-3.5 w-3.5" />
                  <span>اتصال بالعميل</span>
                </a>
              </div>
            </div>

            {/* Right Column: Ordered Items & Financial Summary */}
            <div className="space-y-3 flex flex-col justify-between">
              {/* Items Table */}
              <div className="rounded-lg border border-ink/15 bg-cream/30 overflow-hidden">
                <div className="bg-background/80 px-3 py-1.5 border-b border-ink/10 flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center gap-1.5 text-foreground">
                    <Coffee className="h-3.5 w-3.5 text-brass" />
                    المنتجات المطلوبة ({activeOrder.items.reduce((s, i) => s + i.qty, 0)} عبوة)
                  </span>
                </div>

                <div className="divide-y divide-ink/10 max-h-36 overflow-y-auto">
                  {activeOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between px-3 py-2 text-xs hover:bg-background/60 transition-colors"
                    >
                      <div>
                        <span className="font-bold text-foreground">{item.name}</span>{" "}
                        <span className="inline-block bg-kraft/80 border border-ink/20 px-1.5 py-0.2 text-[10px] font-semibold rounded mr-1">
                          {item.weight}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 font-mono">
                        <span className="text-muted-foreground text-[11px]">
                          {item.qty} × {item.price}
                        </span>
                        <span className="font-bold text-foreground text-xs">
                          {item.price * item.qty} ج.م
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Summary */}
              <div className="rounded-lg border border-ink/20 bg-cream/60 p-2.5 space-y-1 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>المجموع الفرعي:</span>
                  <span className="font-mono font-semibold">{activeOrder.subtotal} ج.م</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>مصاريف التوصيل:</span>
                  <span className="font-mono font-semibold">{activeOrder.shipping} ج.م</span>
                </div>
                <div className="flex justify-between border-t border-ink/15 pt-1.5 text-sm font-bold text-foreground">
                  <span>المطلوب عند الاستلام (COD):</span>
                  <span className="font-mono text-brass font-extrabold text-base sm:text-lg">
                    {activeOrder.total} ج.م
                  </span>
                </div>
              </div>

              {/* Status Switcher & Actions */}
              <div className="flex items-center justify-between gap-2 border-t border-ink/15 pt-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-muted-foreground">الحالة:</span>
                  <select
                    value={activeOrder.status}
                    onChange={(e) => {
                      const newStatus = e.target.value as OrderStatus;
                      updateOrderStatus(activeOrder.id, newStatus);
                      setActiveOrder({ ...activeOrder, status: newStatus });
                      toast.success(`تم تحديث حالة الطلب إلى ${newStatus}`);
                    }}
                    className="rounded border border-ink/30 bg-background px-2.5 py-1 text-xs font-bold outline-none cursor-pointer focus:border-brass"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      if (confirm(`هل أنت متأكد من حذف الطلب ${activeOrder.orderNumber}؟`)) {
                        deleteOrder(activeOrder.id);
                        setActiveOrder(null);
                        toast.info(`تم حذف الطلب ${activeOrder.orderNumber}`);
                      }
                    }}
                    className="px-2.5 py-1 text-xs font-bold border border-red-300 text-red-600 hover:bg-red-600 hover:text-white rounded transition-colors cursor-pointer"
                  >
                    حذف
                  </button>
                  <button
                    onClick={() => setActiveOrder(null)}
                    className="border border-ink bg-ink px-4 py-1 text-xs font-bold text-cream hover:bg-brass hover:text-ink rounded transition-colors cursor-pointer shadow-xs"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ) : null;

  return (
    <div className="space-y-6">
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
          filteredOrders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            return (
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
                      onClick={() => toggleExpandOrder(order.id)}
                      className="inline-flex items-center gap-1 border border-ink bg-ink px-3 py-1.5 text-xs font-bold text-cream hover:bg-brass hover:text-ink rounded transition-colors cursor-pointer shadow-xs"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="h-3.5 w-3.5" />
                          إخفاء
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3.5 w-3.5" />
                          التفاصيل
                        </>
                      )}
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

                {/* Inline Expanded Mobile View */}
                {isExpanded && (
                  <div className="mt-3 border-t border-ink/15 pt-3 space-y-3 bg-background/80 p-3 rounded">
                    <div>
                      <span className="text-xs font-bold block mb-1">العنوان بالتفصيل:</span>
                      <p className="text-xs text-muted-foreground">{order.customer.address}</p>
                    </div>

                    <div className="flex gap-2">
                      <a
                        href={`https://wa.me/${formatWhatsAppPhone(order.customer.phone)}?text=${encodeURIComponent(
                          `أهلاً بك أستاذ ${order.customer.name}، بخصوص طلبك من محمصة بن فريد رقم (${order.orderNumber})...`,
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-bold bg-emerald-600 text-white rounded"
                      >
                        <MessageSquare className="h-3 w-3" />
                        واتساب
                      </a>
                      <a
                        href={`tel:${order.customer.phone}`}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-bold bg-ink text-cream rounded"
                      >
                        <Phone className="h-3 w-3" />
                        اتصال
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })
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
                filteredOrders.map((order) => {
                  const isExpanded = expandedOrderId === order.id;
                  return (
                    <Fragment key={order.id}>
                      <tr
                        onClick={() => toggleExpandOrder(order.id)}
                        className={`hover:bg-kraft/40 transition-colors cursor-pointer ${
                          isExpanded ? "bg-kraft/30" : ""
                        }`}
                      >
                        <td className="py-3.5 pr-4 font-mono font-bold text-foreground">
                          <div className="flex items-center gap-1.5">
                            {isExpanded ? (
                              <ChevronUp className="h-3.5 w-3.5 text-brass" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                            )}
                            <span>#{order.orderNumber}</span>
                          </div>
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
                            onClick={(e) => e.stopPropagation()}
                            className="hover:text-brass underline font-semibold"
                          >
                            {order.customer.phone}
                          </a>
                        </td>
                        <td className="py-3.5 text-muted-foreground text-xs">
                          {order.customer.area}
                        </td>
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
                        <td className="py-3.5" onClick={(e) => e.stopPropagation()}>
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
                        <td className="py-3.5 pl-4 text-center" onClick={(e) => e.stopPropagation()}>
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
                              onClick={() => toggleExpandOrder(order.id)}
                              className={`p-1.5 border transition-colors rounded cursor-pointer ${
                                isExpanded
                                  ? "border-brass bg-brass text-ink font-bold"
                                  : "border-ink/30 bg-ink text-cream hover:bg-brass hover:text-ink"
                              }`}
                              title={isExpanded ? "إخفاء التفاصيل" : "عرض التفاصيل في الجدول"}
                            >
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
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

                      {/* Inline Expanded Table Row */}
                      {isExpanded && (
                        <tr className="bg-kraft/20 border-b-2 border-brass/40">
                          <td colSpan={9} className="p-4">
                            <div className="grid gap-4 md:grid-cols-2 bg-background p-4 rounded-lg border border-ink/15 shadow-xs">
                              {/* Customer info & Notes */}
                              <div className="space-y-2.5">
                                <div className="flex items-center justify-between border-b border-ink/10 pb-1.5">
                                  <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                                    <User className="h-3.5 w-3.5 text-brass" />
                                    بيانات العميل والتوصيل
                                  </span>
                                  <span className="font-mono text-xs font-semibold text-brass" dir="ltr">
                                    {order.customer.phone}
                                  </span>
                                </div>

                                <div className="text-xs space-y-1">
                                  <p>
                                    <span className="text-muted-foreground">الاسم: </span>
                                    <span className="font-bold">{order.customer.name}</span>
                                  </p>
                                  <p className="flex items-start gap-1">
                                    <MapPin className="h-3 w-3 text-brass shrink-0 mt-0.5" />
                                    <span>
                                      {order.customer.address} ({order.customer.area})
                                    </span>
                                  </p>
                                </div>

                                {/* Notes in Expanded Row */}
                                {order.customer.notes ? (
                                  <div className="bg-amber-500/10 border border-amber-500/30 p-2.5 rounded text-xs">
                                    <span className="font-bold text-amber-900 block mb-0.5 flex items-center gap-1">
                                      <MessageSquare className="h-3 w-3 text-amber-700" />
                                      ملاحظات العميل:
                                    </span>
                                    <p className="text-foreground font-medium">{order.customer.notes}</p>
                                  </div>
                                ) : (
                                  <p className="text-[11px] text-muted-foreground">لا توجد ملاحظات مسجلة مع هذا الطلب.</p>
                                )}

                                {/* Quick WhatsApp & Call buttons */}
                                <div className="flex gap-2 pt-1">
                                  <a
                                    href={`https://wa.me/${formatWhatsAppPhone(order.customer.phone)}?text=${encodeURIComponent(
                                      `أهلاً بك أستاذ ${order.customer.name}، بخصوص طلبك من محمصة بن فريد رقم (${order.orderNumber})...`,
                                    )}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-bold bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors shadow-xs"
                                  >
                                    <MessageSquare className="h-3.5 w-3.5" />
                                    <span>مراسلة واتساب</span>
                                  </a>
                                  <a
                                    href={`tel:${order.customer.phone}`}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-bold bg-ink text-cream rounded hover:bg-brass hover:text-ink transition-colors shadow-xs"
                                  >
                                    <Phone className="h-3.5 w-3.5" />
                                    <span>اتصال هاتفي</span>
                                  </a>
                                  <button
                                    onClick={() => copyCourierDetails(order)}
                                    className="flex items-center justify-center gap-1 py-1.5 px-3 text-xs font-bold border border-ink/25 bg-cream hover:bg-kraft rounded transition-colors"
                                    title="نسخ للدليفري"
                                  >
                                    <Copy className="h-3.5 w-3.5 text-brass" />
                                    <span>نسخ للدليفري</span>
                                  </button>
                                </div>
                              </div>

                              {/* Products & Totals */}
                              <div className="space-y-2 flex flex-col justify-between">
                                <div className="border border-ink/10 rounded overflow-hidden">
                                  <div className="bg-cream/60 px-3 py-1 text-xs font-bold border-b border-ink/10">
                                    المنتجات المطلوبة
                                  </div>
                                  <div className="divide-y divide-ink/10 text-xs">
                                    {order.items.map((item) => (
                                      <div key={item.id} className="p-2 flex justify-between items-center">
                                        <div>
                                          <span className="font-bold">{item.name}</span>{" "}
                                          <span className="bg-kraft px-1.5 py-0.2 text-[10px] rounded mr-1">
                                            {item.weight}
                                          </span>
                                        </div>
                                        <div className="font-mono">
                                          {item.qty} × {item.price} ={" "}
                                          <span className="font-bold">{item.price * item.qty} ج.م</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div className="bg-cream/40 p-2.5 rounded border border-ink/10 text-xs space-y-1">
                                  <div className="flex justify-between text-muted-foreground">
                                    <span>المجموع الفرعي:</span>
                                    <span className="font-mono">{order.subtotal} ج.م</span>
                                  </div>
                                  <div className="flex justify-between text-muted-foreground">
                                    <span>التوصيل:</span>
                                    <span className="font-mono">{order.shipping} ج.م</span>
                                  </div>
                                  <div className="flex justify-between font-bold text-sm border-t border-ink/10 pt-1 text-foreground">
                                    <span>الإجمالي للدفع عند الاستلام:</span>
                                    <span className="font-mono text-brass font-extrabold text-base">
                                      {order.total} ج.م
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Render Modal via React Portal directly into document.body */}
      {modalElement && createPortal(modalElement, document.body)}
    </div>
  );
}

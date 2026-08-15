import { useState } from "react";
import { Settings, Save, RotateCcw, Truck, Phone, Store } from "lucide-react";
import { useAdminStore } from "@/lib/admin-store";
import { toast } from "sonner";

export function SettingsTab() {
  const { settings, updateSettings, resetToDefaults } = useAdminStore();
  const [deliveryFee, setDeliveryFee] = useState(String(settings.deliveryFee));
  const [salesPhone, setSalesPhone] = useState(settings.salesPhone);
  const [wholesale1, setWholesale1] = useState(settings.wholesalePhones[0] || "01020073246");
  const [wholesale2, setWholesale2] = useState(settings.wholesalePhones[1] || "01005642565");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      deliveryFee: Number(deliveryFee) || 40,
      salesPhone: salesPhone.trim(),
      wholesalePhones: [wholesale1.trim(), wholesale2.trim()],
    });
    toast.success("تم حفظ إعدادات المتجر بنجاح");
  };

  return (
    <div className="max-w-3xl space-y-6 animate-fade-in-up">
      <div className="border border-ink/30 bg-cream p-6 shadow-sm">
        <div className="flex items-center gap-2 border-b border-ink/20 pb-4">
          <Settings className="h-5 w-5 text-brass" />
          <h3 className="font-display text-2xl">إعدادات المتجر والتوصيل</h3>
        </div>

        <form onSubmit={handleSave} className="mt-6 space-y-6 text-xs sm:text-sm">
          {/* Store Open/Close */}
          <div className="flex items-center justify-between border border-ink/20 bg-background p-4">
            <div className="flex items-center gap-3">
              <Store className="h-5 w-5 text-brass" />
              <div>
                <p className="font-bold">حالة استقبال الطلبات</p>
                <p className="text-xs text-muted-foreground">
                  عند إيقافها يظهر للعملاء تنبيه بأن المتجر مغلق مؤقتاً
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                const next = !settings.isOpen;
                updateSettings({ isOpen: next });
                toast.info(`تم ${next ? "فتح" : "إغلاق"} استقبال الطلبات`);
              }}
              className={`px-4 py-2 font-bold border transition-colors cursor-pointer ${
                settings.isOpen
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : "border-red-600 bg-red-600 text-white"
              }`}
            >
              {settings.isOpen ? "مفتوح الآن ✓" : "مغلق مؤقتاً ✕"}
            </button>
          </div>

          {/* Delivery Fee */}
          <div className="border border-ink/20 bg-background p-4">
            <div className="flex items-center gap-2 font-bold mb-2">
              <Truck className="h-4 w-4 text-brass" />
              <label htmlFor="deliveryFee">سعر توصيل الطلبات داخل القاهرة (ج.م)</label>
            </div>
            <div className="flex items-center gap-2 max-w-xs">
              <input
                id="deliveryFee"
                type="number"
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(e.target.value)}
                className="w-full border border-ink/30 bg-cream px-3 py-2 font-mono text-base font-bold outline-none focus:border-brass"
              />
              <span className="font-bold">ج.م</span>
            </div>
          </div>

          {/* Contact Numbers */}
          <div className="border border-ink/20 bg-background p-4 space-y-4">
            <div className="flex items-center gap-2 font-bold">
              <Phone className="h-4 w-4 text-brass" />
              <label>أرقام التواصل المعروضة في المتجر</label>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  رقم الطلبات والقطاعي
                </label>
                <input
                  type="tel"
                  dir="ltr"
                  value={salesPhone}
                  onChange={(e) => setSalesPhone(e.target.value)}
                  className="w-full border border-ink/30 bg-cream px-3 py-2 font-mono outline-none focus:border-brass"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">رقم الجملة (١)</label>
                <input
                  type="tel"
                  dir="ltr"
                  value={wholesale1}
                  onChange={(e) => setWholesale1(e.target.value)}
                  className="w-full border border-ink/30 bg-cream px-3 py-2 font-mono outline-none focus:border-brass"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">رقم الجملة (٢)</label>
                <input
                  type="tel"
                  dir="ltr"
                  value={wholesale2}
                  onChange={(e) => setWholesale2(e.target.value)}
                  className="w-full border border-ink/30 bg-cream px-3 py-2 font-mono outline-none focus:border-brass"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-ink/20 pt-4">
            <button
              type="submit"
              className="inline-flex items-center gap-2 border border-ink bg-ink px-6 py-3 text-xs sm:text-sm font-bold text-cream hover:bg-brass hover:text-ink transition-colors cursor-pointer"
            >
              <Save className="h-4 w-4" />
              حفظ جميع الإعدادات
            </button>

            <button
              type="button"
              onClick={() => {
                if (confirm("هل ترغب في استعادة المنتجات والطلبات والإعدادات الافتراضية؟")) {
                  resetToDefaults();
                  setDeliveryFee("40");
                  setSalesPhone("01110583020");
                  setWholesale1("01020073246");
                  setWholesale2("01005642565");
                  toast.success("تمت استعادة البيانات الافتراضية بنجاح");
                }
              }}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-red-700 underline cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              استعادة البيانات التجريبية
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

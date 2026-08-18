import { useState, useRef } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Check,
  Upload,
  Eye,
  EyeOff,
  Sparkles,
  X,
} from "lucide-react";
import { useAdminStore, type AdminProduct } from "@/lib/admin-store";
import { toast } from "sonner";

export function ProductsTab() {
  const {
    products,
    updatePrice,
    updateProductImage,
    removeProductImage,
    updateProduct,
    addProduct,
    deleteProduct,
    toggleProductAvailability,
  } = useAdminStore();
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [imageUploadTargetId, setImageUploadTargetId] = useState<string | null>(null);

  // New product form state
  const [newProdName, setNewProdName] = useState("");
  const [newProdLatin, setNewProdLatin] = useState("");
  const [newProdNote, setNewProdNote] = useState("");
  const [newProdDesc, setNewProdDesc] = useState("");
  const [newProdMarker, setNewProdMarker] = useState("#C9933B");
  const [newProdImage, setNewProdImage] = useState("");
  const [newProdImageFile, setNewProdImageFile] = useState<File | null>(null);
  const [price250, setPrice250] = useState("150");
  const [price500, setPrice500] = useState("280");
  const [price1000, setPrice1000] = useState("530");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    targetProductId?: string,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("حجم الصورة كبير جداً (الحد الأقصى 5 ميجابايت)");
      return;
    }

    if (targetProductId) {
      updateProductImage(targetProductId, file);
      toast.success("تم تحديث ورفع صورة المنتج بنجاح");
    } else {
      setNewProdImageFile(file);
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setNewProdImage(uploadEvent.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim() || !newProdLatin.trim()) {
      toast.error("يرجى ملء اسم المنتج بالعربي والإنجليزي");
      return;
    }

    setIsSubmitting(true);
    try {
      await addProduct(
        {
          name: newProdName.trim(),
          latin: newProdLatin.trim(),
          note: newProdNote.trim() || "نكهة متوازنة · قوام غني",
          desc: newProdDesc.trim() || "تحميص خاص من حبوب البن المنتقاة بعناية.",
          marker: newProdMarker,
          image: newProdImage || undefined,
          available: true,
          weights: [
            { label: "٢٥٠ جم", grams: 250, price: Number(price250) || 150 },
            { label: "٥٠٠ جم", grams: 500, price: Number(price500) || 280 },
            { label: "١ كيلو", grams: 1000, price: Number(price1000) || 530 },
          ],
        },
        newProdImageFile || undefined,
      );

      toast.success(`تمت إضافة ${newProdName} بنجاح وحفظها في قاعدة البيانات!`);
      setIsAddModalOpen(false);
      // Reset form
      setNewProdName("");
      setNewProdLatin("");
      setNewProdNote("");
      setNewProdDesc("");
      setNewProdImage("");
      setNewProdImageFile(null);
      setPrice250("150");
      setPrice500("280");
      setPrice1000("530");
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ أثناء حفظ المنتج");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Hidden file input for quick product image update */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (imageUploadTargetId) {
            handleImageFileChange(e, imageUploadTargetId);
            setImageUploadTargetId(null);
          }
        }}
      />

      {/* Top Banner & Add Product Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-ink/30 bg-cream p-5 shadow-sm">
        <div>
          <h3 className="font-display text-2xl sm:text-3xl">إدارة المنتجات والأسعار والصور</h3>
          <p className="text-xs text-muted-foreground mt-1">
            عدّل أسعار الأوزان والصور والتفاصيل — التعديلات تظهر فوراً في المتجر للعملاء.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 border border-ink bg-ink px-5 py-3 text-xs sm:text-sm font-bold text-cream transition-all hover:bg-brass hover:text-ink active:scale-95 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          إضافة تحميصة جديدة
        </button>
      </div>

      {/* Products Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
        {products.map((product) => (
          <div
            key={product.id}
            className={`border border-ink/30 bg-cream p-6 shadow-sm flex flex-col justify-between transition-all ${
              product.available === false ? "opacity-60 bg-kraft/30" : ""
            }`}
          >
            <div>
              {/* Product Header & Marker */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  {/* Product Image Thumbnail or Marker Dot */}
                  <div className="relative group shrink-0">
                    {product.image ? (
                      <>
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-16 w-16 rounded border border-ink/30 object-cover shadow-xs"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (
                              confirm(
                                `هل ترغب في إزالة صورة تحميصة ${product.name} والعودة للشكل الافتراضي؟`,
                              )
                            ) {
                              removeProductImage(product.id);
                              toast.info(`تمت إزالة صورة ${product.name}`);
                            }
                          }}
                          className="absolute -top-1.5 -start-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white text-[11px] font-bold shadow-md hover:bg-red-700 transition-transform active:scale-90 z-10 cursor-pointer"
                          title="حذف الصورة"
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <div
                        className="flex h-16 w-16 items-center justify-center rounded border border-ink/30 text-white font-bold"
                        style={{ backgroundColor: product.marker }}
                      >
                        <ImageIcon className="h-6 w-6 opacity-80" />
                      </div>
                    )}
                    <button
                      onClick={() => {
                        setImageUploadTargetId(product.id);
                        fileInputRef.current?.click();
                      }}
                      className="absolute inset-0 flex items-center justify-center bg-ink/70 text-cream text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity rounded cursor-pointer"
                      title="تغيير صورة المنتج"
                    >
                      تغيير
                    </button>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-display text-3xl">{product.name}</h4>
                      <span className="text-xs text-muted-foreground uppercase font-mono">
                        ({product.latin})
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-brass mt-0.5">{product.note}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Toggle availability */}
                  <button
                    onClick={() => {
                      toggleProductAvailability(product.id);
                      toast.info(
                        `تم تغيير حالة ${product.name} إلى ${
                          product.available === false ? "متاح" : "غير متاح"
                        }`,
                      );
                    }}
                    className={`p-1.5 border text-xs rounded transition-colors cursor-pointer ${
                      product.available === false
                        ? "border-amber-500 bg-amber-50 text-amber-800"
                        : "border-emerald-500 bg-emerald-50 text-emerald-800"
                    }`}
                    title={product.available === false ? "تفعيل المنتج" : "إخفاء مؤقت"}
                  >
                    {product.available === false ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>

                  <button
                    onClick={() => setEditingProduct(product)}
                    className="p-1.5 border border-ink/30 bg-background hover:bg-ink hover:text-cream transition-colors rounded cursor-pointer"
                    title="تعديل التفاصيل"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`هل أنت متأكد من حذف تحميصة ${product.name}؟`)) {
                        deleteProduct(product.id);
                        toast.success(`تم حذف تحميصة ${product.name}`);
                      }
                    }}
                    className="p-1.5 border border-red-300 text-red-600 hover:bg-red-600 hover:text-white transition-colors rounded cursor-pointer"
                    title="حذف المنتج"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Description */}
              <p className="mt-3 text-xs leading-6 text-muted-foreground">{product.desc}</p>

              {/* Price Editor per Weight */}
              <div className="mt-5 border-t border-ink/20 pt-4">
                <p className="text-xs font-bold mb-3 flex items-center justify-between">
                  <span>أسعار الأوزان (ج.م):</span>
                  <span className="text-[11px] font-normal text-muted-foreground">
                    عدّل السعر واضغط Enter أو اخرج لحفظ التغيير
                  </span>
                </p>

                <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5">
                  {product.weights.map((w) => (
                    <div
                      key={w.grams}
                      className="border border-ink/20 bg-background p-2 sm:p-2.5 text-center"
                    >
                      <span className="block text-[11px] sm:text-xs text-muted-foreground font-medium">
                        {w.label}
                      </span>
                      <div className="mt-1 flex items-center justify-center gap-1">
                        <input
                          type="number"
                          defaultValue={w.price}
                          onBlur={(e) => {
                            const val = Number(e.target.value);
                            if (val > 0 && val !== w.price) {
                              updatePrice(product.id, w.grams, val);
                              toast.success(
                                `تم تحديث سعر ${product.name} (${w.label}) إلى ${val} ج.م`,
                              );
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              (e.target as HTMLInputElement).blur();
                            }
                          }}
                          className="w-full max-w-[4rem] sm:max-w-[4.5rem] border border-ink/30 bg-cream text-center font-bold font-mono text-xs sm:text-sm py-1 px-1 outline-none focus:border-brass"
                        />
                        <span className="text-[10px] sm:text-xs text-muted-foreground">ج.م</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Image Upload & Remove button in card */}
            <div className="mt-5 flex items-center justify-between border-t border-ink/15 pt-3">
              <span className="text-[11px] text-muted-foreground">
                {product.image ? "صورة مخصصة مرفوعة ✓" : "يستخدم لون التحميصة الافتراضي"}
              </span>
              <div className="flex items-center gap-2.5">
                {product.image && (
                  <button
                    onClick={() => {
                      if (confirm(`هل ترغب في إزالة صورة تحميصة ${product.name}؟`)) {
                        removeProductImage(product.id);
                        toast.info(`تمت إزالة صورة ${product.name}`);
                      }
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-800 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    حذف الصورة
                  </button>
                )}
                <button
                  onClick={() => {
                    setImageUploadTargetId(product.id);
                    fileInputRef.current?.click();
                  }}
                  className="inline-flex items-center gap-1 text-xs font-bold text-brass hover:text-ink cursor-pointer"
                >
                  <Upload className="h-3.5 w-3.5" />
                  {product.image ? "تغيير الصورة" : "رفع صورة"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/60 backdrop-blur-xs animate-fade-in-up">
          <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
            <div className="relative w-full max-w-lg border border-ink bg-cream p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-ink/20 pb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-brass" />
                <h3 className="font-display text-3xl">إضافة تحميصة بن جديدة</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 hover:bg-kraft border border-ink/20 rounded cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="mt-5 space-y-4 text-xs sm:text-sm">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block font-bold mb-1">اسم التحميصة (عربي) *</label>
                  <input
                    type="text"
                    required
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    placeholder="مثال: تحميصة ممتازة، كولومبي..."
                    className="w-full border border-ink/30 bg-background px-3 py-2 outline-none focus:border-brass"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">الاسم بالإنجليزي *</label>
                  <input
                    type="text"
                    required
                    value={newProdLatin}
                    onChange={(e) => setNewProdLatin(e.target.value)}
                    placeholder="مثال: Premium, Colombian..."
                    dir="ltr"
                    className="w-full border border-ink/30 bg-background px-3 py-2 outline-none focus:border-brass"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">إيحاءات النكهة</label>
                <input
                  type="text"
                  value={newProdNote}
                  onChange={(e) => setNewProdNote(e.target.value)}
                  placeholder="مثال: شوكولاتة داكنة · فواكه استوائية · كراميل"
                  className="w-full border border-ink/30 bg-background px-3 py-2 outline-none focus:border-brass"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">وصف المنتج</label>
                <textarea
                  rows={2}
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  placeholder="وصف تفصيلي للتحميصة وطريقة التحضير المقترحة..."
                  className="w-full border border-ink/30 bg-background px-3 py-2 outline-none focus:border-brass"
                />
              </div>

              {/* Color Marker */}
              <div>
                <label className="block font-bold mb-1">لون علامة التحميصة</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={newProdMarker}
                    onChange={(e) => setNewProdMarker(e.target.value)}
                    className="h-9 w-14 border border-ink/30 cursor-pointer bg-background p-1"
                  />
                  <span className="text-xs font-mono text-muted-foreground">{newProdMarker}</span>
                </div>
              </div>

              {/* Image Upload for New Product */}
              <div>
                <label className="block font-bold mb-1">صورة المنتج (اختياري)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageFileChange(e)}
                    className="text-xs file:mr-2 file:py-1.5 file:px-3 file:border file:border-ink file:bg-ink file:text-cream file:cursor-pointer"
                  />
                  {newProdImage && (
                    <div className="relative inline-block shrink-0">
                      <img
                        src={newProdImage}
                        alt="معاينة"
                        className="h-12 w-12 rounded border border-ink object-cover shadow-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setNewProdImage("")}
                        className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-white text-[10px] shadow-sm hover:bg-red-700 cursor-pointer"
                        title="إزالة الصورة"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Initial Prices */}
              <div className="border-t border-ink/20 pt-3">
                <label className="block font-bold mb-2">الأسعار الابتدائية للأوزان (ج.م):</label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="block text-[11px] text-muted-foreground">٢٥٠ جم</span>
                    <input
                      type="number"
                      required
                      value={price250}
                      onChange={(e) => setPrice250(e.target.value)}
                      className="w-full border border-ink/30 bg-background px-2.5 py-1.5 font-mono text-center"
                    />
                  </div>
                  <div>
                    <span className="block text-[11px] text-muted-foreground">٥٠٠ جم</span>
                    <input
                      type="number"
                      required
                      value={price500}
                      onChange={(e) => setPrice500(e.target.value)}
                      className="w-full border border-ink/30 bg-background px-2.5 py-1.5 font-mono text-center"
                    />
                  </div>
                  <div>
                    <span className="block text-[11px] text-muted-foreground">١ كيلو</span>
                    <input
                      type="number"
                      required
                      value={price1000}
                      onChange={(e) => setPrice1000(e.target.value)}
                      className="w-full border border-ink/30 bg-background px-2.5 py-1.5 font-mono text-center"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-ink/20 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="border border-ink/30 bg-background px-4 py-2 text-xs font-semibold hover:bg-kraft"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="border border-ink bg-ink px-6 py-2 text-xs font-bold text-cream hover:bg-brass hover:text-ink transition-colors disabled:opacity-60 cursor-pointer"
                >
                  {isSubmitting ? "جاري الحفظ..." : "حفظ وإضافة للمتجر"}
                </button>
              </div>
            </form>
          </div>
        </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/60 backdrop-blur-xs animate-fade-in-up">
          <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
            <div className="relative w-full max-w-lg border border-ink bg-cream p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-ink/20 pb-4">
              <h3 className="font-display text-3xl">تعديل {editingProduct.name}</h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-1 hover:bg-kraft border border-ink/20 rounded cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateProduct(editingProduct.id, {
                  name: editingProduct.name,
                  latin: editingProduct.latin,
                  note: editingProduct.note,
                  desc: editingProduct.desc,
                });
                toast.success(`تم حفظ بيانات ${editingProduct.name}`);
                setEditingProduct(null);
              }}
              className="mt-5 space-y-4 text-xs sm:text-sm"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block font-bold mb-1">اسم التحميصة (عربي)</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full border border-ink/30 bg-background px-3 py-2 outline-none focus:border-brass"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">الاسم بالإنجليزي</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.latin}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, latin: e.target.value })
                    }
                    dir="ltr"
                    className="w-full border border-ink/30 bg-background px-3 py-2 outline-none focus:border-brass"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">إيحاءات النكهة</label>
                <input
                  type="text"
                  value={editingProduct.note}
                  onChange={(e) => setEditingProduct({ ...editingProduct, note: e.target.value })}
                  className="w-full border border-ink/30 bg-background px-3 py-2 outline-none focus:border-brass"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">الوصف</label>
                <textarea
                  rows={3}
                  value={editingProduct.desc}
                  onChange={(e) => setEditingProduct({ ...editingProduct, desc: e.target.value })}
                  className="w-full border border-ink/30 bg-background px-3 py-2 outline-none focus:border-brass"
                />
              </div>

              {/* Image Manager in Edit Modal */}
              <div>
                <label className="block font-bold mb-1">صورة المنتج</label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        setEditingProduct({
                          ...editingProduct,
                          image: ev.target?.result as string,
                        });
                      };
                      reader.readAsDataURL(file);
                    }}
                    className="text-xs file:mr-2 file:py-1.5 file:px-3 file:border file:border-ink file:bg-ink file:text-cream file:cursor-pointer"
                  />
                  {editingProduct.image && (
                    <div className="flex items-center gap-2">
                      <img
                        src={editingProduct.image}
                        alt="معاينة"
                        className="h-12 w-12 rounded border border-ink object-cover shadow-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setEditingProduct({ ...editingProduct, image: undefined });
                          removeProductImage(editingProduct.id);
                          toast.info(`تم حذف صورة ${editingProduct.name}`);
                        }}
                        className="text-xs font-bold text-red-600 hover:text-red-800 underline cursor-pointer"
                      >
                        حذف الصورة
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-ink/20 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="border border-ink/30 bg-background px-4 py-2 text-xs font-semibold hover:bg-kraft"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="border border-ink bg-ink px-6 py-2 text-xs font-bold text-cream hover:bg-brass hover:text-ink transition-colors cursor-pointer"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
        </div>
      )}
    </div>
  );
}

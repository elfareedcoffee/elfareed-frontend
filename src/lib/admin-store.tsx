import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { products as defaultProducts, type Product, type Weight } from "@/data/products";
import type { CartItem } from "@/lib/cart";

export type OrderStatus = "جديد" | "قيد التجهيز" | "تم التوصيل" | "ملغي";

export type CustomerInfo = {
  name: string;
  phone: string;
  address: string;
  area: string;
  notes?: string;
};

export type Order = {
  id: string;
  orderNumber: string;
  customer: CustomerInfo;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
};

export type AdminProduct = Product & {
  image?: string | undefined;
  available?: boolean | undefined;
};

type StoreSettings = {
  deliveryFee: number;
  isOpen: boolean;
  salesPhone: string;
  wholesalePhones: string[];
};

type AdminStoreContextValue = {
  products: AdminProduct[];
  orders: Order[];
  settings: StoreSettings;
  updatePrice: (productId: string, grams: number, newPrice: number) => Promise<void>;
  updateProductImage: (productId: string, fileOrUrl?: File | string | undefined) => Promise<void>;
  removeProductImage: (productId: string) => Promise<void>;
  updateProduct: (productId: string, updates: Partial<AdminProduct>) => Promise<void>;
  addProduct: (product: Omit<AdminProduct, "id"> & { id?: string }, imageFile?: File) => Promise<AdminProduct | undefined>;
  deleteProduct: (productId: string) => void;
  toggleProductAvailability: (productId: string) => Promise<void>;
  createOrder: (data: any) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  updateSettings: (updates: Partial<StoreSettings>) => void;
  resetToDefaults: () => void;
  analytics: {
    totalRevenue: number;
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    averageOrderValue: number;
    roastSalesBreakdown: { name: string; sales: number; count: number; marker: string }[];
    dailySalesData: { date: string; sales: number; orders: number }[];
  };
};

const AdminStoreContext = createContext<AdminStoreContextValue | null>(null);

const STORAGE_SETTINGS_KEY = "fareed-admin-settings-v1";

const INITIAL_SETTINGS: StoreSettings = {
  deliveryFee: 40,
  isOpen: true,
  salesPhone: "01110583020",
  wholesalePhones: ["01020073246", "01005642565"],
};

const INITIAL_PRODUCTS: AdminProduct[] = defaultProducts.map(p => ({
  id: p.id,
  name: p.name,
  desc: p.desc,
  latin: p.latin,
  note: p.note,
  marker: p.marker,
  weights: p.weights.map(w => ({
    id: w.id,
    label: w.label,
    grams: w.grams,
    price: w.price
  })),
  available: true
}));

function mapOrderStatus(status: string): OrderStatus {
  switch (status) {
    case "PENDING":
    case "CONFIRMED": return "جديد";
    case "PREPARING":
    case "READY_FOR_DELIVERY":
    case "OUT_FOR_DELIVERY": return "قيد التجهيز";
    case "DELIVERED": return "تم التوصيل";
    case "CANCELLED": return "ملغي";
    default: return "جديد";
  }
}

function mapOrderStatusToBackend(status: OrderStatus): string {
  switch (status) {
    case "جديد": return "PENDING";
    case "قيد التجهيز": return "PREPARING";
    case "تم التوصيل": return "DELIVERED";
    case "ملغي": return "CANCELLED";
    default: return "PENDING";
  }
}

function mapBackendOrder(o: any): Order {
  return {
    id: o.id,
    orderNumber: o.order_number,
    customer: {
      name: o.customer_name,
      phone: o.customer_phone,
      address: o.delivery_address,
      area: o.governorate + " - " + o.city,
      notes: o.delivery_notes || "",
    },
    items: o.items.map((i: any) => ({
      id: i.id,
      productId: i.product_variant_id || i.id,
      name: i.product_name_ar,
      weight: i.weight_grams + " جم",
      grams: i.weight_grams,
      price: Number(i.unit_price),
      qty: i.quantity,
    })),
    subtotal: Number(o.subtotal),
    shipping: Number(o.delivery_fee),
    total: Number(o.total),
    status: mapOrderStatus(o.order_status),
    createdAt: o.created_at,
  };
}

function mapBackendProduct(p: any): AdminProduct {
  let name = p.name;
  let desc = p.description || "";
  if (p.translations) {
    const arTranslation = p.translations.find((t: any) => t.language === "ar") || p.translations[0];
    name = arTranslation?.name || "بدون اسم";
    desc = arTranslation?.description || "";
  }
  
  let marker = "var(--roast-medium)";
  let latin = "Medium";
  let note = "كراميل · بندق · توازن";

  if (name?.includes("فاتح")) {
    marker = "var(--roast-light)";
    latin = "Light";
    note = "حمضية · زهور · وضوح";
  } else if (name?.includes("غامق")) {
    marker = "var(--roast-dark)";
    latin = "Dark";
    note = "كاكاو · دخان · قوة";
  } else if (name?.includes("محوج")) {
    marker = "var(--roast-spiced)";
    latin = "Spiced";
    note = "هيل · قرنفل · مستكة";
  }

  try {
    const meta = JSON.parse(desc);
    if (meta && typeof meta === 'object' && meta.desc !== undefined) {
      desc = meta.desc;
      if (meta.latin) latin = meta.latin;
      if (meta.note) note = meta.note;
      if (meta.marker) marker = meta.marker;
    }
  } catch (e) {
    // Ignore, it's just raw text
  }

  return {
    id: p.id,
    name: name || "بدون اسم",
    desc: desc,
    latin,
    note,
    marker: marker,
    weights: p.variants?.map((v: any) => ({
      id: v.id,
      label: v.weight_grams === 1000 ? "١ كيلو" : (v.weight_grams === 500 ? "٥٠٠ جم" : "٢٥٠ جم"),
      grams: v.weight_grams,
      price: Number(v.price)
    })) || [],
    image: p.image_url || undefined,
    available: p.is_active ?? true
  };
}

export function AdminStoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<AdminProduct[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>([]);

  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SETTINGS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      /* ignore */
    }
    return INITIAL_SETTINGS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      /* ignore */
    }
  }, [settings]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const productsRes = await fetch("/api/v1/admin/products/");

        if (productsRes.ok) {
          const data = await productsRes.json();
          if (Array.isArray(data) && data.length > 0) {
             setProducts(data.map(mapBackendProduct));
          }
          
          const ordersRes = await fetch("/api/v1/admin/orders/?size=100");
          if (ordersRes.ok) {
            const ordersData = await ordersRes.json();
            if (ordersData.items) {
               setOrders(ordersData.items.map(mapBackendOrder));
            }
          }
        } else if (productsRes.status === 401 || productsRes.status === 403) {
          const publicRes = await fetch("/api/v1/public/products/");
          if (publicRes.ok) {
            const data = await publicRes.json();
            if (Array.isArray(data) && data.length > 0) {
               setProducts(data.map(mapBackendProduct));
            }
          }
        }
      } catch (e) {
        console.error("Failed to fetch admin store data", e);
      }
    };
    fetchInitialData();
  }, []);

  const updatePrice = async (productId: string, grams: number, newPrice: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        return {
          ...p,
          weights: p.weights.map((w) =>
            w.grams === grams ? { ...w, price: Math.max(1, newPrice) } : w,
          ),
        };
      }),
    );

    try {
      const product = products.find(p => p.id === productId);
      const variant = product?.weights.find(w => w.grams === grams);
      if (variant && variant.id) {
        await fetch(`/api/v1/admin/variants/${variant.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ price: Math.max(1, newPrice) })
        });
      }
    } catch (e) {
      console.error("Failed to update price", e);
    }
  };

  const updateProductImage = async (productId: string, fileOrUrl?: File | string | undefined) => {
    if (fileOrUrl instanceof File) {
      const formData = new FormData();
      formData.append("file", fileOrUrl);
      try {
        const res = await fetch(`/api/v1/admin/products/${productId}/image`, {
          method: "POST",
          body: formData
        });
        if (res.ok) {
          const updated = await res.json();
          setProducts(prev => prev.map(p => p.id === productId ? mapBackendProduct(updated) : p));
        }
      } catch (e) {
        console.error("Failed to upload product image", e);
      }
    } else if (typeof fileOrUrl === "string") {
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, image: fileOrUrl } : p))
      );
    }
  };

  const removeProductImage = async (productId: string) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const updated = { ...p };
        delete updated.image;
        return updated;
      })
    );
    try {
      await fetch(`/api/v1/admin/products/${productId}/image`, { method: "DELETE" });
    } catch (e) {
      console.error("Failed to delete product image", e);
    }
  };

  const updateProduct = async (productId: string, updates: Partial<AdminProduct>) => {
    setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, ...updates } : p)));
    
    try {
      const oldProduct = products.find(p => p.id === productId);
      if (!oldProduct) return;
      const combined = { ...oldProduct, ...updates };
      
      const payload = {
        translations: [{
          language: "ar",
          name: combined.name,
          description: JSON.stringify({
            desc: combined.desc,
            latin: combined.latin,
            note: combined.note,
            marker: combined.marker
          })
        }]
      };
      await fetch(`/api/v1/admin/products/${productId}/translations`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.error("Failed to update product details", e);
    }
  };

  const addProduct = async (
    newProd: Omit<AdminProduct, "id"> & { id?: string },
    imageFile?: File
  ): Promise<AdminProduct | undefined> => {
    const tempId = newProd.id || `roast-${Date.now()}`;
    const productToAdd: AdminProduct = {
      ...newProd,
      id: tempId,
      available: newProd.available ?? true,
      weights:
        newProd.weights && newProd.weights.length > 0
          ? newProd.weights
          : [
              { label: "٢٥٠ جم", grams: 250, price: 150 },
              { label: "٥٠٠ جم", grams: 500, price: 280 },
              { label: "١ كيلو", grams: 1000, price: 530 },
            ],
    };
    
    setProducts((prev) => [...prev, productToAdd]);

    try {
      const categoryId = "b58774a1-eea1-42c9-b91c-f58bca51fc1b"; // Default category
      
      const payload = {
        category_id: categoryId,
        is_active: true,
        translations: [{
          language: "ar",
          name: productToAdd.name,
          description: JSON.stringify({
            desc: productToAdd.desc,
            latin: productToAdd.latin,
            note: productToAdd.note,
            marker: productToAdd.marker
          })
        }],
        variants: productToAdd.weights.map(w => ({
          weight_grams: w.grams,
          grind_type: "TURKISH",
          price: w.price,
          stock_quantity: 100,
          is_active: true
        }))
      };

      const res = await fetch("/api/v1/admin/products/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        let createdProduct = await res.json();
        
        if (imageFile) {
          const imgData = new FormData();
          imgData.append("file", imageFile);
          const imgRes = await fetch(`/api/v1/admin/products/${createdProduct.id}/image`, {
            method: "POST",
            body: imgData
          });
          if (imgRes.ok) {
            createdProduct = await imgRes.json();
          }
        }
        
        const mapped = mapBackendProduct(createdProduct);
        setProducts((prev) => prev.map((p) => p.id === tempId ? mapped : p));
        return mapped;
      }
    } catch (e) {
      console.error("Failed to create product", e);
    }
    return undefined;
  };

  const deleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const toggleProductAvailability = async (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const isActive = !product.available;
    try {
      const endpoint = isActive ? "activate" : "deactivate";
      await fetch(`/api/v1/admin/products/${productId}/${endpoint}`, { method: "PATCH" });
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, available: isActive } : p)),
      );
    } catch (e) {
      console.error(e);
    }
  };

  const createOrder = (data: any): Order => {
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: `FC-${Math.floor(1000 + Math.random() * 9000)}`,
      customer: data.customer,
      items: data.items,
      subtotal: data.subtotal,
      shipping: data.shipping,
      total: data.total,
      status: "جديد",
      createdAt: new Date().toISOString(),
    };
    setOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const backendStatus = mapOrderStatusToBackend(status);
    try {
      await fetch(`/api/v1/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: backendStatus })
      });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    } catch (e) {
      console.error(e);
    }
  };

  const deleteOrder = async (orderId: string) => {
    try {
      await fetch(`/api/v1/admin/orders/${orderId}/cancel`, { method: "POST" });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: "ملغي" } : o)));
    } catch (e) {
      console.error(e);
    }
  };

  const updateSettings = (updates: Partial<StoreSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  const resetToDefaults = () => {
    setSettings(INITIAL_SETTINGS);
  };

  const analytics = useMemo(() => {
    const validOrders = orders.filter((o) => o.status !== "ملغي");
    const totalRevenue = validOrders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(
      (o) => o.status === "جديد" || o.status === "قيد التجهيز",
    ).length;
    const completedOrders = orders.filter((o) => o.status === "تم التوصيل").length;
    const cancelledOrders = orders.filter((o) => o.status === "ملغي").length;
    const averageOrderValue = validOrders.length
      ? Math.round(totalRevenue / validOrders.length)
      : 0;

    const roastMap = new Map<
      string,
      { name: string; sales: number; count: number; marker: string }
    >();
    products.forEach((p) => {
      roastMap.set(p.name, { name: p.name, sales: 0, count: 0, marker: p.marker });
    });

    validOrders.forEach((o) => {
      o.items.forEach((item) => {
        const existing = roastMap.get(item.name) || {
          name: item.name,
          sales: 0,
          count: 0,
          marker: "var(--roast-medium)",
        };
        existing.sales += item.price * item.qty;
        existing.count += item.qty;
        roastMap.set(item.name, existing);
      });
    });

    const roastSalesBreakdown = Array.from(roastMap.values()).sort((a, b) => b.sales - a.sales);

    const days: { [key: string]: { date: string; sales: number; orders: number } } = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString("ar-EG", { month: "short", day: "numeric" });
      days[key] = { date: key, sales: 0, orders: 0 };
    }

    validOrders.forEach((o) => {
      const dateKey = new Date(o.createdAt).toLocaleDateString("ar-EG", {
        month: "short",
        day: "numeric",
      });
      if (days[dateKey]) {
        days[dateKey].sales += o.total;
        days[dateKey].orders += 1;
      }
    });

    const dailySalesData = Object.values(days);

    return {
      totalRevenue,
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      averageOrderValue,
      roastSalesBreakdown,
      dailySalesData,
    };
  }, [orders, products]);

  const value = useMemo(
    () => ({
      products,
      orders,
      settings,
      updatePrice,
      updateProductImage,
      removeProductImage,
      updateProduct,
      addProduct,
      deleteProduct,
      toggleProductAvailability,
      createOrder,
      updateOrderStatus,
      deleteOrder,
      updateSettings,
      resetToDefaults,
      analytics,
    }),
    [products, orders, settings, analytics],
  );

  return <AdminStoreContext.Provider value={value}>{children}</AdminStoreContext.Provider>;
}

export function useAdminStore() {
  const ctx = useContext(AdminStoreContext);
  if (!ctx) throw new Error("useAdminStore must be used within AdminStoreProvider");
  return ctx;
}

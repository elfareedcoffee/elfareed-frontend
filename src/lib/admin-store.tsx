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
  // Product actions
  updatePrice: (productId: string, grams: number, newPrice: number) => void;
  updateProductImage: (productId: string, imageUrl?: string | undefined) => void;
  removeProductImage: (productId: string) => void;
  updateProduct: (productId: string, updates: Partial<AdminProduct>) => void;
  addProduct: (product: Omit<AdminProduct, "id"> & { id?: string }) => void;
  deleteProduct: (productId: string) => void;
  toggleProductAvailability: (productId: string) => void;
  // Order actions
  createOrder: (data: {
    customer: CustomerInfo;
    items: CartItem[];
    subtotal: number;
    shipping: number;
    total: number;
  }) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  deleteOrder: (orderId: string) => void;
  // Settings actions
  updateSettings: (updates: Partial<StoreSettings>) => void;
  resetToDefaults: () => void;
  // Analytics
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

const STORAGE_PRODUCTS_KEY = "fareed-admin-products-v1";
const STORAGE_ORDERS_KEY = "fareed-admin-orders-v1";
const STORAGE_SETTINGS_KEY = "fareed-admin-settings-v1";

const INITIAL_ORDERS: Order[] = [
  {
    id: "ord-1001",
    orderNumber: "FC-1001",
    customer: {
      name: "محمود إبراهيم",
      phone: "01098765432",
      address: "١٢ شارع النصر، الدور الثالث، شقة ٥",
      area: "مصر الجديدة",
      notes: "طحن ناعم للكنكة التركي",
    },
    items: [
      {
        id: "mahawwag-250",
        productId: "mahawwag",
        name: "محوج",
        weight: "٢٥٠ جم",
        grams: 250,
        price: 145,
        qty: 2,
      },
      {
        id: "wasat-500",
        productId: "wasat",
        name: "وسط",
        weight: "٥٠٠ جم",
        grams: 500,
        price: 255,
        qty: 1,
      },
    ],
    subtotal: 545,
    shipping: 40,
    total: 585,
    status: "تم التوصيل",
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "ord-1002",
    orderNumber: "FC-1002",
    customer: {
      name: "سارة عبد الرحمن",
      phone: "01123456789",
      address: "عمارة ٤٤، شارع فريد، المرج",
      area: "المرج",
      notes: "حبوب كاملة بدون طحن",
    },
    items: [
      {
        id: "fateh-1000",
        productId: "fateh",
        name: "فاتح",
        weight: "١ كيلو",
        grams: 1000,
        price: 540,
        qty: 1,
      },
    ],
    subtotal: 540,
    shipping: 40,
    total: 580,
    status: "قيد التجهيز",
    createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "ord-1003",
    orderNumber: "FC-1003",
    customer: {
      name: "كريم يوسف",
      phone: "01234567890",
      address: "فيلا ٨، الحي الخامس",
      area: "التجمع الخامس",
      notes: "طحن وسط للفلتر V60",
    },
    items: [
      {
        id: "ghameq-500",
        productId: "ghameq",
        name: "غامق",
        weight: "٥٠٠ جم",
        grams: 500,
        price: 265,
        qty: 2,
      },
      {
        id: "mahawwag-250",
        productId: "mahawwag",
        name: "محوج",
        weight: "٢٥٠ جم",
        grams: 250,
        price: 145,
        qty: 1,
      },
    ],
    subtotal: 675,
    shipping: 40,
    total: 715,
    status: "جديد",
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
  },
  {
    id: "ord-1004",
    orderNumber: "FC-1004",
    customer: {
      name: "طارق العوضي",
      phone: "01011223344",
      address: "شارع شبرا الرئيسي، بجوار المحطة",
      area: "شبرا",
      notes: "إسبريسو",
    },
    items: [
      {
        id: "wasat-250",
        productId: "wasat",
        name: "وسط",
        weight: "٢٥٠ جم",
        grams: 250,
        price: 135,
        qty: 3,
      },
    ],
    subtotal: 405,
    shipping: 40,
    total: 445,
    status: "جديد",
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
];

const INITIAL_SETTINGS: StoreSettings = {
  deliveryFee: 40,
  isOpen: true,
  salesPhone: "01110583020",
  wholesalePhones: ["01020073246", "01005642565"],
};

export function AdminStoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<AdminProduct[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PRODUCTS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      /* ignore */
    }
    return defaultProducts.map((p) => ({ ...p, available: true }));
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ORDERS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      /* ignore */
    }
    return INITIAL_ORDERS;
  });

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
      localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(products));
    } catch {
      /* ignore */
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(orders));
    } catch {
      /* ignore */
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      /* ignore */
    }
  }, [settings]);

  const updatePrice = (productId: string, grams: number, newPrice: number) => {
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
  };

  const updateProductImage = (productId: string, imageUrl?: string | undefined) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const updated = { ...p };
        if (imageUrl && imageUrl.trim()) {
          updated.image = imageUrl;
        } else {
          delete updated.image;
        }
        return updated;
      }),
    );
  };

  const removeProductImage = (productId: string) => {
    updateProductImage(productId, undefined);
  };

  const updateProduct = (productId: string, updates: Partial<AdminProduct>) => {
    setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, ...updates } : p)));
  };

  const addProduct = (newProd: Omit<AdminProduct, "id"> & { id?: string }) => {
    const id = newProd.id || `roast-${Date.now()}`;
    const productToAdd: AdminProduct = {
      ...newProd,
      id,
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
  };

  const deleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const toggleProductAvailability = (productId: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, available: !p.available } : p)),
    );
  };

  const createOrder = (data: {
    customer: CustomerInfo;
    items: CartItem[];
    subtotal: number;
    shipping: number;
    total: number;
  }): Order => {
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

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
  };

  const deleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  const updateSettings = (updates: Partial<StoreSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  const resetToDefaults = () => {
    setProducts(defaultProducts.map((p) => ({ ...p, available: true })));
    setOrders(INITIAL_ORDERS);
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

    // Breakdown per roast
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

    // Generate last 7 days chart data
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

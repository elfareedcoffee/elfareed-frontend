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
  isLoadingProducts: boolean;
  orders: Order[];
  settings: StoreSettings;
  isAuthenticated: boolean | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  fetchAdminData: (tokenOverride?: string) => Promise<void>;
  updatePrice: (productId: string, grams: number, newPrice: number) => Promise<void>;
  updateProductImage: (
    productId: string,
    fileOrUrl?: File | string | undefined,
  ) => Promise<string | undefined>;
  removeProductImage: (productId: string) => Promise<void>;
  updateProduct: (productId: string, updates: Partial<AdminProduct>) => Promise<void>;
  addProduct: (
    product: Omit<AdminProduct, "id"> & { id?: string },
    imageFile?: File,
  ) => Promise<AdminProduct | undefined>;
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

const STORAGE_PRODUCTS_KEY = "fareed_cached_products_v1";
const STORAGE_ORDERS_KEY = "fareed_cached_orders_v1";
const STORAGE_SETTINGS_KEY = "fareed-admin-settings-v1";

const INITIAL_SETTINGS: StoreSettings = {
  deliveryFee: 40,
  isOpen: true,
  salesPhone: "01110583020",
  wholesalePhones: ["01020073246", "01005642565"],
};
// In production (Cloudflare Pages / Lovable), requests to /api/v1/... hit the frontend itself,
// not the backend. vercel.json rewrites only work on Vercel, not Cloudflare Pages.
// So we must use the full backend URL for all API calls in production.
export const API_BASE =
  typeof window !== "undefined" && window.location.hostname !== "localhost"
    ? "https://elfareed-backend.onrender.com"
    : "";

/** Build a full API URL, prepending the backend origin in production */
export function api(path: string): string {
  return `${API_BASE}${path}`;
}

export function getAdminHeaders(
  extraHeaders: Record<string, string> = {},
  explicitToken?: string,
): Record<string, string> {
  const headers: Record<string, string> = { ...extraHeaders };
  const token =
    explicitToken || (typeof window !== "undefined" ? localStorage.getItem("admin_token") : null);
  const csrf = typeof window !== "undefined" ? localStorage.getItem("admin_csrf") : null;
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  if (csrf) {
    headers["X-CSRF-Token"] = csrf;
  }
  return headers;
}

const INITIAL_PRODUCTS: AdminProduct[] = defaultProducts.map((p) => ({
  id: p.id,
  name: p.name,
  desc: p.desc,
  latin: p.latin,
  note: p.note,
  marker: p.marker,
  weights: p.weights.map((w) => ({
    id: w.id,
    label: w.label,
    grams: w.grams,
    price: w.price,
  })),
  available: true,
}));

function mapOrderStatus(status: string): OrderStatus {
  switch (status) {
    case "PENDING":
    case "CONFIRMED":
      return "جديد";
    case "PREPARING":
    case "READY_FOR_DELIVERY":
    case "OUT_FOR_DELIVERY":
      return "قيد التجهيز";
    case "DELIVERED":
      return "تم التوصيل";
    case "CANCELLED":
      return "ملغي";
    default:
      return "جديد";
  }
}

function mapOrderStatusToBackend(status: OrderStatus): string {
  switch (status) {
    case "جديد":
      return "PENDING";
    case "قيد التجهيز":
      return "PREPARING";
    case "تم التوصيل":
      return "DELIVERED";
    case "ملغي":
      return "CANCELLED";
    default:
      return "PENDING";
  }
}

function mapBackendOrder(o: any): Order {
  const items = Array.isArray(o.items) ? o.items : [];
  const area = [o.governorate, o.city].filter(Boolean).join(" - ") || "القاهرة";
  return {
    id: o.id || `ord-${Math.random()}`,
    orderNumber: o.order_number || `FC-${Math.floor(1000 + Math.random() * 9000)}`,
    customer: {
      name: o.customer_name || "عميل",
      phone: o.customer_phone || "",
      address: o.delivery_address || "",
      area: area,
      notes: o.delivery_notes || "",
    },
    items: items.map((i: any) => ({
      id: i.id || `${i.product_variant_id || Math.random()}`,
      productId: i.original_product_id || i.product_variant_id || i.id,
      variantId: i.product_variant_id,
      name: i.product_name_ar || "قهوة فريد",
      weight: i.weight_grams ? `${i.weight_grams} جم` : "٢٥٠ جم",
      grams: i.weight_grams || 250,
      price: Number(i.unit_price) || 0,
      qty: i.quantity || 1,
    })),
    subtotal: Number(o.subtotal) || 0,
    shipping: Number(o.delivery_fee) || 0,
    total: Number(o.total) || 0,
    status: mapOrderStatus(o.order_status),
    createdAt: o.created_at || new Date().toISOString(),
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
    if (meta && typeof meta === "object" && meta.desc !== undefined) {
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
    weights:
      (p.variants || [])
        .slice()
        .sort((a: any, b: any) => a.weight_grams - b.weight_grams)
        .map((v: any) => ({
          id: v.id,
          label: v.weight_grams >= 1000 ? `${v.weight_grams / 1000} كيلو` : `${v.weight_grams} جم`,
          grams: v.weight_grams,
          price: Number(v.price),
        })),
    image: p.image_url || undefined,
    available: p.is_active ?? true,
  };
}

export function AdminStoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<AdminProduct[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_PRODUCTS_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch {
        /* ignore */
      }
    }
    return [];
  });
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_PRODUCTS_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return false;
          }
        }
      } catch {
        /* ignore */
      }
    }
    return true;
  });
  const [orders, setOrders] = useState<Order[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_ORDERS_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch {
        /* ignore */
      }
    }
    return [];
  });
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("admin_token");
    }
    return null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

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
    if (products.length > 0) {
      try {
        localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(products));
      } catch {
        /* ignore */
      }
    }
  }, [products]);

  useEffect(() => {
    if (orders.length > 0) {
      try {
        localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(orders));
      } catch {
        /* ignore */
      }
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      /* ignore */
    }
  }, [settings]);

  /** Attempt to refresh the Supabase JWT using the stored refresh_token.
   *  Returns the new access_token on success, or null on failure. */
  const refreshAdminToken = async (): Promise<string | null> => {
    const refreshToken = typeof window !== "undefined" ? localStorage.getItem("admin_refresh_token") : null;
    if (!refreshToken) return null;
    try {
      const res = await fetch(api("/api/v1/admin/auth/refresh"), {
        method: "POST",
        headers: { Authorization: `Bearer ${refreshToken}` },
      });
      if (!res.ok) return null;
      const data = await res.json();
      if (data?.access_token) {
        localStorage.setItem("admin_token", data.access_token);
        setToken(data.access_token);
        if (data.refresh_token) {
          localStorage.setItem("admin_refresh_token", data.refresh_token);
        }
        if (data.csrf_token) {
          localStorage.setItem("admin_csrf", data.csrf_token);
        }
        return data.access_token;
      }
    } catch (e) {
      console.error("Token refresh failed:", e);
    }
    return null;
  };

  const login = async (username: string, password: string) => {
    const res = await fetch(api("/api/v1/admin/auth/login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData?.detail || errData?.error?.message || "بيانات الدخول غير صحيحة");
    }

    const data = await res.json();
    if (data?.access_token) {
      localStorage.setItem("admin_token", data.access_token);
      setToken(data.access_token);
    }
    // Persist refresh token so we can auto-renew sessions
    if (data?.refresh_token) {
      localStorage.setItem("admin_refresh_token", data.refresh_token);
    }
    if (data?.csrf_token) {
      localStorage.setItem("admin_csrf", data.csrf_token);
    }

    setIsAuthenticated(true);
    await fetchAdminData(data?.access_token);
  };

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_refresh_token");
      localStorage.removeItem("admin_csrf");
    }
    setToken(null);
    setIsAuthenticated(false);
    setOrders([]);
  };

  const fetchPublicProducts = async () => {
    try {
      const publicRes = await fetch(api("/api/v1/public/products/"));
      if (publicRes.ok) {
        const data = await publicRes.json();
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map(mapBackendProduct);
          setProducts(mapped);
          try {
            localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(mapped));
          } catch {
            /* ignore */
          }
        }
      }
    } catch (e) {
      console.error("Failed to fetch public products", e);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const fetchAdminData = async (tokenOverride?: string) => {
    let activeToken =
      tokenOverride ||
      token ||
      (typeof window !== "undefined" ? localStorage.getItem("admin_token") : null);

    if (!activeToken) {
      await fetchPublicProducts();
      return;
    }

    /** Inner helper: fetch admin endpoints and handle 401 with one auto-refresh attempt */
    const doFetch = async (tok: string) => {
      const headers = getAdminHeaders({}, tok);
      const [productsRes, ordersRes] = await Promise.allSettled([
        fetch(api("/api/v1/admin/products/"), { headers }),
        fetch(api("/api/v1/admin/orders/?size=100"), { headers }),
      ]);

      // Check if either request returned 401 — token may be expired
      const got401 =
        (productsRes.status === "fulfilled" && productsRes.value.status === 401) ||
        (ordersRes.status === "fulfilled" && ordersRes.value.status === 401);

      if (got401) {
        return null; // Signal caller to refresh and retry
      }

      if (productsRes.status === "fulfilled" && productsRes.value.ok) {
        const data = await productsRes.value.json();
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map(mapBackendProduct);
          setProducts(mapped);
          try {
            localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(mapped));
          } catch {
            /* ignore */
          }
        }
      } else {
        await fetchPublicProducts();
      }

      if (ordersRes.status === "fulfilled" && ordersRes.value.ok) {
        const ordersData = await ordersRes.value.json();
        const rawItems = Array.isArray(ordersData.items)
          ? ordersData.items
          : Array.isArray(ordersData)
          ? ordersData
          : [];
        setOrders(rawItems.map(mapBackendOrder));
      }

      return true; // Success
    };

    try {
      const result = await doFetch(activeToken);

      if (result === null) {
        // 401 detected — try to refresh the token
        console.info("Access token expired. Attempting silent refresh...");
        const newToken = await refreshAdminToken();
        if (newToken) {
          activeToken = newToken;
          const retryResult = await doFetch(newToken);
          if (retryResult === null) {
            // Still 401 after refresh — session is truly dead
            console.warn("Session invalid after token refresh. Logging out.");
            if (typeof window !== "undefined") {
              localStorage.removeItem("admin_token");
              localStorage.removeItem("admin_refresh_token");
              localStorage.removeItem("admin_csrf");
            }
            setToken(null);
            setIsAuthenticated(false);
          }
        } else {
          // No refresh token available — log out
          console.warn("No refresh token available. Logging out.");
          if (typeof window !== "undefined") {
            localStorage.removeItem("admin_token");
            localStorage.removeItem("admin_refresh_token");
            localStorage.removeItem("admin_csrf");
          }
          setToken(null);
          setIsAuthenticated(false);
        }
      }
    } catch (e) {
      console.error("Failed to fetch admin data", e);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    const savedToken = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
    if (savedToken) {
      // Optimistic: show cached data immediately, validate token in parallel
      setToken(savedToken);
      setIsAuthenticated(true);

      // Fire auth check and data fetch in parallel
      const authCheck = fetch(api("/api/v1/admin/auth/me"), {
        headers: { Authorization: `Bearer ${savedToken}` },
      });
      const dataFetch = fetchAdminData(savedToken);

      authCheck
        .then(async (res) => {
          if (res.ok) {
            // Token valid, data is already loading/loaded
            return;
          }
          if (res.status === 401) {
            const newToken = await refreshAdminToken();
            if (newToken) {
              setToken(newToken);
              setIsAuthenticated(true);
              fetchAdminData(newToken);
            } else {
              if (typeof window !== "undefined") {
                localStorage.removeItem("admin_token");
                localStorage.removeItem("admin_refresh_token");
                localStorage.removeItem("admin_csrf");
              }
              setToken(null);
              setIsAuthenticated(false);
              fetchPublicProducts();
            }
          } else {
            if (typeof window !== "undefined") {
              localStorage.removeItem("admin_token");
              localStorage.removeItem("admin_refresh_token");
              localStorage.removeItem("admin_csrf");
            }
            setToken(null);
            setIsAuthenticated(false);
            fetchPublicProducts();
          }
        })
        .catch(() => {
          setIsAuthenticated(false);
          fetchPublicProducts();
        });
    } else {
      setIsAuthenticated(false);
      fetchPublicProducts();
    }
  }, []);

  // Auto-refresh admin data every 30 seconds when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => {
      const tok = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
      if (tok) fetchAdminData(tok);
    }, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);


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
      const product = products.find((p) => p.id === productId);
      const variant = product?.weights.find((w) => w.grams === grams);
      if (variant && variant.id) {
        await fetch(api(`/api/v1/admin/variants/${variant.id}`), {
          method: "PUT",
          headers: getAdminHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify({ price: Math.max(1, newPrice) }),
        });
      }
    } catch (e) {
      console.error("Failed to update price", e);
    }
  };

  const updateProductImage = async (
    productId: string,
    fileOrUrl?: File | string | undefined,
  ): Promise<string | undefined> => {
    if (fileOrUrl instanceof File) {
      const formData = new FormData();
      formData.append("file", fileOrUrl);
      const res = await fetch(api(`/api/v1/admin/products/${productId}/image`), {
        method: "POST",
        headers: getAdminHeaders(),
        body: formData,
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const message = errData?.detail || errData?.message || "فشل رفع الصورة على الخادم";
        throw new Error(typeof message === "string" ? message : JSON.stringify(message));
      }
      const updated = await res.json();
      const mapped = mapBackendProduct(updated);
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? mapped : p)),
      );
      return mapped.image;
    } else if (typeof fileOrUrl === "string") {
      setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, image: fileOrUrl } : p)));
      return fileOrUrl;
    }
    return undefined;
  };

  const removeProductImage = async (productId: string) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const updated = { ...p };
        delete updated.image;
        return updated;
      }),
    );
    const res = await fetch(api(`/api/v1/admin/products/${productId}/image`), {
      method: "DELETE",
      headers: getAdminHeaders(),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const message = errData?.detail || errData?.message || "فشل حذف الصورة من الخادم";
      throw new Error(typeof message === "string" ? message : JSON.stringify(message));
    }
  };

  const updateProduct = async (productId: string, updates: Partial<AdminProduct>) => {
    setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, ...updates } : p)));

    try {
      const oldProduct = products.find((p) => p.id === productId);
      if (!oldProduct) return;
      const combined = { ...oldProduct, ...updates };

      const payload = {
        translations: [
          {
            language: "ar",
            name: combined.name,
            description: JSON.stringify({
              desc: combined.desc,
              latin: combined.latin,
              note: combined.note,
              marker: combined.marker,
            }),
          },
        ],
      };
      await fetch(api(`/api/v1/admin/products/${productId}/translations`), {
        method: "PUT",
        headers: getAdminHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(payload),
      });
    } catch (e) {
      console.error("Failed to update product details", e);
    }
  };

  const addProduct = async (
    newProd: Omit<AdminProduct, "id"> & { id?: string },
    imageFile?: File,
  ): Promise<AdminProduct> => {
    const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
    if (!token) {
      throw new Error("يجب تسجيل الدخول كمسؤول أولاً من صفحة لوحة التحكم (/admin) لحفظ التحميصة");
    }

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

    const categoryId = "b58774a1-eea1-42c9-b91c-f58bca51fc1b"; // Default category

    const payload = {
      category_id: categoryId,
      is_active: true,
      translations: [
        {
          language: "ar",
          name: productToAdd.name,
          description: JSON.stringify({
            desc: productToAdd.desc,
            latin: productToAdd.latin,
            note: productToAdd.note,
            marker: productToAdd.marker,
          }),
        },
        {
          language: "en",
          name: productToAdd.latin || productToAdd.name,
          description: productToAdd.desc || "Fareed Coffee Roast",
        },
      ],
      variants: productToAdd.weights.map((w) => ({
        weight_grams: w.grams,
        grind_type: "TURKISH",
        price: w.price,
        stock_quantity: 100,
        is_active: true,
      })),
    };

    const res = await fetch(api("/api/v1/admin/products/"), {
      method: "POST",
      headers: getAdminHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_csrf");
        throw new Error("انتهت جلسة تسجيل الدخول، يرجى إعادة تسجيل الدخول للوحة التحكم (/admin)");
      }
      const errData = await res.json().catch(() => ({}));
      const message = errData?.detail || errData?.message || "فشل حفظ التحميصة في الخادم";
      throw new Error(typeof message === "string" ? message : JSON.stringify(message));
    }

    let createdProduct = await res.json();

    if (imageFile) {
      try {
        const imgData = new FormData();
        imgData.append("file", imageFile);
        const imgRes = await fetch(api(`/api/v1/admin/products/${createdProduct.id}/image`), {
          method: "POST",
          headers: getAdminHeaders(),
          body: imgData,
        });
        if (imgRes.ok) {
          createdProduct = await imgRes.json();
        }
      } catch (imgErr) {
        console.error("Image upload failed:", imgErr);
      }
    }

    const mapped = mapBackendProduct(createdProduct);
    setProducts((prev) => [...prev.filter((p) => p.id !== tempId && p.id !== mapped.id), mapped]);
    return mapped;
  };

  const deleteProduct = async (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    try {
      const res = await fetch(api(`/api/v1/admin/products/${productId}`), {
        method: "DELETE",
        headers: getAdminHeaders(),
      });
      if (!res.ok) {
        // Fallback to deactivate if DELETE endpoint is not supported
        await fetch(api(`/api/v1/admin/products/${productId}/deactivate`), {
          method: "PATCH",
          headers: getAdminHeaders(),
        });
      }
    } catch (e) {
      console.error("Failed to delete product from backend:", e);
    }
  };

  const toggleProductAvailability = async (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    const isActive = !product.available;
    try {
      const endpoint = isActive ? "activate" : "deactivate";
      await fetch(api(`/api/v1/admin/products/${productId}/${endpoint}`), {
        method: "PATCH",
        headers: getAdminHeaders(),
      });
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

    // Optimistic update — change UI and localStorage cache instantly
    const previousOrders = orders;
    const updatedOrders = orders.map((o) => (o.id === orderId ? { ...o, status } : o));
    setOrders(updatedOrders);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(updatedOrders));
      } catch {}
    }

    // Fire API in background, rollback on failure
    try {
      const res = await fetch(api(`/api/v1/admin/orders/${orderId}/status`), {
        method: "PUT",
        headers: getAdminHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ status: backendStatus }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error("Status update failed:", errData);
        setOrders(previousOrders);
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(previousOrders));
          } catch {}
        }
      }
    } catch (e) {
      console.error("Status update failed, rolling back", e);
      setOrders(previousOrders);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(previousOrders));
        } catch {}
      }
    }
  };

  const deleteOrder = async (orderId: string) => {
    // Optimistic update — remove order from state and local storage cache immediately
    const previousOrders = orders;
    const updatedOrders = orders.filter((o) => o.id !== orderId);
    setOrders(updatedOrders);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(updatedOrders));
      } catch {}
    }

    try {
      const res = await fetch(api(`/api/v1/admin/orders/${orderId}`), {
        method: "DELETE",
        headers: getAdminHeaders(),
      });
      if (!res.ok) {
        // Fallback to cancel if DELETE not yet propagated on older server deployment
        const cancelRes = await fetch(api(`/api/v1/admin/orders/${orderId}/cancel`), {
          method: "POST",
          headers: getAdminHeaders(),
        });
        if (!cancelRes.ok) {
          console.error("Delete & Cancel failed, rolling back");
          setOrders(previousOrders);
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(previousOrders));
            } catch {}
          }
        }
      }
    } catch (e) {
      console.error("Delete order failed, rolling back", e);
      setOrders(previousOrders);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(previousOrders));
        } catch {}
      }
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
      isLoadingProducts,
      orders,
      settings,
      isAuthenticated,
      token,
      login,
      logout,
      fetchAdminData,
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
    [
      products,
      isLoadingProducts,
      orders,
      settings,
      isAuthenticated,
      token,
      analytics,
      login,
      logout,
      fetchAdminData,
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
    ],
  );

  return <AdminStoreContext.Provider value={value}>{children}</AdminStoreContext.Provider>;
}

export function useAdminStore() {
  const ctx = useContext(AdminStoreContext);
  if (!ctx) throw new Error("useAdminStore must be used within AdminStoreProvider");
  return ctx;
}

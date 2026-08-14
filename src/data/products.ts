export type Weight = { label: string; grams: number; price: number };

export type Product = {
  id: string;
  name: string;
  latin: string;
  note: string;
  desc: string;
  marker: string; // css var color
  weights: Weight[];
};

export const CONTACT = {
  sales: "01110583020",
  wholesale: ["01020073246", "01056425650"],
  address: "ش عبد الفتاح أبو ريه، المرج القديمة، القاهرة",
};

export const products: Product[] = [
  {
    id: "mahawwag",
    name: "محوج",
    latin: "Spiced",
    note: "هيل · قرنفل · مستكة",
    desc: "خلطة البيت. بن مطحون مع الهيل الأخضر ولمسة قرنفل — القهوة اللي ريحتها توصل قبلها.",
    marker: "var(--roast-spiced)",
    weights: [
      { label: "٢٥٠ جم", grams: 250, price: 145 },
      { label: "٥٠٠ جم", grams: 500, price: 275 },
      { label: "١ كيلو", grams: 1000, price: 520 },
    ],
  },
  {
    id: "wasat",
    name: "وسط",
    latin: "Medium",
    note: "كراميل · بندق · توازن",
    desc: "التحميص المتوازن. حلاوة كراميل هادية وجسم مليان، يناسب الكنكة والفلتر على السواء.",
    marker: "var(--roast-medium)",
    weights: [
      { label: "٢٥٠ جم", grams: 250, price: 135 },
      { label: "٥٠٠ جم", grams: 500, price: 255 },
      { label: "١ كيلو", grams: 1000, price: 480 },
    ],
  },
  {
    id: "fateh",
    name: "فاتح",
    latin: "Light",
    note: "حمضية · زهور · وضوح",
    desc: "تحميص فاتح يحافظ على أصل الحبة: حموضة مشرقة ونهاية نظيفة. للي بيحب يتذوق التفاصيل.",
    marker: "var(--roast-light)",
    weights: [
      { label: "٢٥٠ جم", grams: 250, price: 150 },
      { label: "٥٠٠ جم", grams: 500, price: 285 },
      { label: "١ كيلو", grams: 1000, price: 540 },
    ],
  },
  {
    id: "ghameq",
    name: "غامق",
    latin: "Dark",
    note: "كاكاو · دخان · قوة",
    desc: "التحميص الغامق. مرارة نبيلة وطعم كاكاو داكن — الفنجان اللي يفوق النايم.",
    marker: "var(--roast-dark)",
    weights: [
      { label: "٢٥٠ جم", grams: 250, price: 140 },
      { label: "٥٠٠ جم", grams: 500, price: 265 },
      { label: "١ كيلو", grams: 1000, price: 500 },
    ],
  },
];

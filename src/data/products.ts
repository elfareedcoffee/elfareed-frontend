export type Weight = { id?: string | undefined; label: string; grams: number; price: number };

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
  wholesale: ["01020073246", "01005642565"],
  address: "ش عبد الفتاح أبو ريه، المرج القديمة، القاهرة",
};

export const products: Product[] = [
  {
    id: "16a7d43e-1c72-4fc8-976e-0ee594726d49",
    name: "محوج",
    latin: "Spiced",
    note: "هيل · قرنفل · مستكة",
    desc: "خلطة البيت. بن مطحون مع الهيل الأخضر ولمسة قرنفل — القهوة اللي ريحتها توصل قبلها.",
    marker: "var(--roast-spiced)",
    weights: [
      { id: "1e867c42-4d74-46a6-8d1f-224dac08c232", label: "٢٥٠ جم", grams: 250, price: 145 },
      { id: "f34f826a-bd7e-4640-9e57-5dd334ee9325", label: "٥٠٠ جم", grams: 500, price: 285 },
      { id: "aa9276e6-2fee-43a6-ba04-09f298b1237d", label: "١ كيلو", grams: 1000, price: 565 },
    ],
  },
  {
    id: "2a9fd994-1cef-405a-b5ee-0c0ceebd5e4d",
    name: "وسط",
    latin: "Medium",
    note: "كراميل · بندق · توازن",
    desc: "التحميص المتوازن. حلاوة كراميل هادية وجسم مليان، يناسب الكنكة والفلتر على السواء.",
    marker: "var(--roast-medium)",
    weights: [
      { id: "6c8bc697-5c11-463e-ba17-34ae9874e757", label: "٢٥٠ جم", grams: 250, price: 135 },
      { id: "03907cb5-6ae5-4b97-b402-d5de1041af35", label: "٥٠٠ جم", grams: 500, price: 265 },
      { id: "55cddc43-520b-45a8-89d2-2bec3ce514a0", label: "١ كيلو", grams: 1000, price: 525 },
    ],
  },
  {
    id: "b63fc9aa-6b71-4db1-b46d-4b819785631f",
    name: "فاتح",
    latin: "Light",
    note: "حمضية · زهور · وضوح",
    desc: "تحميص فاتح يحافظ على أصل الحبة: حموضة مشرقة ونهاية نظيفة. للي بيحب يتذوق التفاصيل.",
    marker: "var(--roast-light)",
    weights: [
      { id: "887d96d7-6ce1-4ed3-88fe-6c93693311bd", label: "٢٥٠ جم", grams: 250, price: 150 },
      { id: "833087b6-49c0-4d4d-84ac-05c25243dc7a", label: "٥٠٠ جم", grams: 500, price: 295 },
      { id: "7de312af-88e0-423d-8f1d-541e947c7ea8", label: "١ كيلو", grams: 1000, price: 585 },
    ],
  },
  {
    id: "f08f7008-a0de-4d44-af9f-46d4f1332135",
    name: "غامق",
    latin: "Dark",
    note: "كاكاو · دخان · قوة",
    desc: "التحميص الغامق. مرارة نبيلة وطعم كاكاو داكن — الفنجان اللي يفوق النايم.",
    marker: "var(--roast-dark)",
    weights: [
      { id: "11ff000a-aee3-49c5-8837-8e5dc3e97a69", label: "٢٥٠ جم", grams: 250, price: 140 },
      { id: "ccb57351-d4ac-4962-b07b-790fc45afc27", label: "٥٠٠ جم", grams: 500, price: 275 },
      { id: "acf68c80-34a8-452b-8ca2-13de49bc33a7", label: "١ كيلو", grams: 1000, price: 545 },
    ],
  },
];

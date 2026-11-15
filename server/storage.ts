import fs from 'node:fs';
import path from 'node:path';
import type { Order, Product } from '../src/types';

export interface StoreData {
  products: Product[];
  orders: Order[];
}

export const SEED_PRODUCTS: Product[] = [
  {
    id: 'tr-trench-camel',
    title: 'Двубортный шерстяной тренч Nişantaşı',
    category: 'outerwear',
    audience: 'women',
    priceKzt: 68500,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    color: 'Кэмел',
    description:
      'Классический двубортный тренч из турецкой смесовой шерсти премиум-качества. Идеальная посадка по фигуре, роговые пуговицы, плотная подкладка. Прямой выкуп из бутика в Стамбуле.',
    imageUrl: '/images/prod_trench_camel_1794738820465.jpg',
    availability: 'preorder_istanbul',
    origin: 'Стамбул, Турция',
    createdAt: '2026-11-10T10:00:00.000Z',
  },
  {
    id: 'tr-loafers-espresso',
    title: 'Лоферы из натуральной кожи Istanbul Atelier',
    category: 'footwear',
    audience: 'women',
    priceKzt: 42000,
    sizes: ['36', '37', '38', '39', '40'],
    color: 'Эспрессо',
    description:
      'Турецкие лоферы ручной работы из мягкой телячьей кожи с латунной пряжкой. Анатомическая кожаная стелька и износостойкая подошва.',
    imageUrl: '/images/prod_loafers_leather_1794738819953.jpg',
    availability: 'preorder_istanbul',
    origin: 'Стамбул, Турция',
    createdAt: '2026-11-10T09:50:00.000Z',
  },
  {
    id: 'tr-knit-set-oat',
    title: 'Трикотажный костюм-двойка Ribbed Cashmere',
    category: 'clothing',
    audience: 'women',
    priceKzt: 36900,
    sizes: ['XS', 'S', 'M', 'L'],
    color: 'Молочный беж',
    description:
      'Мягкий костюм в рубчик из турецкого хлопка с добавлением кашемира: кардиган на перламутровых пуговицах и широкие брюки комфортной посадки.',
    imageUrl: '/images/prod_knit_set_1794738822152.jpg',
    availability: 'preorder_istanbul',
    origin: 'Стамбул, Турция',
    createdAt: '2026-11-10T09:40:00.000Z',
  },
  {
    id: 'tr-sneakers-white',
    title: 'Кожаные кеды Minimalist Beyoğlu',
    category: 'footwear',
    audience: 'men',
    priceKzt: 39500,
    sizes: ['38', '39', '40', '41', '42', '43', '44'],
    color: 'Белый / Замша',
    description:
      'Универсальные кеды из гладкой турецкой натуральной кожи с замшевым задником. Лёгкая прошитая подошва, комфорт на весь день.',
    imageUrl: '/images/prod_sneakers_white_1794738821719.jpg',
    availability: 'preorder_istanbul',
    origin: 'Стамбул, Турция',
    createdAt: '2026-11-10T09:30:00.000Z',
  },
  {
    id: 'tr-bag-taupe',
    title: 'Сумка кросс-боди из кожи Deri Istanbul',
    category: 'accessories',
    audience: 'women',
    priceKzt: 44500,
    sizes: ['One Size'],
    color: 'Тауп',
    description:
      'Структурированная сумка из зернистой турецкой кожи с матовой золотистой фурнитурой и регулируемым плечевым ремнём.',
    imageUrl: '/images/prod_leather_bag_1794738822651.jpg',
    availability: 'preorder_istanbul',
    origin: 'Стамбул, Турция',
    createdAt: '2026-11-10T09:20:00.000Z',
  },
  {
    id: 'tr-suede-bomber-men',
    title: 'Мужской замшевый бомбер Karaköy',
    category: 'outerwear',
    audience: 'men',
    priceKzt: 74000,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    color: 'Графит',
    description:
      'Премиальная мужская куртка-бомбер из мягкой турецкой экозамши высокого класса с двойной металлической молнией.',
    imageUrl: '/images/prod_mens_jacket_1794738822218.jpg',
    availability: 'preorder_istanbul',
    origin: 'Стамбул, Турция',
    createdAt: '2026-11-10T09:10:00.000Z',
  },
];

function getKvConfig(): { url: string; token: string } | null {
  const url = (
    process.env.KV_REST_API_URL ||
    process.env.UPSTASH_REDIS_REST_URL ||
    ''
  ).trim();
  const token = (
    process.env.KV_REST_API_TOKEN ||
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    ''
  ).trim();
  if (url && token) {
    return { url: url.replace(/\/+$/, ''), token };
  }
  return null;
}

export function isCloudDbConfigured(): boolean {
  return getKvConfig() !== null;
}

async function kvCommand<T = unknown>(command: (string | number)[]): Promise<T | null> {
  const kv = getKvConfig();
  if (!kv) return null;

  const res = await fetch(kv.url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${kv.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
    signal: AbortSignal.timeout(6000),
  });

  if (!res.ok) {
    throw new Error(`KV REST error ${res.status}`);
  }
  const data = (await res.json()) as { result?: T; error?: string };
  if (data.error) {
    throw new Error(data.error);
  }
  return (data.result ?? null) as T | null;
}

const KV_PRODUCTS_KEY = 'assemok:products';
const KV_ORDERS_KEY = 'assemok:orders';

function getLocalStorePaths(): { dir: string; file: string; uploadsDir: string } {
  const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
  const dir = isServerless ? '/tmp/assemok-data' : path.resolve(process.cwd(), 'data');
  return {
    dir,
    file: path.join(dir, 'store.json'),
    uploadsDir: path.join(dir, 'uploads'),
  };
}

export function getUploadsDir(): string {
  const { uploadsDir } = getLocalStorePaths();
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  return uploadsDir;
}

function readLocalStore(): StoreData {
  const { dir, file } = getLocalStorePaths();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(file)) {
    const initial: StoreData = { products: SEED_PRODUCTS, orders: [] };
    fs.writeFileSync(file, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
  try {
    const raw = fs.readFileSync(file, 'utf-8');
    const parsed = JSON.parse(raw) as StoreData;
    return {
      products: Array.isArray(parsed.products) ? parsed.products : SEED_PRODUCTS,
      orders: Array.isArray(parsed.orders) ? parsed.orders : [],
    };
  } catch {
    return { products: SEED_PRODUCTS, orders: [] };
  }
}

function writeLocalStore(data: StoreData): void {
  const { dir, file } = getLocalStorePaths();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
}

export async function getProducts(): Promise<Product[]> {
  if (isCloudDbConfigured()) {
    const raw = await kvCommand<string | null>(['GET', KV_PRODUCTS_KEY]);
    if (!raw) {
      await kvCommand(['SET', KV_PRODUCTS_KEY, JSON.stringify(SEED_PRODUCTS)]);
      return SEED_PRODUCTS;
    }
    try {
      const parsed = JSON.parse(raw) as Product[];
      return Array.isArray(parsed) ? parsed : SEED_PRODUCTS;
    } catch {
      return SEED_PRODUCTS;
    }
  }
  return readLocalStore().products;
}

export async function saveProducts(products: Product[]): Promise<void> {
  if (isCloudDbConfigured()) {
    await kvCommand(['SET', KV_PRODUCTS_KEY, JSON.stringify(products)]);
    return;
  }
  const store = readLocalStore();
  store.products = products;
  writeLocalStore(store);
}

export async function getOrders(): Promise<Order[]> {
  if (isCloudDbConfigured()) {
    const raw = await kvCommand<string | null>(['GET', KV_ORDERS_KEY]);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw) as Order[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return readLocalStore().orders;
}

export async function saveOrders(orders: Order[]): Promise<void> {
  if (isCloudDbConfigured()) {
    await kvCommand(['SET', KV_ORDERS_KEY, JSON.stringify(orders)]);
    return;
  }
  const store = readLocalStore();
  store.orders = orders;
  writeLocalStore(store);
}

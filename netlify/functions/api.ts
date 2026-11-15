import crypto from 'node:crypto';
import type { Order, OrderStatus, Product } from '../../src/types';
import {
  getOrders,
  getProducts,
  isCloudDbConfigured,
  saveOrders,
  saveProducts,
} from '../../server/storage';

const ADMIN_LOGIN_VALUE = process.env.ADMIN_LOGIN || 'assemoklifesalimova';
const ADMIN_PASSWORD_VALUE = process.env.ADMIN_PASSWORD || 'assemok482689!';
const TOKEN_SECRET =
  process.env.ADMIN_TOKEN_SECRET ||
  crypto.createHmac('sha256', ADMIN_PASSWORD_VALUE).update(ADMIN_LOGIN_VALUE).digest('hex');
const TELEGRAM_CHAT_ID = (process.env.TELEGRAM_CHAT_ID || '1113226607').trim();

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function formatKztServer(amount: number): string {
  return `${new Intl.NumberFormat('ru-RU').format(Math.round(amount))} ₸`;
}

async function sendTelegramText(htmlText: string): Promise<{ ok: boolean; error?: string }> {
  const token = (process.env.TELEGRAM_BOT_TOKEN || '').trim();
  if (!token) {
    return { ok: false, error: 'TELEGRAM_BOT_TOKEN не настроен в Environment Variables.' };
  }
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: htmlText,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
      signal: AbortSignal.timeout(6000),
    });
    const data = (await response.json()) as { ok?: boolean; description?: string };
    if (!response.ok || !data.ok) {
      return { ok: false, error: data.description || `HTTP ${response.status}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Ошибка Telegram API' };
  }
}

async function sendTelegramOrderNotification(order: Order): Promise<void> {
  const deliveryLabel =
    order.deliveryMethod === 'atyrau'
      ? 'По городу Атырау'
      : 'Почта по Казахстану (за счёт клиента)';

  const itemsLines = order.items
    .map(
      (item, idx) =>
        `${idx + 1}. <b>${escapeHtml(item.title)}</b>\n   Размер: <code>${escapeHtml(
          item.size
        )}</code> × ${item.quantity} — ${formatKztServer(item.priceKzt * item.quantity)}`
    )
    .join('\n');

  const lines = [
    `🛍 <b>Новый заказ #${escapeHtml(order.orderNumber)}</b>`,
    ``,
    `<b>Состав заказа:</b>`,
    itemsLines,
    ``,
    `💰 <b>Итого за товар:</b> ${formatKztServer(order.totalGoodsKzt)}`,
    `🚚 <b>Доставка:</b> ${escapeHtml(deliveryLabel)}`,
    `🏙 <b>Город:</b> ${escapeHtml(order.city || 'Атырау')}`,
    order.address ? `📍 <b>Адрес:</b> ${escapeHtml(order.address)}` : '',
    ``,
    `👤 <b>Покупатель:</b> ${escapeHtml(order.customerName)}`,
    `📱 <b>Телефон:</b> ${escapeHtml(order.customerPhone)}`,
    order.comment ? `💬 <b>Комментарий:</b> ${escapeHtml(order.comment)}` : '',
  ].filter(Boolean);

  await sendTelegramText(lines.join('\n'));
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf-8');
  const bufB = Buffer.from(b, 'utf-8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function createAdminToken(login: string): string {
  const payload = Buffer.from(
    JSON.stringify({ sub: login, exp: Date.now() + 24 * 60 * 60 * 1000 }),
    'utf-8'
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function verifyAdminToken(req: Request): boolean {
  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payload, sig] = parts;
  const expectedSig = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('base64url');
  if (!safeEqual(sig, expectedSig)) return false;
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8')) as {
      sub?: string;
      exp?: number;
    };
    return Boolean(parsed.sub && parsed.exp && parsed.exp > Date.now());
  } catch {
    return false;
  }
}

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  let route = url.pathname;
  if (route.startsWith('/.netlify/functions/api')) {
    route = route.slice('/.netlify/functions/api'.length) || '/';
  } else if (route.startsWith('/api')) {
    route = route.slice('/api'.length) || '/';
  }
  const method = req.method.toUpperCase();

  try {
    if (method === 'GET' && route === '/health') {
      return jsonResponse({
        ok: true,
        storage: isCloudDbConfigured() ? 'kv_cloud' : 'tmp_fallback',
      });
    }

    if (method === 'GET' && route === '/products') {
      const products = await getProducts();
      const sorted = [...products].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      return jsonResponse({ products: sorted });
    }

    if (method === 'POST' && route === '/orders') {
      const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
      const { customerName, customerPhone, city, address, deliveryMethod, comment, items } = body;
      if (!customerName || !customerPhone || !Array.isArray(items) || items.length === 0) {
        return jsonResponse(
          { error: 'Заполните имя, телефон и выберите хотя бы один товар.' },
          400
        );
      }
      const products = await getProducts();
      const validItems = items
        .map((item: { productId?: string; size?: string; quantity?: number }) => {
          const product = products.find((p) => p.id === item.productId);
          if (!product) return null;
          const qty = Math.max(1, Math.min(20, Number(item.quantity) || 1));
          return {
            productId: product.id,
            title: product.title,
            size: String(item.size || product.sizes[0] || 'One Size'),
            quantity: qty,
            priceKzt: product.priceKzt,
          };
        })
        .filter((x): x is NonNullable<typeof x> => x !== null);

      if (validItems.length === 0) {
        return jsonResponse({ error: 'Выбранные товары не найдены в каталоге.' }, 400);
      }

      const orders = await getOrders();
      const totalGoodsKzt = validItems.reduce((sum, i) => sum + i.priceKzt * i.quantity, 0);
      const orderNum = `ASM-${String(1000 + orders.length + 1)}`;
      const newOrder: Order = {
        id: crypto.randomUUID(),
        orderNumber: orderNum,
        customerName: String(customerName).trim().slice(0, 120),
        customerPhone: String(customerPhone).trim().slice(0, 40),
        city: String(city || (deliveryMethod === 'atyrau' ? 'Атырау' : '')).trim().slice(0, 120),
        address: String(address || '').trim().slice(0, 240),
        deliveryMethod: deliveryMethod === 'post_kz' ? 'post_kz' : 'atyrau',
        comment: String(comment || '').trim().slice(0, 400),
        items: validItems,
        totalGoodsKzt,
        status: 'new',
        createdAt: new Date().toISOString(),
      };

      orders.unshift(newOrder);
      await saveOrders(orders);
      await sendTelegramOrderNotification(newOrder);
      return jsonResponse({ order: newOrder }, 201);
    }

    if (method === 'POST' && route === '/admin/login') {
      const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
      const login = String(body.login ?? '').trim();
      const password = String(body.password ?? '');
      if (!login || !password) {
        return jsonResponse({ error: 'Введите логин и пароль.' }, 400);
      }
      if (!safeEqual(login, ADMIN_LOGIN_VALUE) || !safeEqual(password, ADMIN_PASSWORD_VALUE)) {
        return jsonResponse({ error: 'Неверный логин или пароль.' }, 401);
      }
      return jsonResponse({ token: createAdminToken(login) });
    }

    // All remaining routes require admin authentication
    if (!verifyAdminToken(req)) {
      return jsonResponse({ error: 'Требуется авторизация администратора' }, 401);
    }

    if (method === 'GET' && route === '/admin/verify') {
      return jsonResponse({ ok: true });
    }

    if (method === 'POST' && route === '/admin/upload') {
      const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
      const dataUrl = body.dataUrl;
      if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) {
        return jsonResponse({ error: 'Некорректный формат изображения.' }, 400);
      }
      return jsonResponse({ imageUrl: dataUrl }, 201);
    }

    if (method === 'POST' && route === '/admin/products') {
      const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
      const title = String(body.title ?? '').trim();
      const priceKzt = Number(body.priceKzt);
      const sizes = Array.isArray(body.sizes)
        ? body.sizes.map((s) => String(s).trim()).filter(Boolean)
        : [];

      if (!title || !Number.isFinite(priceKzt) || priceKzt <= 0 || sizes.length === 0) {
        return jsonResponse({ error: 'Укажите название, цену в тенге и хотя бы один размер.' }, 400);
      }

      const allowedCategories = ['clothing', 'footwear', 'outerwear', 'accessories'];
      const allowedAudiences = ['women', 'men', 'kids'];
      const category = allowedCategories.includes(String(body.category))
        ? (body.category as Product['category'])
        : 'clothing';
      const audience = allowedAudiences.includes(String(body.audience))
        ? (body.audience as Product['audience'])
        : 'women';
      const availability =
        body.availability === 'in_stock_atyrau' ? 'in_stock_atyrau' : 'preorder_istanbul';

      const product: Product = {
        id: `tr-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`,
        title: title.slice(0, 140),
        category,
        audience,
        priceKzt: Math.round(priceKzt),
        sizes,
        color: String(body.color ?? '').trim().slice(0, 60) || undefined,
        description: String(body.description ?? '').trim().slice(0, 1000),
        imageUrl: String(body.imageUrl ?? '').trim() || '/images/prod_trench_camel_1794738820465.jpg',
        availability,
        origin: String(body.origin ?? 'Стамбул, Турция').trim().slice(0, 80),
        createdAt: new Date().toISOString(),
      };

      const products = await getProducts();
      products.unshift(product);
      await saveProducts(products);
      return jsonResponse({ product }, 201);
    }

    if (route.startsWith('/admin/products/')) {
      const id = decodeURIComponent(route.slice('/admin/products/'.length));
      if (method === 'PUT') {
        const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
        const products = await getProducts();
        const idx = products.findIndex((p) => p.id === id);
        if (idx === -1) return jsonResponse({ error: 'Товар не найден.' }, 404);
        const existing = products[idx];
        const title = String(body.title ?? existing.title).trim();
        const priceKzt = Number(body.priceKzt ?? existing.priceKzt);
        const sizes = Array.isArray(body.sizes)
          ? body.sizes.map((s) => String(s).trim()).filter(Boolean)
          : existing.sizes;
        if (!title || !Number.isFinite(priceKzt) || priceKzt <= 0 || sizes.length === 0) {
          return jsonResponse({ error: 'Проверьте название, цену и размеры товара.' }, 400);
        }
        const updated: Product = {
          ...existing,
          title: title.slice(0, 140),
          category: (body.category as Product['category']) || existing.category,
          audience: (body.audience as Product['audience']) || existing.audience,
          priceKzt: Math.round(priceKzt),
          sizes,
          color: body.color !== undefined ? String(body.color).trim().slice(0, 60) : existing.color,
          description:
            body.description !== undefined
              ? String(body.description).trim().slice(0, 1000)
              : existing.description,
          imageUrl: String(body.imageUrl ?? existing.imageUrl).trim() || existing.imageUrl,
          availability:
            body.availability === 'in_stock_atyrau'
              ? 'in_stock_atyrau'
              : body.availability === 'preorder_istanbul'
                ? 'preorder_istanbul'
                : existing.availability,
          origin: body.origin ? String(body.origin).trim().slice(0, 80) : existing.origin,
        };
        products[idx] = updated;
        await saveProducts(products);
        return jsonResponse({ product: updated });
      }
      if (method === 'DELETE') {
        const products = await getProducts();
        const nextProducts = products.filter((p) => p.id !== id);
        if (nextProducts.length === products.length) {
          return jsonResponse({ error: 'Товар не найден.' }, 404);
        }
        await saveProducts(nextProducts);
        return jsonResponse({ ok: true });
      }
    }

    if (method === 'GET' && route === '/admin/orders') {
      const orders = await getOrders();
      return jsonResponse({ orders });
    }

    if (method === 'GET' && route === '/admin/telegram-status') {
      return jsonResponse({
        configured: Boolean((process.env.TELEGRAM_BOT_TOKEN || '').trim()),
        chatId: TELEGRAM_CHAT_ID,
        cloudDbConfigured: isCloudDbConfigured(),
      });
    }

    if (method === 'POST' && route === '/admin/telegram-test') {
      const result = await sendTelegramText(
        `✅ <b>ASSEMOK:</b> уведомления о новых заказах из корзины подключены (чат ${escapeHtml(
          TELEGRAM_CHAT_ID
        )}).`
      );
      if (!result.ok) return jsonResponse({ error: result.error }, 400);
      return jsonResponse({ ok: true });
    }

    if (method === 'PATCH' && route.startsWith('/admin/orders/')) {
      const id = decodeURIComponent(route.slice('/admin/orders/'.length));
      const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
      const status = body.status as OrderStatus;
      const allowed: OrderStatus[] = [
        'new',
        'goods_paid',
        'purchased_istanbul',
        'shipped',
        'delivered',
        'cancelled',
      ];
      if (!allowed.includes(status)) {
        return jsonResponse({ error: 'Некорректный статус заказа.' }, 400);
      }
      const orders = await getOrders();
      const order = orders.find((o) => o.id === id);
      if (!order) return jsonResponse({ error: 'Заказ не найден.' }, 404);
      order.status = status;
      await saveOrders(orders);
      return jsonResponse({ order });
    }

    return jsonResponse({ error: 'Not found' }, 404);
  } catch (err) {
    return jsonResponse(
      { error: err instanceof Error ? err.message : 'Внутренняя ошибка сервера' },
      500
    );
  }
}

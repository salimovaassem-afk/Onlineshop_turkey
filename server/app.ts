import express, { NextFunction, Request, Response } from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import type { Order, OrderStatus, Product } from '../src/types';
import {
  getOrders,
  getProducts,
  getUploadsDir,
  isCloudDbConfigured,
  saveOrders,
  saveProducts,
} from './storage';

const ADMIN_LOGIN_VALUE = process.env.ADMIN_LOGIN || 'assemoklifesalimova';
const ADMIN_PASSWORD_VALUE = process.env.ADMIN_PASSWORD || 'assemok482689!';
const TOKEN_SECRET =
  process.env.ADMIN_TOKEN_SECRET ||
  crypto.createHmac('sha256', ADMIN_PASSWORD_VALUE).update(ADMIN_LOGIN_VALUE).digest('hex');
const TELEGRAM_CHAT_ID = (process.env.TELEGRAM_CHAT_ID || '1113226607').trim();

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function formatKztServer(amount: number): string {
  return `${new Intl.NumberFormat('ru-RU').format(Math.round(amount))} ₸`;
}

async function sendTelegramText(htmlText: string): Promise<{ ok: boolean; error?: string }> {
  const token = (process.env.TELEGRAM_BOT_TOKEN || '').trim();
  if (!token) {
    return { ok: false, error: 'TELEGRAM_BOT_TOKEN не настроен в Secrets / Environment Variables.' };
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
    return { ok: false, error: err instanceof Error ? err.message : 'Ошибка запроса к Telegram API' };
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

  const result = await sendTelegramText(lines.join('\n'));
  if (!result.ok) {
    console.warn('Telegram notification skipped/failed:', result.error);
  }
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf-8');
  const bufB = Buffer.from(b, 'utf-8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function createAdminToken(login: string): string {
  const payload = Buffer.from(
    JSON.stringify({
      sub: login,
      exp: Date.now() + 24 * 60 * 60 * 1000,
    }),
    'utf-8'
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function verifyAdminToken(token: string): boolean {
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

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (!token || !verifyAdminToken(token)) {
    res.status(401).json({ error: 'Требуется авторизация администратора' });
    return;
  }
  next();
}

export function createApiApp() {
  const app = express();
  app.use(express.json({ limit: '6mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      ok: true,
      storage: isCloudDbConfigured() ? 'kv_cloud' : process.env.VERCEL ? 'tmp_fallback' : 'local_file',
    });
  });

  // Public: list products (newest first)
  app.get('/api/products', async (_req: Request, res: Response) => {
    try {
      const products = await getProducts();
      const sorted = [...products].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      res.json({ products: sorted });
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Ошибка загрузки товаров' });
    }
  });

  // Public: submit customer order
  app.post('/api/orders', async (req: Request, res: Response) => {
    try {
      const { customerName, customerPhone, city, address, deliveryMethod, comment, items } =
        req.body ?? {};
      if (!customerName || !customerPhone || !Array.isArray(items) || items.length === 0) {
        res.status(400).json({ error: 'Заполните имя, телефон и выберите хотя бы один товар.' });
        return;
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
        res.status(400).json({ error: 'Выбранные товары не найдены в каталоге.' });
        return;
      }

      const orders = await getOrders();
      const totalGoodsKzt = validItems.reduce((sum, item) => sum + item.priceKzt * item.quantity, 0);
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
      res.status(201).json({ order: newOrder });
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Ошибка оформления заказа' });
    }
  });

  // Admin: authenticate
  app.post('/api/admin/login', (req: Request, res: Response) => {
    const login = String(req.body?.login ?? '').trim();
    const password = String(req.body?.password ?? '');
    if (!login || !password) {
      res.status(400).json({ error: 'Введите логин и пароль.' });
      return;
    }
    if (!safeEqual(login, ADMIN_LOGIN_VALUE) || !safeEqual(password, ADMIN_PASSWORD_VALUE)) {
      res.status(401).json({ error: 'Неверный логин или пароль.' });
      return;
    }
    const token = createAdminToken(login);
    res.json({ token });
  });

  app.get('/api/admin/verify', requireAdmin, (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  // Admin: image upload (on serverless/cloud DB stores compact compressed data URL; locally saves file too)
  app.post('/api/admin/upload', requireAdmin, (req: Request, res: Response) => {
    const { dataUrl, filename } = req.body ?? {};
    if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) {
      res.status(400).json({ error: 'Некорректный формат изображения.' });
      return;
    }
    const match = dataUrl.match(/^data:image\/(png|jpeg|jpg|webp|gif);base64,(.+)$/i);
    if (!match) {
      res.status(400).json({ error: 'Поддерживаются форматы JPG, PNG, WEBP.' });
      return;
    }
    const buffer = Buffer.from(match[2], 'base64');
    if (buffer.length > 2 * 1024 * 1024) {
      res.status(400).json({ error: 'Размер изображения после сжатия не должен превышать 2 МБ.' });
      return;
    }

    // In cloud KV or serverless mode, return the compressed data URL directly so it persists globally without local disk
    if (isCloudDbConfigured() || process.env.VERCEL) {
      res.status(201).json({ imageUrl: dataUrl });
      return;
    }

    const ext = match[1].toLowerCase() === 'jpeg' ? 'jpg' : match[1].toLowerCase();
    const safeBase =
      String(filename || 'product')
        .replace(/[^a-zA-Z0-9_-]/g, '')
        .slice(0, 24) || 'product';
    const outName = `${safeBase}-${Date.now()}-${crypto.randomBytes(3).toString('hex')}.${ext}`;
    fs.writeFileSync(path.join(getUploadsDir(), outName), buffer);
    res.status(201).json({ imageUrl: `/uploads/${outName}` });
  });

  // Admin: create product
  app.post('/api/admin/products', requireAdmin, async (req: Request, res: Response) => {
    try {
      const body = req.body ?? {};
      const title = String(body.title ?? '').trim();
      const priceKzt = Number(body.priceKzt);
      const sizes = Array.isArray(body.sizes)
        ? body.sizes.map((s: unknown) => String(s).trim()).filter(Boolean)
        : [];

      if (!title || !Number.isFinite(priceKzt) || priceKzt <= 0 || sizes.length === 0) {
        res.status(400).json({ error: 'Укажите название, цену в тенге и хотя бы один размер.' });
        return;
      }

      const allowedCategories = ['clothing', 'footwear', 'outerwear', 'accessories'];
      const allowedAudiences = ['women', 'men', 'kids'];
      const category = allowedCategories.includes(body.category) ? body.category : 'clothing';
      const audience = allowedAudiences.includes(body.audience) ? body.audience : 'women';
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
      res.status(201).json({ product });
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Ошибка создания товара' });
    }
  });

  // Admin: update product
  app.put('/api/admin/products/:id', requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const products = await getProducts();
      const idx = products.findIndex((p) => p.id === id);
      if (idx === -1) {
        res.status(404).json({ error: 'Товар не найден.' });
        return;
      }

      const existing = products[idx];
      const body = req.body ?? {};
      const title = String(body.title ?? existing.title).trim();
      const priceKzt = Number(body.priceKzt ?? existing.priceKzt);
      const sizes = Array.isArray(body.sizes)
        ? body.sizes.map((s: unknown) => String(s).trim()).filter(Boolean)
        : existing.sizes;

      if (!title || !Number.isFinite(priceKzt) || priceKzt <= 0 || sizes.length === 0) {
        res.status(400).json({ error: 'Проверьте название, цену и размеры товара.' });
        return;
      }

      const updated: Product = {
        ...existing,
        title: title.slice(0, 140),
        category: body.category || existing.category,
        audience: body.audience || existing.audience,
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
      res.json({ product: updated });
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Ошибка обновления товара' });
    }
  });

  // Admin: delete product
  app.delete('/api/admin/products/:id', requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const products = await getProducts();
      const nextProducts = products.filter((p) => p.id !== id);
      if (nextProducts.length === products.length) {
        res.status(404).json({ error: 'Товар не найден.' });
        return;
      }
      await saveProducts(nextProducts);
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Ошибка удаления товара' });
    }
  });

  // Admin: list orders
  app.get('/api/admin/orders', requireAdmin, async (_req: Request, res: Response) => {
    try {
      const orders = await getOrders();
      res.json({ orders });
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Ошибка загрузки заказов' });
    }
  });

  // Admin: check Telegram & DB status
  app.get('/api/admin/telegram-status', requireAdmin, (_req: Request, res: Response) => {
    res.json({
      configured: Boolean((process.env.TELEGRAM_BOT_TOKEN || '').trim()),
      chatId: TELEGRAM_CHAT_ID,
      cloudDbConfigured: isCloudDbConfigured(),
    });
  });

  // Admin: send test notification to Telegram
  app.post('/api/admin/telegram-test', requireAdmin, async (_req: Request, res: Response) => {
    const result = await sendTelegramText(
      `✅ <b>ASSEMOK:</b> уведомления о новых заказах из корзины подключены (чат ${escapeHtml(
        TELEGRAM_CHAT_ID
      )}).`
    );
    if (!result.ok) {
      res.status(400).json({ error: result.error });
      return;
    }
    res.json({ ok: true });
  });

  // Admin: update order status
  app.patch('/api/admin/orders/:id', requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const status = req.body?.status as OrderStatus;
      const allowed: OrderStatus[] = [
        'new',
        'goods_paid',
        'purchased_istanbul',
        'shipped',
        'delivered',
        'cancelled',
      ];
      if (!allowed.includes(status)) {
        res.status(400).json({ error: 'Некорректный статус заказа.' });
        return;
      }
      const orders = await getOrders();
      const order = orders.find((o) => o.id === id);
      if (!order) {
        res.status(404).json({ error: 'Заказ не найден.' });
        return;
      }
      order.status = status;
      await saveOrders(orders);
      res.json({ order });
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Ошибка обновления заказа' });
    }
  });

  return app;
}

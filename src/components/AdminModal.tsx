import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import {
  Eye,
  EyeOff,
  Lock,
  LogOut,
  Pencil,
  Plus,
  Send,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import {
  ACCESSORY_SIZES,
  APPAREL_SIZES,
  FOOTWEAR_SIZES,
  KIDS_SIZES,
  Language,
  Order,
  OrderStatus,
  Product,
  ProductAudience,
  ProductAvailability,
  ProductCategory,
} from '../types';
import { COPY } from '../lib/i18n';
import { formatKzt } from '../lib/format';
import { ProductImage } from './ProductImage';

interface AdminModalProps {
  language: Language;
  isOpen: boolean;
  products: Product[];
  onClose: () => void;
  onProductsChanged: () => Promise<void>;
}

const TOKEN_STORAGE_KEY = 'assemok_admin_token';

const ORDER_STATUSES: OrderStatus[] = [
  'new',
  'goods_paid',
  'purchased_istanbul',
  'shipped',
  'delivered',
  'cancelled',
];

export function AdminModal({
  language,
  isOpen,
  products,
  onClose,
  onProductsChanged,
}: AdminModalProps) {
  const t = COPY[language];

  const [token, setToken] = useState<string>(() => {
    try {
      return localStorage.getItem(TOKEN_STORAGE_KEY) || '';
    } catch {
      return '';
    }
  });
  const [verified, setVerified] = useState(false);

  // Login form state — intentionally empty with zero visible defaults or hints
  const [loginInput, setLoginInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  // Admin workspace state
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [telegramStatus, setTelegramStatus] = useState<{
    configured: boolean;
    chatId: string;
  } | null>(null);
  const [testingTelegram, setTestingTelegram] = useState(false);
  const [telegramFeedback, setTelegramFeedback] = useState<{
    type: 'ok' | 'err';
    text: string;
  } | null>(null);

  // Product editor state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Exclude<ProductCategory, 'all'>>('clothing');
  const [audience, setAudience] = useState<Exclude<ProductAudience, 'all'>>('women');
  const [priceKzt, setPriceKzt] = useState('');
  const [color, setColor] = useState('');
  const [availability, setAvailability] = useState<ProductAvailability>('preorder_istanbul');
  const [origin, setOrigin] = useState('Стамбул, Турция');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [sizes, setSizes] = useState<string[]>(['S', 'M', 'L']);
  const [customSize, setCustomSize] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);
  const [productFeedback, setProductFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(
    null
  );
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (!token) {
      setVerified(false);
      return;
    }
    fetch('/api/admin/verify', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.ok) {
          setVerified(true);
        } else {
          setVerified(false);
          setToken('');
          localStorage.removeItem(TOKEN_STORAGE_KEY);
        }
      })
      .catch(() => setVerified(false));
  }, [isOpen, token]);

  useEffect(() => {
    if (!isOpen || !verified || activeTab !== 'orders' || !token) return;
    setLoadingOrders(true);
    setTelegramFeedback(null);
    Promise.all([
      fetch('/api/admin/orders', {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => res.json()),
      fetch('/api/admin/telegram-status', {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => res.json()),
    ])
      .then(([ordersData, tgData]) => {
        if (Array.isArray(ordersData?.orders)) {
          setOrders(ordersData.orders);
        }
        if (tgData && typeof tgData.configured === 'boolean') {
          setTelegramStatus(tgData);
        }
      })
      .finally(() => setLoadingOrders(false));
  }, [isOpen, verified, activeTab, token]);

  const handleTestTelegram = async () => {
    if (!token) return;
    setTestingTelegram(true);
    setTelegramFeedback(null);
    try {
      const res = await fetch('/api/admin/telegram-test', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Не удалось отправить сообщение.');
      }
      setTelegramFeedback({
        type: 'ok',
        text: 'Тестовое уведомление отправлено в Telegram.',
      });
    } catch (err) {
      setTelegramFeedback({
        type: 'err',
        text: err instanceof Error ? err.message : 'Ошибка отправки в Telegram.',
      });
    } finally {
      setTestingTelegram(false);
    }
  };

  if (!isOpen) return null;

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoggingIn(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: loginInput, password: passwordInput }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Ошибка входа.');
      }
      localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
      setToken(data.token);
      setVerified(true);
      setLoginInput('');
      setPasswordInput('');
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Неверные данные.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken('');
    setVerified(false);
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setCategory('clothing');
    setAudience('women');
    setPriceKzt('');
    setColor('');
    setAvailability('preorder_istanbul');
    setOrigin('Стамбул, Турция');
    setDescription('');
    setImageUrl('');
    setSizes(['S', 'M', 'L']);
    setCustomSize('');
    setProductFeedback(null);
  };

  const startEditing = (p: Product) => {
    setEditingId(p.id);
    setTitle(p.title);
    setCategory(p.category);
    setAudience(p.audience);
    setPriceKzt(String(p.priceKzt));
    setColor(p.color || '');
    setAvailability(p.availability);
    setOrigin(p.origin || 'Стамбул, Турция');
    setDescription(p.description || '');
    setImageUrl(p.imageUrl);
    setSizes(p.sizes);
    setProductFeedback(null);
  };

  const toggleSize = (sz: string) => {
    setSizes((prev) => (prev.includes(sz) ? prev.filter((x) => x !== sz) : [...prev, sz]));
  };

  const addCustomSize = () => {
    const clean = customSize.trim();
    if (!clean) return;
    if (!sizes.includes(clean)) {
      setSizes((prev) => [...prev, clean]);
    }
    setCustomSize('');
  };

  const compressImageToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const objectUrl = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const maxSide = 900;
        let { width, height } = img;
        if (width > maxSide || height > maxSide) {
          if (width >= height) {
            height = Math.round((height * maxSide) / width);
            width = maxSide;
          } else {
            width = Math.round((width * maxSide) / height);
            height = maxSide;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(new Error('Не удалось прочитать файл.'));
          reader.readAsDataURL(file);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Не удалось обработать изображение.'));
      };
      img.src = objectUrl;
    });
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    setProductFeedback(null);
    try {
      const dataUrl = await compressImageToDataUrl(file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ dataUrl, filename: file.name }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Не удалось загрузить фото.');
      }
      setImageUrl(data.imageUrl);
    } catch (err) {
      setProductFeedback({
        type: 'err',
        text: err instanceof Error ? err.message : 'Ошибка загрузки изображения.',
      });
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleSaveProduct = async (e: FormEvent) => {
    e.preventDefault();
    setProductFeedback(null);

    const parsedPrice = Number(priceKzt);
    if (!title.trim() || !Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setProductFeedback({ type: 'err', text: 'Укажите название и корректную цену в тенге.' });
      return;
    }
    if (sizes.length === 0) {
      setProductFeedback({ type: 'err', text: 'Выберите хотя бы один размер.' });
      return;
    }

    setSavingProduct(true);
    try {
      const endpoint = editingId ? `/api/admin/products/${editingId}` : '/api/admin/products';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          category,
          audience,
          priceKzt: parsedPrice,
          sizes,
          color: color.trim(),
          availability,
          origin: origin.trim() || 'Стамбул, Турция',
          description: description.trim(),
          imageUrl: imageUrl.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Ошибка сохранения товара.');
      }
      await onProductsChanged();
      const wasEditing = Boolean(editingId);
      resetForm();
      setProductFeedback({
        type: 'ok',
        text: wasEditing
          ? 'Товар обновлён и сразу отображается в каталоге.'
          : 'Новый товар добавлен и уже виден на главном экране.',
      });
    } catch (err) {
      setProductFeedback({
        type: 'err',
        text: err instanceof Error ? err.message : 'Не удалось сохранить товар.',
      });
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      setConfirmDeleteId(null);
      if (editingId === id) resetForm();
      await onProductsChanged();
    } catch {
      // ignore transient error
    }
  };

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (res.ok && data.order) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? data.order : o)));
      }
    } catch {
      // ignore
    }
  };

  const presetSizes =
    category === 'footwear'
      ? FOOTWEAR_SIZES
      : category === 'accessories'
        ? ACCESSORY_SIZES
        : audience === 'kids'
          ? KIDS_SIZES
          : APPAREL_SIZES;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-[2px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Панель администратора"
    >
      <div
        className="bg-[#FAF9F7] border border-[#E5E2DC] rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-white border-b border-[#E5E2DC] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Lock className="w-4 h-4 text-[#8C6239]" />
            <h2 className="font-display text-2xl font-semibold text-[#171615]">
              Панель администратора
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {verified && (
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#57534E] hover:text-[#171615] hover:bg-[#EFECE6] transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Выйти</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Закрыть админку"
              className="p-2 rounded-lg text-[#68645E] hover:text-[#171615] hover:bg-[#EFECE6] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        {!verified ? (
          <div className="p-8 sm:p-12 flex items-center justify-center">
            <form
              onSubmit={handleLogin}
              autoComplete="off"
              className="w-full max-w-sm space-y-5 bg-white p-6 sm:p-8 rounded-2xl border border-[#E5E2DC]"
            >
              <div>
                <h3 className="font-display text-2xl font-semibold text-[#171615] mb-1">
                  Вход в кабинет
                </h3>
                <p className="text-xs text-[#68645E]">
                  Введите логин и пароль администратора
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#171615] mb-1.5">
                  Логин
                </label>
                <input
                  type="text"
                  required
                  autoComplete="off"
                  value={loginInput}
                  onChange={(e) => setLoginInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF9F7] border border-[#D6D1C8] rounded-lg text-sm text-[#171615] focus:outline-none focus:border-[#171615]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#171615] mb-1.5">
                  Пароль
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2.5 bg-[#FAF9F7] border border-[#D6D1C8] rounded-lg text-sm text-[#171615] focus:outline-none focus:border-[#171615]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#68645E] hover:text-[#171615] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={loggingIn}
                className="w-full bg-[#1C1B19] text-[#FAF9F7] py-3 rounded-lg text-sm font-medium hover:bg-[#33312E] disabled:opacity-60 transition-colors cursor-pointer"
              >
                {loggingIn ? 'Проверка...' : 'Войти'}
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Admin Tabs */}
            <div className="flex items-center gap-2 border-b border-[#E5E2DC] pb-4">
              <button
                type="button"
                onClick={() => setActiveTab('products')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  activeTab === 'products'
                    ? 'bg-[#1C1B19] text-[#FAF9F7]'
                    : 'bg-white border border-[#E5E2DC] text-[#57534E] hover:text-[#171615]'
                }`}
              >
                Товары ({products.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  activeTab === 'orders'
                    ? 'bg-[#1C1B19] text-[#FAF9F7]'
                    : 'bg-white border border-[#E5E2DC] text-[#57534E] hover:text-[#171615]'
                }`}
              >
                Заказы ({orders.length})
              </button>
            </div>

            {activeTab === 'products' ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left: Add / Edit Product Form */}
                <form
                  onSubmit={handleSaveProduct}
                  className="lg:col-span-5 bg-white border border-[#E5E2DC] rounded-xl p-5 space-y-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base font-semibold text-[#171615]">
                      {editingId ? 'Редактировать товар' : 'Добавить новый товар'}
                    </h3>
                    {editingId && (
                      <button
                        type="button"
                        onClick={resetForm}
                        className="text-xs text-[#8C6239] hover:text-[#171615] underline cursor-pointer"
                      >
                        Отмена
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#171615] mb-1">
                      Название товара *
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Например: Кожаная куртка Стамбул"
                      className="w-full px-3 py-2 bg-[#FAF9F7] border border-[#D6D1C8] rounded-lg text-sm focus:outline-none focus:border-[#171615]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#171615] mb-1">
                        Категория
                      </label>
                      <select
                        value={category}
                        onChange={(e) =>
                          setCategory(e.target.value as Exclude<ProductCategory, 'all'>)
                        }
                        className="w-full px-3 py-2 bg-[#FAF9F7] border border-[#D6D1C8] rounded-lg text-sm focus:outline-none focus:border-[#171615]"
                      >
                        <option value="clothing">Одежда</option>
                        <option value="footwear">Обувь</option>
                        <option value="outerwear">Верхняя одежда</option>
                        <option value="accessories">Сумки и аксессуары</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#171615] mb-1">
                        Раздел
                      </label>
                      <select
                        value={audience}
                        onChange={(e) =>
                          setAudience(e.target.value as Exclude<ProductAudience, 'all'>)
                        }
                        className="w-full px-3 py-2 bg-[#FAF9F7] border border-[#D6D1C8] rounded-lg text-sm focus:outline-none focus:border-[#171615]"
                      >
                        <option value="women">Женское</option>
                        <option value="men">Мужское</option>
                        <option value="kids">Детское</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#171615] mb-1">
                        Цена (₸) *
                      </label>
                      <input
                        type="number"
                        required
                        min={100}
                        step={100}
                        value={priceKzt}
                        onChange={(e) => setPriceKzt(e.target.value)}
                        placeholder="35000"
                        className="w-full px-3 py-2 bg-[#FAF9F7] border border-[#D6D1C8] rounded-lg text-sm tabular-nums focus:outline-none focus:border-[#171615]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#171615] mb-1">
                        Цвет
                      </label>
                      <input
                        type="text"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        placeholder="Чёрный / Беж"
                        className="w-full px-3 py-2 bg-[#FAF9F7] border border-[#D6D1C8] rounded-lg text-sm focus:outline-none focus:border-[#171615]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#171615] mb-1">
                      Наличие
                    </label>
                    <select
                      value={availability}
                      onChange={(e) => setAvailability(e.target.value as ProductAvailability)}
                      className="w-full px-3 py-2 bg-[#FAF9F7] border border-[#D6D1C8] rounded-lg text-sm focus:outline-none focus:border-[#171615]"
                    >
                      <option value="preorder_istanbul">Под заказ · Стамбул</option>
                      <option value="in_stock_atyrau">В наличии · Атырау</option>
                    </select>
                  </div>

                  {/* Sizes */}
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-[#171615]">
                      Размеры *
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {presetSizes.map((sz) => {
                        const active = sizes.includes(sz);
                        return (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => toggleSize(sz)}
                            className={`px-2.5 py-1.5 rounded-md text-xs font-medium tabular-nums transition-colors cursor-pointer ${
                              active
                                ? 'bg-[#1C1B19] text-[#FAF9F7]'
                                : 'bg-[#FAF9F7] border border-[#D6D1C8] text-[#57534E]'
                            }`}
                          >
                            {sz}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customSize}
                        onChange={(e) => setCustomSize(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addCustomSize();
                          }
                        }}
                        placeholder="Свой размер (напр. 42-44)"
                        className="flex-1 px-3 py-1.5 bg-[#FAF9F7] border border-[#D6D1C8] rounded-lg text-xs focus:outline-none focus:border-[#171615]"
                      />
                      <button
                        type="button"
                        onClick={addCustomSize}
                        className="px-3 py-1.5 bg-[#EFECE6] text-[#171615] rounded-lg text-xs font-medium hover:bg-[#E5E2DC] cursor-pointer"
                      >
                        Добавить
                      </button>
                    </div>

                    {sizes.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {sizes.map((sz) => (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => toggleSize(sz)}
                            title="Нажмите чтобы убрать"
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#F1EFEA] border border-[#D6D1C8] rounded text-xs text-[#171615] cursor-pointer"
                          >
                            <span>{sz}</span>
                            <X className="w-3 h-3" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Photo upload or URL */}
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-[#171615]">
                      Фотография товара
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#EFECE6] hover:bg-[#E5E2DC] text-[#171615] rounded-lg text-xs font-medium cursor-pointer transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploadingImage ? 'Загрузка...' : 'Загрузить с устройства'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                      {imageUrl && (
                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-[#E5E2DC] shrink-0">
                          <ProductImage
                            src={imageUrl}
                            alt="Предпросмотр"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="Или вставьте ссылку на фото (https://...)"
                      className="w-full px-3 py-2 bg-[#FAF9F7] border border-[#D6D1C8] rounded-lg text-xs focus:outline-none focus:border-[#171615]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#171615] mb-1">
                      Описание
                    </label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Состав ткани, посадка, производитель в Стамбуле..."
                      className="w-full px-3 py-2 bg-[#FAF9F7] border border-[#D6D1C8] rounded-lg text-sm focus:outline-none focus:border-[#171615]"
                    />
                  </div>

                  {productFeedback && (
                    <div
                      className={`p-3 rounded-lg text-xs border ${
                        productFeedback.type === 'ok'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          : 'bg-red-50 border-red-200 text-red-800'
                      }`}
                    >
                      {productFeedback.text}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={savingProduct || uploadingImage}
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#1C1B19] text-[#FAF9F7] py-3 rounded-lg text-sm font-medium hover:bg-[#33312E] disabled:opacity-60 transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>
                      {savingProduct
                        ? 'Сохранение...'
                        : editingId
                          ? 'Сохранить изменения'
                          : 'Опубликовать товар на главном экране'}
                    </span>
                  </button>
                </form>

                {/* Right: Product List */}
                <div className="lg:col-span-7 space-y-3">
                  <h3 className="text-base font-semibold text-[#171615]">
                    Опубликованные товары ({products.length})
                  </h3>

                  <div className="space-y-3">
                    {products.map((product) => (
                      <div
                        key={product.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3.5 bg-white border border-[#E5E2DC] rounded-xl"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-[#EFECE6] shrink-0">
                            <ProductImage
                              src={product.imageUrl}
                              alt={product.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs text-[#68645E]">
                              {t.audiences[product.audience]} · {t.categories[product.category]}
                            </div>
                            <div className="text-sm font-semibold text-[#171615] truncate">
                              {product.title}
                            </div>
                            <div className="text-xs text-[#57534E] tabular-nums mt-0.5">
                              {formatKzt(product.priceKzt)} · Размеры: {product.sizes.join(', ')}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => startEditing(product)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#FAF9F7] border border-[#D6D1C8] text-[#171615] hover:border-[#171615] cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>Изменить</span>
                          </button>

                          {confirmDeleteId === product.id ? (
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleDeleteProduct(product.id)}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-700 text-white hover:bg-red-800 cursor-pointer"
                              >
                                Удалить?
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-2 py-1.5 rounded-lg text-xs text-[#68645E] hover:text-[#171615] cursor-pointer"
                              >
                                Отмена
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(product.id)}
                              aria-label="Удалить товар"
                              className="p-2 rounded-lg text-[#68645E] hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-white border border-[#E5E2DC] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-xs text-[#57534E] space-y-0.5">
                    <div className="font-semibold text-sm text-[#171615]">
                      Уведомления о заказах в Telegram (чат {telegramStatus?.chatId || '1113226607'})
                    </div>
                    <div>
                      {telegramStatus?.configured
                        ? 'Бот подключён — новые заказы из корзины отправляются автоматически.'
                        : 'Добавьте токен бота как секрет TELEGRAM_BOT_TOKEN в настройках Secrets проекта.'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleTestTelegram}
                    disabled={testingTelegram}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-[#1C1B19] text-[#FAF9F7] hover:bg-[#33312E] disabled:opacity-60 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{testingTelegram ? 'Отправка...' : 'Проверить Telegram'}</span>
                  </button>
                </div>

                {telegramFeedback && (
                  <div
                    className={`p-3 rounded-lg text-xs border ${
                      telegramFeedback.type === 'ok'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : 'bg-red-50 border-red-200 text-red-800'
                    }`}
                  >
                    {telegramFeedback.text}
                  </div>
                )}

                {loadingOrders ? (
                  <p className="text-sm text-[#68645E]">Загрузка заказов...</p>
                ) : orders.length === 0 ? (
                  <div className="p-10 text-center bg-white border border-[#E5E2DC] rounded-xl text-sm text-[#68645E]">
                    Заказов с сайта пока нет.
                  </div>
                ) : (
                  orders.map((order) => (
                    <div
                      key={order.id}
                      className="p-5 bg-white border border-[#E5E2DC] rounded-xl space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F1EFEA]">
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-[#171615] tabular-nums">
                              {order.orderNumber}
                            </span>
                            <span className="text-xs text-[#68645E] tabular-nums">
                              {new Date(order.createdAt).toLocaleString('ru-RU')}
                            </span>
                          </div>
                          <div className="text-sm text-[#57534E] mt-1">
                            {order.customerName} · {order.customerPhone} ·{' '}
                            {order.deliveryMethod === 'atyrau'
                              ? 'По г. Атырау'
                              : `Почта РК (${order.city})`}
                            {order.address ? ` · ${order.address}` : ''}
                          </div>
                        </div>

                        <select
                          value={order.status}
                          onChange={(e) =>
                            handleStatusChange(order.id, e.target.value as OrderStatus)
                          }
                          className="px-3 py-2 bg-[#FAF9F7] border border-[#D6D1C8] rounded-lg text-xs font-medium text-[#171615] cursor-pointer"
                        >
                          {ORDER_STATUSES.map((st) => (
                            <option key={st} value={st}>
                              {t.orderStatuses[st]}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1 text-sm">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between gap-4">
                            <span className="text-[#171615]">
                              {item.title} — размер {item.size} × {item.quantity}
                            </span>
                            <span className="font-medium tabular-nums">
                              {formatKzt(item.priceKzt * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {order.comment && (
                        <p className="text-xs text-[#68645E]">
                          Комментарий: {order.comment}
                        </p>
                      )}

                      <div className="flex justify-between pt-2 border-t border-[#F1EFEA] text-sm font-semibold text-[#171615]">
                        <span>Итого за товар</span>
                        <span className="tabular-nums">{formatKzt(order.totalGoodsKzt)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

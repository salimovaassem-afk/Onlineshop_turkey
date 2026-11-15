import { FormEvent, useState } from 'react';
import { Check, Copy, MessageCircle, Minus, Plus, Trash2, X } from 'lucide-react';
import {
  CartItem,
  DeliveryMethod,
  Language,
  Order,
  STORE_CONTACT,
} from '../types';
import { COPY } from '../lib/i18n';
import {
  buildCartOrderWhatsAppMessage,
  buildWhatsAppUrl,
  formatKzt,
} from '../lib/format';
import { ProductImage } from './ProductImage';

interface CartDrawerProps {
  language: Language;
  isOpen: boolean;
  items: CartItem[];
  onClose: () => void;
  onUpdateQty: (productId: string, size: string, delta: number) => void;
  onRemoveItem: (productId: string, size: string) => void;
  onClearCart: () => void;
}

export function CartDrawer({
  language,
  isOpen,
  items,
  onClose,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
}: CartDrawerProps) {
  const t = COPY[language];

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('atyrau');
  const [city, setCity] = useState('Атырау');
  const [address, setAddress] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [copiedKaspi, setCopiedKaspi] = useState(false);

  if (!isOpen) return null;

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.priceKzt * item.quantity,
    0
  );

  const handleCopyKaspi = async () => {
    try {
      await navigator.clipboard.writeText(STORE_CONTACT.kaspiNumber);
      setCopiedKaspi(true);
      setTimeout(() => setCopiedKaspi(false), 2000);
    } catch {
      setCopiedKaspi(false);
    }
  };

  const handleDeliveryChange = (method: DeliveryMethod) => {
    setDeliveryMethod(method);
    if (method === 'atyrau' && !city.trim()) {
      setCity('Атырау');
    } else if (method === 'post_kz' && city.trim() === 'Атырау') {
      setCity('');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!customerName.trim() || !customerPhone.trim()) {
      setError('Укажите ваше имя и номер телефона для связи.');
      return;
    }
    if (items.length === 0) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          city: deliveryMethod === 'atyrau' ? city.trim() || 'Атырау' : city.trim(),
          address: address.trim(),
          deliveryMethod,
          comment: comment.trim(),
          items: items.map((i) => ({
            productId: i.product.id,
            size: i.size,
            quantity: i.quantity,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Не удалось оформить заказ.');
      }
      setConfirmedOrder(data.order as Order);
      onClearCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при оформлении заказа.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setConfirmedOrder(null);
    setError('');
    onClose();
  };

  const whatsappConfirmUrl = confirmedOrder
    ? buildWhatsAppUrl(
        buildCartOrderWhatsAppMessage({
          orderNumber: confirmedOrder.orderNumber,
          customerName: confirmedOrder.customerName,
          customerPhone: confirmedOrder.customerPhone,
          city: confirmedOrder.city,
          address: confirmedOrder.address,
          deliveryMethod: confirmedOrder.deliveryMethod,
          comment: confirmedOrder.comment,
          items: confirmedOrder.items,
          totalGoodsKzt: confirmedOrder.totalGoodsKzt,
        })
      )
    : '#';

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/45 backdrop-blur-[2px]"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label={t.cart.title}
    >
      <div
        className="w-full max-w-lg bg-[#FAF9F7] h-full flex flex-col border-l border-[#E5E2DC] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-[#E5E2DC] flex items-center justify-between gap-4 bg-white">
          <h2 className="font-display text-2xl font-semibold text-[#171615]">
            {t.cart.title}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Закрыть корзину"
            className="p-2 rounded-lg text-[#68645E] hover:text-[#171615] hover:bg-[#EFECE6] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {confirmedOrder ? (
            <div className="space-y-6 py-4">
              <div className="p-6 bg-white border border-[#E5E2DC] rounded-xl space-y-3">
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#8C6239]">
                  <Check className="w-4 h-4" />
                  <span>Заказ {confirmedOrder.orderNumber}</span>
                </div>
                <h3 className="font-display text-2xl font-semibold text-[#171615]">
                  {t.cart.orderSuccessTitle}
                </h3>
                <p className="text-sm text-[#57534E] leading-relaxed">
                  {t.cart.orderSuccessDesc}
                </p>

                <div className="pt-3 border-t border-[#F1EFEA] space-y-1.5 text-sm">
                  {confirmedOrder.items.map((item, idx) => (
                    <div key={`${item.productId}-${idx}`} className="flex justify-between gap-3">
                      <span className="text-[#171615]">
                        {item.title} ({item.size}) × {item.quantity}
                      </span>
                      <span className="font-medium tabular-nums shrink-0">
                        {formatKzt(item.priceKzt * item.quantity)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2 border-t border-[#F1EFEA] font-semibold text-[#171615]">
                    <span>{t.cart.subtotalLabel}</span>
                    <span className="tabular-nums">{formatKzt(confirmedOrder.totalGoodsKzt)}</span>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-[#F1EFEA] border border-[#E5E2DC] rounded-xl space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-[#171615]">
                    Kaspi: {STORE_CONTACT.kaspiNumber}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyKaspi}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[#8C6239] hover:text-[#171615] cursor-pointer"
                  >
                    {copiedKaspi ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKaspi ? t.delivery.copied : t.delivery.copyNumber}</span>
                  </button>
                </div>
                <p className="text-xs text-[#57534E] leading-relaxed">
                  {language === 'kk'
                    ? `Назар аударыңыз: қазір сіз тек тауардың өзін төлейсіз. Ыстамбұлдан ${
                        confirmedOrder.city || 'Атырау / Алматы'
                      } қаласына жеткізуді сәлемдеме келгенде нақты салмағы мен қалаңыздың тарифі бойынша бөлек төлейсіз.`
                    : `Обратите внимание: сейчас вы оплачиваете только сам товар. Доставку из Стамбула в ${
                        confirmedOrder.city || 'Алматы / Атырау'
                      } нужно будет оплатить отдельно, когда посылка прибудет — по её точному весу и тарифу вашего города.`}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <a
                  href={whatsappConfirmUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#1C1B19] text-[#FAF9F7] px-5 py-3.5 rounded-lg text-sm font-medium hover:bg-[#33312E] transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{t.cart.sendWhatsapp}</span>
                </a>
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full px-5 py-3 rounded-lg text-sm font-medium text-[#171615] bg-white border border-[#D6D1C8] hover:border-[#171615] transition-colors cursor-pointer"
                >
                  {t.cart.close}
                </button>
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="py-20 text-center space-y-2">
              <p className="font-display text-2xl font-semibold text-[#171615]">
                {t.cart.empty}
              </p>
              <p className="text-sm text-[#68645E]">{t.cart.emptySub}</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Items */}
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={`${item.product.id}-${item.size}`}
                    className="flex gap-4 p-3.5 bg-white border border-[#E5E2DC] rounded-xl"
                  >
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-[#EFECE6] shrink-0">
                      <ProductImage
                        src={item.product.imageUrl}
                        alt={item.product.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-semibold text-[#171615] line-clamp-1">
                            {item.product.title}
                          </h3>
                          <p className="text-xs text-[#68645E] mt-0.5 tabular-nums">
                            {t.cart.size}: {item.size}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.product.id, item.size)}
                          aria-label="Удалить товар"
                          className="p-1 text-[#8A847C] hover:text-red-700 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-2">
                        <div className="inline-flex items-center border border-[#E5E2DC] rounded-lg bg-[#FAF9F7]">
                          <button
                            type="button"
                            onClick={() => onUpdateQty(item.product.id, item.size, -1)}
                            aria-label="Уменьшить количество"
                            className="p-1.5 text-[#57534E] hover:text-[#171615] cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2.5 text-xs font-medium tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQty(item.product.id, item.size, 1)}
                            aria-label="Увеличить количество"
                            className="p-1.5 text-[#57534E] hover:text-[#171615] cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <span className="text-sm font-semibold text-[#171615] tabular-nums">
                          {formatKzt(item.product.priceKzt * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Subtotal & Kaspi Terms */}
              <div className="p-4 bg-[#F1EFEA] border border-[#E5E2DC] rounded-xl space-y-2.5">
                <div className="flex items-center justify-between text-base font-semibold text-[#171615]">
                  <span>{t.cart.subtotalLabel}</span>
                  <span className="tabular-nums">{formatKzt(subtotal)}</span>
                </div>
                <p className="text-xs text-[#57534E] leading-relaxed">
                  {language === 'kk'
                    ? `Назар аударыңыз: қазір сіз тек тауардың өзін төлейсіз. Ыстамбұлдан ${
                        city.trim() || 'Алматы / Атырау'
                      } қаласына жеткізуді сәлемдеме келгенде нақты салмағы мен қалаңыздың тарифі бойынша бөлек төлейсіз.`
                    : `Обратите внимание: сейчас вы оплачиваете только сам товар. Доставку из Стамбула в ${
                        city.trim() || 'Алматы / Атырау'
                      } нужно будет оплатить отдельно, когда посылка прибудет — по её точному весу и тарифу вашего города.`}
                </p>
                <div className="pt-2 border-t border-[#E5E2DC] space-y-1 text-xs text-[#171615]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold">{t.cart.kaspiTitle}</span>
                    <button
                      type="button"
                      onClick={handleCopyKaspi}
                      className="inline-flex items-center gap-1 text-[#8C6239] hover:text-[#171615] font-medium cursor-pointer"
                    >
                      {copiedKaspi ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKaspi ? t.delivery.copied : t.delivery.copyNumber}</span>
                    </button>
                  </div>
                  <p className="text-[#57534E]">{t.cart.kaspiStep1}</p>
                  <p className="text-[#57534E]">
                    {language === 'kk'
                      ? `2. Ыстамбұлдан ${
                          city.trim() || 'Алматы / Атырау'
                        } қаласына жеткізу ақысы сәлемдеме келгенде нақты салмағы мен қала тарифі бойынша бөлек төленеді.`
                      : `2. Доставку из Стамбула в ${
                          city.trim() || 'Алматы / Атырау'
                        } нужно будет оплатить отдельно, когда посылка прибудет — по её точному весу и тарифу вашего города.`}
                  </p>
                </div>
              </div>

              {/* Checkout Form */}
              <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#171615] mb-1.5">
                    {t.cart.nameLabel} *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Айгерим"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#D6D1C8] rounded-lg text-sm text-[#171615] focus:outline-none focus:border-[#171615]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#171615] mb-1.5">
                    {t.cart.phoneLabel} *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="8 701 000 00 00"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#D6D1C8] rounded-lg text-sm text-[#171615] focus:outline-none focus:border-[#171615]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#171615] mb-1.5">
                    {t.cart.deliveryMethodLabel}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleDeliveryChange('atyrau')}
                      className={`px-3.5 py-2.5 rounded-lg text-xs font-medium border text-left transition-colors cursor-pointer ${
                        deliveryMethod === 'atyrau'
                          ? 'bg-[#1C1B19] text-[#FAF9F7] border-[#1C1B19]'
                          : 'bg-white text-[#171615] border-[#D6D1C8] hover:border-[#171615]'
                      }`}
                    >
                      {t.cart.methodAtyrau}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeliveryChange('post_kz')}
                      className={`px-3.5 py-2.5 rounded-lg text-xs font-medium border text-left transition-colors cursor-pointer ${
                        deliveryMethod === 'post_kz'
                          ? 'bg-[#1C1B19] text-[#FAF9F7] border-[#1C1B19]'
                          : 'bg-white text-[#171615] border-[#D6D1C8] hover:border-[#171615]'
                      }`}
                    >
                      {t.cart.methodPost}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#171615] mb-1.5">
                      {t.cart.cityLabel}
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Алматы / Астана / Атырау"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#D6D1C8] rounded-lg text-sm text-[#171615] focus:outline-none focus:border-[#171615]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#171615] mb-1.5">
                      {t.cart.addressLabel}
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Улица, дом или индекс"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#D6D1C8] rounded-lg text-sm text-[#171615] focus:outline-none focus:border-[#171615]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#171615] mb-1.5">
                    {t.cart.commentLabel}
                  </label>
                  <textarea
                    rows={2}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-[#D6D1C8] rounded-lg text-sm text-[#171615] focus:outline-none focus:border-[#171615]"
                  />
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#1C1B19] text-[#FAF9F7] px-5 py-3.5 rounded-lg text-sm font-medium hover:bg-[#33312E] disabled:opacity-60 transition-colors cursor-pointer"
                >
                  {submitting ? t.cart.submitting : t.cart.submitOrder}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

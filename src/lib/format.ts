import { DeliveryMethod, STORE_CONTACT } from '../types';

export function formatKzt(amount: number): string {
  return `${new Intl.NumberFormat('ru-RU').format(Math.round(amount))} ₸`;
}

export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${STORE_CONTACT.whatsappDigits}?text=${encodeURIComponent(message)}`;
}

export function buildDirectProductWhatsAppMessage(params: {
  title: string;
  size: string;
  priceKzt: number;
}): string {
  return [
    `Здравствуйте, Асем! Хочу заказать из Турции:`,
    `Товар: ${params.title}`,
    `Размер: ${params.size}`,
    `Цена товара: ${formatKzt(params.priceKzt)}`,
    ``,
    `Оплата только за сам товар на Kaspi (${STORE_CONTACT.kaspiNumber}). Доставку из Стамбула оплачу отдельно при прибытии — по точному весу и тарифу города.`,
  ].join('\n');
}

export function buildCartOrderWhatsAppMessage(params: {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  city: string;
  address: string;
  deliveryMethod: DeliveryMethod;
  comment?: string;
  items: { title: string; size: string; quantity: number; priceKzt: number }[];
  totalGoodsKzt: number;
}): string {
  const lines = [
    `Здравствуйте! Новый заказ #${params.orderNumber}`,
    ``,
    ...params.items.map(
      (item, idx) =>
        `${idx + 1}. ${item.title} — размер ${item.size} × ${item.quantity} (${formatKzt(
          item.priceKzt * item.quantity
        )})`
    ),
    ``,
    `Итого за товар: ${formatKzt(params.totalGoodsKzt)}`,
    `Доставка: ${
      params.deliveryMethod === 'atyrau'
        ? 'По городу Атырау'
        : 'Почта по Казахстану (за счёт клиента)'
    }`,
    `Имя: ${params.customerName}`,
    `Телефон: ${params.customerPhone}`,
    `Город: ${params.city || 'Атырау'}`,
    params.address ? `Адрес: ${params.address}` : '',
    params.comment ? `Комментарий: ${params.comment}` : '',
    ``,
    `Сейчас оплачивается только сам товар на Kaspi: ${STORE_CONTACT.kaspiNumber}. Доставку из Стамбула в ${
      params.city || 'Атырау'
    } оплачивается отдельно при прибытии — по точному весу и тарифу города.`,
  ].filter(Boolean);

  return lines.join('\n');
}

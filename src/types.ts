export type Language = 'ru' | 'kk';

export type ProductCategory =
  | 'all'
  | 'outerwear'
  | 'clothing'
  | 'footwear'
  | 'accessories';

export type ProductAudience = 'all' | 'women' | 'men' | 'kids';

export type ProductAvailability = 'preorder_istanbul' | 'in_stock_atyrau';

export interface Product {
  id: string;
  title: string;
  category: Exclude<ProductCategory, 'all'>;
  audience: Exclude<ProductAudience, 'all'>;
  priceKzt: number;
  sizes: string[];
  color?: string;
  description: string;
  imageUrl: string;
  availability: ProductAvailability;
  origin: string;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  size: string;
  quantity: number;
}

export type DeliveryMethod = 'atyrau' | 'post_kz';

export type OrderStatus =
  | 'new'
  | 'goods_paid'
  | 'purchased_istanbul'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  productId: string;
  title: string;
  size: string;
  quantity: number;
  priceKzt: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  city: string;
  address: string;
  deliveryMethod: DeliveryMethod;
  comment: string;
  items: OrderItem[];
  totalGoodsKzt: number;
  status: OrderStatus;
  createdAt: string;
}

export const APPAREL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const;
export const FOOTWEAR_SIZES = ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44'] as const;
export const KIDS_SIZES = ['98', '104', '110', '116', '122', '128', '134', '140'] as const;
export const ACCESSORY_SIZES = ['One Size'] as const;

export const STORE_CONTACT = {
  brand: 'ASSEMOK',
  kaspiNumber: '87022024120',
  kaspiFormatted: '+7 (702) 202-41-20',
  whatsappDigits: '77022024120',
  instagramHandle: 'assemoklifesalimova',
  instagramUrl: 'https://instagram.com/assemoklifesalimova',
  city: 'Атырау',
  experienceYears: '5+',
} as const;

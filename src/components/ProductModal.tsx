import { useEffect, useState } from 'react';
import { Check, MessageCircle, X } from 'lucide-react';
import { Language, Product } from '../types';
import { COPY } from '../lib/i18n';
import {
  buildDirectProductWhatsAppMessage,
  buildWhatsAppUrl,
  formatKzt,
} from '../lib/format';
import { ProductImage } from './ProductImage';

interface ProductModalProps {
  language: Language;
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, size: string) => void;
}

export function ProductModal({ language, product, onClose, onAddToCart }: ProductModalProps) {
  const t = COPY[language];
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes[0] || 'One Size');
      setJustAdded(false);
    }
  }, [product]);

  if (!product) return null;

  const activeSize = selectedSize || product.sizes[0] || 'One Size';
  const waHref = buildWhatsAppUrl(
    buildDirectProductWhatsAppMessage({
      title: product.title,
      size: activeSize,
      priceKzt: product.priceKzt,
    })
  );

  const handleAdd = () => {
    onAddToCart(product, activeSize);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={product.title}
    >
      <div
        className="bg-[#FAF9F7] border border-[#E5E2DC] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grid grid-cols-1 md:grid-cols-12">
          <div className="md:col-span-6 bg-[#EFECE6]">
            <div className="aspect-[4/3] md:h-full w-full">
              <ProductImage
                src={product.imageUrl}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between gap-6">
            <div>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="text-xs text-[#68645E]">
                  {t.audiences[product.audience]} · {t.categories[product.category]} ·{' '}
                  <span className="text-[#8C6239] font-medium">
                    {t.availability[product.availability]}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Закрыть"
                  className="p-1.5 rounded-lg text-[#68645E] hover:text-[#171615] hover:bg-[#EFECE6] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#171615] leading-tight mb-3">
                {product.title}
              </h2>

              <div className="text-2xl font-semibold text-[#171615] tabular-nums mb-5">
                {formatKzt(product.priceKzt)}
              </div>

              {product.description && (
                <p className="text-sm text-[#57534E] leading-relaxed mb-6">
                  {product.description}
                </p>
              )}

              <div className="space-y-2.5 mb-6">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[#171615]">{t.pdp.selectSizePrompt}</span>
                  {product.color && (
                    <span className="text-[#68645E]">Цвет: {product.color}</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => {
                    const active = activeSize === size;
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-[44px] h-11 px-3.5 rounded-lg text-sm font-medium tabular-nums transition-colors cursor-pointer ${
                          active
                            ? 'bg-[#1C1B19] text-[#FAF9F7]'
                            : 'bg-white border border-[#D6D1C8] text-[#171615] hover:border-[#171615]'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-[#F1EFEA] border border-[#E5E2DC] text-xs text-[#57534E] leading-relaxed">
                <div className="font-medium text-[#171615] mb-1">
                  {t.pdp.origin}: {product.origin}
                </div>
                <div>{t.pdp.deliveryHint}</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={handleAdd}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-[#1C1B19] text-[#FAF9F7] px-5 py-3.5 rounded-lg text-sm font-medium hover:bg-[#33312E] transition-colors cursor-pointer"
              >
                {justAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{t.pdp.addedToast}</span>
                  </>
                ) : (
                  <span>{t.catalog.addToCart}</span>
                )}
              </button>

              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-lg text-sm font-medium text-[#171615] bg-white border border-[#D6D1C8] hover:border-[#171615] transition-colors whitespace-nowrap"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{t.pdp.orderWhatsappDirect}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

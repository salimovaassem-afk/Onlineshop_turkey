import { useMemo, useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import {
  Language,
  Product,
  ProductAudience,
  ProductCategory,
} from '../types';
import { COPY } from '../lib/i18n';
import { formatKzt } from '../lib/format';
import { ProductImage } from './ProductImage';

interface CatalogSectionProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  products: Product[];
  loading: boolean;
  onSelectProduct: (product: Product) => void;
  onQuickAdd: (product: Product, size: string) => void;
}

const CATEGORIES: ProductCategory[] = ['all', 'clothing', 'footwear', 'outerwear', 'accessories'];
const AUDIENCES: ProductAudience[] = ['all', 'women', 'men', 'kids'];

export function CatalogSection({
  language,
  onLanguageChange,
  products,
  loading,
  onSelectProduct,
  onQuickAdd,
}: CatalogSectionProps) {
  const t = COPY[language];

  const [category, setCategory] = useState<ProductCategory>('all');
  const [audience, setAudience] = useState<ProductAudience>('all');
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc'>('newest');
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  const availableSizes = useMemo(() => {
    const sizeSet = new Set<string>();
    for (const product of products) {
      if (category !== 'all' && product.category !== category) continue;
      if (audience !== 'all' && product.audience !== audience) continue;
      for (const s of product.sizes) {
        sizeSet.add(s);
      }
    }
    const order = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44'];
    return Array.from(sizeSet).sort((a, b) => {
      const idxA = order.indexOf(a);
      const idxB = order.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b, 'ru');
    });
  }, [products, category, audience]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = products.filter((p) => {
      if (category !== 'all' && p.category !== category) return false;
      if (audience !== 'all' && p.audience !== audience) return false;
      if (selectedSize !== 'all' && !p.sizes.includes(selectedSize)) return false;
      if (q) {
        const hay = `${p.title} ${p.description} ${p.color || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    if (sortBy === 'price_asc') {
      return [...list].sort((a, b) => a.priceKzt - b.priceKzt);
    }
    if (sortBy === 'price_desc') {
      return [...list].sort((a, b) => b.priceKzt - a.priceKzt);
    }
    return [...list].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [products, category, audience, selectedSize, searchQuery, sortBy]);

  const hasActiveFilters =
    category !== 'all' || audience !== 'all' || selectedSize !== 'all' || searchQuery.trim() !== '';

  const resetAllFilters = () => {
    setCategory('all');
    setAudience('all');
    setSelectedSize('all');
    setSearchQuery('');
    setSortBy('newest');
  };

  return (
    <section id="catalog" className="py-12 sm:py-16 border-b border-[#E5E2DC]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#171615] tracking-tight mb-2">
              {t.catalog.title}
            </h2>
            <p className="text-sm sm:text-base text-[#57534E] max-w-2xl">
              {t.catalog.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <div
              className="inline-flex items-center p-1 bg-[#EFECE6] rounded-lg border border-[#E5E2DC]"
              role="group"
              aria-label="Язык интерфейса"
            >
              <button
                type="button"
                onClick={() => onLanguageChange('ru')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  language === 'ru'
                    ? 'bg-white text-[#171615] shadow-xs'
                    : 'text-[#68645E] hover:text-[#171615]'
                }`}
              >
                РУС
              </button>
              <button
                type="button"
                onClick={() => onLanguageChange('kk')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  language === 'kk'
                    ? 'bg-white text-[#171615] shadow-xs'
                    : 'text-[#68645E] hover:text-[#171615]'
                }`}
              >
                ҚАЗ
              </button>
            </div>
            <span className="text-xs sm:text-sm text-[#68645E] tabular-nums whitespace-nowrap">
              {filteredProducts.length} {t.catalog.countUnit}
            </span>
          </div>
        </div>

        {/* Primary Filter Toolbar */}
        <div className="space-y-4 pb-8 border-b border-[#E5E2DC]">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Category Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
              {CATEGORIES.map((cat) => {
                const active = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setCategory(cat);
                      setSelectedSize('all');
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      active
                        ? 'bg-[#1C1B19] text-[#FAF9F7]'
                        : 'bg-white text-[#57534E] border border-[#E5E2DC] hover:border-[#171615] hover:text-[#171615]'
                    }`}
                  >
                    {t.categories[cat]}
                  </button>
                );
              })}
            </div>

            {/* Search & Sort */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-[#68645E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.catalog.searchPlaceholder}
                  className="w-full pl-10 pr-8 py-2.5 bg-white border border-[#E5E2DC] rounded-lg text-sm text-[#171615] placeholder:text-[#8A847C] focus:outline-none focus:border-[#171615]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Очистить поиск"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#68645E] hover:text-[#171615] cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'newest' | 'price_asc' | 'price_desc')}
                  aria-label="Сортировка"
                  className="flex-1 sm:flex-none px-3.5 py-2.5 bg-white border border-[#E5E2DC] rounded-lg text-sm text-[#171615] focus:outline-none focus:border-[#171615] cursor-pointer"
                >
                  <option value="newest">{t.catalog.sortNewest}</option>
                  <option value="price_asc">{t.catalog.sortPriceAsc}</option>
                  <option value="price_desc">{t.catalog.sortPriceDesc}</option>
                </select>

                <button
                  type="button"
                  onClick={() => setShowFiltersMobile((v) => !v)}
                  className="sm:hidden inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-[#E5E2DC] rounded-lg text-sm font-medium text-[#171615] cursor-pointer"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>{t.catalog.sizeLabel}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Audience & Size Filters */}
          <div className={`${showFiltersMobile ? 'flex' : 'hidden sm:flex'} flex-col md:flex-row md:items-center justify-between gap-4 pt-1`}>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-[#68645E] mr-1">
                {t.catalog.audienceLabel}:
              </span>
              <div className="inline-flex items-center p-1 bg-[#EFECE6] rounded-lg">
                {AUDIENCES.map((aud) => (
                  <button
                    key={aud}
                    type="button"
                    onClick={() => setAudience(aud)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      audience === aud
                        ? 'bg-white text-[#171615] shadow-xs'
                        : 'text-[#68645E] hover:text-[#171615]'
                    }`}
                  >
                    {t.audiences[aud]}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-medium text-[#68645E] mr-1">
                {t.catalog.sizeLabel}:
              </span>
              <button
                type="button"
                onClick={() => setSelectedSize('all')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedSize === 'all'
                    ? 'bg-[#1C1B19] text-[#FAF9F7]'
                    : 'bg-white border border-[#E5E2DC] text-[#57534E] hover:border-[#171615]'
                }`}
              >
                {t.catalog.allSizes}
              </button>
              {availableSizes.map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setSelectedSize(selectedSize === sz ? 'all' : sz)}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-medium tabular-nums transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    selectedSize === sz
                      ? 'bg-[#1C1B19] text-[#FAF9F7]'
                      : 'bg-white border border-[#E5E2DC] text-[#57534E] hover:border-[#171615]'
                  }`}
                >
                  {sz}
                </button>
              ))}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="ml-2 text-xs font-medium text-[#8C6239] hover:text-[#171615] underline underline-offset-4 whitespace-nowrap cursor-pointer"
                >
                  {t.catalog.resetFilters}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 pt-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="animate-pulse space-y-3">
                <div className="aspect-[4/3] bg-[#EFECE6] rounded-xl" />
                <div className="h-3 bg-[#EFECE6] rounded w-1/3" />
                <div className="h-5 bg-[#EFECE6] rounded w-3/4" />
                <div className="h-4 bg-[#EFECE6] rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center max-w-md mx-auto">
            <p className="font-display text-2xl font-semibold text-[#171615] mb-2">
              {t.catalog.emptyTitle}
            </p>
            <p className="text-sm text-[#68645E] mb-6">{t.catalog.emptyDesc}</p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="px-5 py-2.5 bg-[#1C1B19] text-[#FAF9F7] rounded-lg text-sm font-medium hover:bg-[#33312E] transition-colors cursor-pointer"
              >
                {t.catalog.resetFilters}
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 pt-8">
            {filteredProducts.map((product) => (
              <article
                key={product.id}
                className="group flex flex-col bg-white border border-[#E5E2DC] rounded-xl overflow-hidden transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <button
                  type="button"
                  onClick={() => onSelectProduct(product)}
                  className="block w-full aspect-[4/3] overflow-hidden bg-[#EFECE6] cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-[#1C1B19]"
                >
                  <ProductImage
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </button>

                <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex items-center justify-between gap-2 text-xs text-[#68645E] mb-1.5">
                      <span className="truncate">
                        {t.audiences[product.audience]} · {t.categories[product.category]}
                      </span>
                      <span className="shrink-0 text-[#8C6239] font-medium">
                        {t.availability[product.availability]}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectProduct(product)}
                      className="text-left w-full cursor-pointer"
                    >
                      <h3 className="text-base font-semibold text-[#171615] leading-snug line-clamp-2 group-hover:text-[#8C6239] transition-colors">
                        {product.title}
                      </h3>
                    </button>

                    <p className="text-xs text-[#68645E] mt-2 tabular-nums line-clamp-1">
                      {t.catalog.sizeLabel}: {product.sizes.join(', ')}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#F1EFEA]">
                    <span className="text-[17px] font-semibold text-[#171615] tabular-nums whitespace-nowrap">
                      {formatKzt(product.priceKzt)}
                    </span>

                    <div className="flex items-center gap-2">
                      {product.sizes.length === 1 ? (
                        <button
                          type="button"
                          onClick={() => onQuickAdd(product, product.sizes[0])}
                          className="px-4 py-2 bg-[#1C1B19] text-[#FAF9F7] rounded-lg text-xs font-medium hover:bg-[#33312E] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          {t.catalog.addToCart}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onSelectProduct(product)}
                          className="px-4 py-2 bg-[#FAF9F7] text-[#171615] border border-[#D6D1C8] rounded-lg text-xs font-medium hover:border-[#171615] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          {t.catalog.selectSize}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

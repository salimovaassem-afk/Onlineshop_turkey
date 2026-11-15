import { Lock, ShoppingBag } from 'lucide-react';
import { Language } from '../types';
import { COPY } from '../lib/i18n';

interface HeaderProps {
  language: Language;
  cartCount: number;
  onOpenCart: () => void;
  onOpenAdmin: () => void;
}

export function Header({ language, cartCount, onOpenCart, onOpenAdmin }: HeaderProps) {
  const t = COPY[language];

  return (
    <header className="sticky top-0 z-30 bg-[#FAF9F7]/95 backdrop-blur-sm border-b border-[#E5E2DC]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-8">
        <a
          href="#top"
          className="font-display text-2xl sm:text-[26px] font-semibold tracking-tight text-[#171615] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1C1B19]"
        >
          ASSEMOK
        </a>

        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#57534E]">
          <a
            href="#catalog"
            className="hover:text-[#171615] transition-colors whitespace-nowrap shrink-0 py-1 border-b border-transparent hover:border-[#171615]"
          >
            {t.nav.catalog}
          </a>
          <a
            href="#delivery"
            className="hover:text-[#171615] transition-colors whitespace-nowrap shrink-0 py-1 border-b border-transparent hover:border-[#171615]"
          >
            {t.nav.delivery}
          </a>
          <a
            href="#about"
            className="hover:text-[#171615] transition-colors whitespace-nowrap shrink-0 py-1 border-b border-transparent hover:border-[#171615]"
          >
            {t.nav.about}
          </a>
          <button
            type="button"
            onClick={onOpenAdmin}
            className="hover:text-[#171615] transition-colors whitespace-nowrap shrink-0 py-1 border-b border-transparent hover:border-[#171615] cursor-pointer"
          >
            {t.nav.admin}
          </button>
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenAdmin}
            aria-label={t.nav.admin}
            className="md:hidden p-2.5 rounded-lg border border-[#E5E2DC] bg-white text-[#57534E] hover:text-[#171615] transition-colors cursor-pointer"
          >
            <Lock className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onOpenCart}
            className="inline-flex items-center gap-2.5 bg-[#1C1B19] text-[#FAF9F7] px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#33312E] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1C1B19]"
          >
            <ShoppingBag className="w-4 h-4 stroke-[1.75]" />
            <span>{t.nav.cart}</span>
            <span className="tabular-nums text-xs bg-[#FAF9F7]/15 px-1.5 py-0.5 rounded">
              {cartCount}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

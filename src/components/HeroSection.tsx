import { ArrowDownRight } from 'lucide-react';
import { Language } from '../types';
import { COPY } from '../lib/i18n';
import { ProductImage } from './ProductImage';

interface HeroSectionProps {
  language: Language;
}

export function HeroSection({ language }: HeroSectionProps) {
  const t = COPY[language];

  return (
    <section id="top" className="border-b border-[#E5E2DC]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 pt-8 pb-10 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-between py-2">
            <div>
              <p className="text-xs sm:text-sm font-medium tracking-wide text-[#8C6239] mb-4">
                {t.hero.eyebrow}
              </p>
              <h1
                className="font-display text-4xl sm:text-5xl lg:text-[54px] font-semibold text-[#171615] leading-[1.06] tracking-tight mb-6 max-w-xl"
                style={{ textWrap: 'balance' }}
              >
                {t.hero.headline}
              </h1>
              <p className="text-base sm:text-[17px] text-[#57534E] leading-relaxed max-w-xl mb-8">
                {t.hero.subheadline}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#catalog"
                className="inline-flex items-center gap-2 bg-[#1C1B19] text-[#FAF9F7] px-6 py-3.5 rounded-lg text-sm font-medium hover:bg-[#33312E] transition-colors whitespace-nowrap shrink-0"
              >
                <span>{t.hero.ctaPrimary}</span>
                <ArrowDownRight className="w-4 h-4" />
              </a>
              <a
                href="#delivery"
                className="inline-flex items-center px-5 py-3.5 rounded-lg text-sm font-medium text-[#171615] border border-[#D6D1C8] hover:border-[#171615] transition-colors whitespace-nowrap shrink-0"
              >
                {t.hero.ctaSecondary}
              </a>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="w-full aspect-[4/3] lg:h-full lg:min-h-[420px] rounded-xl overflow-hidden bg-[#EFECE6] border border-[#E5E2DC]">
              <ProductImage
                src="/images/hero_istanbul_atelier_1794738819885.jpg"
                alt="Коллекция одежды и обуви из Стамбула ASSEMOK"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-10 pt-8 border-t border-[#E5E2DC]">
          {t.hero.stats.map((stat) => (
            <div key={stat.value} className="space-y-1">
              <div className="font-display text-2xl sm:text-3xl font-semibold text-[#171615] tabular-nums">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-[#68645E] leading-snug">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

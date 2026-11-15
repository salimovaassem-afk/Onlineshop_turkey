import { useState } from 'react';
import { Check, Copy, Instagram, MessageCircle } from 'lucide-react';
import { Language, STORE_CONTACT } from '../types';
import { COPY } from '../lib/i18n';
import { buildWhatsAppUrl } from '../lib/format';

interface DeliverySectionProps {
  language: Language;
}

export function DeliverySection({ language }: DeliverySectionProps) {
  const t = COPY[language];
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(STORE_CONTACT.kaspiNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const whatsappDirectUrl = buildWhatsAppUrl(
    'Здравствуйте, Асем! Хочу уточнить по заказу одежды/обуви из Турции.'
  );

  return (
    <section id="delivery" className="py-14 sm:py-20 border-b border-[#E5E2DC]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
        <div className="max-w-2xl mb-10">
          <p className="text-xs sm:text-sm font-medium text-[#8C6239] mb-2">
            {t.delivery.eyebrow}
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#171615] tracking-tight mb-3">
            {t.delivery.title}
          </h2>
          <p className="text-sm sm:text-base text-[#57534E] leading-relaxed">
            {t.delivery.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {t.delivery.steps.map((step) => (
            <div
              key={step.num}
              className="p-6 bg-white border border-[#E5E2DC] rounded-xl flex flex-col justify-between gap-4"
            >
              <div>
                <div className="font-display text-2xl font-semibold text-[#8C6239] tabular-nums mb-3">
                  {step.num}.
                </div>
                <h3 className="text-lg font-semibold text-[#171615] mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-[#57534E] leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div
          id="about"
          className="p-6 sm:p-8 bg-white border border-[#E5E2DC] rounded-2xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-center"
        >
          <div className="lg:col-span-7 space-y-2">
            <h3 className="font-display text-2xl sm:text-3xl font-semibold text-[#171615]">
              {t.delivery.paymentCardTitle}
            </h3>
            <p className="text-sm text-[#57534E] leading-relaxed max-w-xl">
              {t.delivery.paymentCardDesc}
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[#171615]">
              <span className="font-semibold tabular-nums">
                Kaspi / WhatsApp: {STORE_CONTACT.kaspiNumber}
              </span>
              <a
                href={STORE_CONTACT.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[#8C6239] hover:text-[#171615] font-medium transition-colors"
              >
                <Instagram className="w-4 h-4" />
                <span>@{STORE_CONTACT.instagramHandle}</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col sm:flex-row lg:justify-end gap-3">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-sm font-medium bg-[#FAF9F7] text-[#171615] border border-[#D6D1C8] hover:border-[#171615] transition-colors whitespace-nowrap cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-[#8C6239]" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? t.delivery.copied : t.delivery.copyNumber}</span>
            </button>

            <a
              href={whatsappDirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-sm font-medium bg-[#1C1B19] text-[#FAF9F7] hover:bg-[#33312E] transition-colors whitespace-nowrap"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{t.delivery.whatsappBtn}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

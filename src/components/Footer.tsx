import { Instagram, Lock, MessageCircle } from 'lucide-react';
import { Language, STORE_CONTACT } from '../types';
import { COPY } from '../lib/i18n';
import { buildWhatsAppUrl } from '../lib/format';

interface FooterProps {
  language: Language;
  onOpenAdmin: () => void;
}

export function Footer({ language, onOpenAdmin }: FooterProps) {
  const t = COPY[language];

  return (
    <footer className="bg-[#FAF9F7] py-12">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-[#E5E2DC]">
          <div className="md:col-span-5 space-y-3">
            <div className="font-display text-2xl font-semibold text-[#171615]">
              ASSEMOK
            </div>
            <p className="text-sm text-[#57534E] leading-relaxed max-w-sm">
              {t.footer.tagline}
            </p>
          </div>

          <div className="md:col-span-3 space-y-2.5 text-sm">
            <div className="font-semibold text-[#171615]">{t.footer.contactsTitle}</div>
            <a
              href={buildWhatsAppUrl('Здравствуйте, Асем!')}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[#57534E] hover:text-[#171615] transition-colors tabular-nums"
            >
              <MessageCircle className="w-4 h-4 shrink-0" />
              <span>WhatsApp / Kaspi: {STORE_CONTACT.kaspiNumber}</span>
            </a>
            <a
              href={STORE_CONTACT.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[#57534E] hover:text-[#171615] transition-colors"
            >
              <Instagram className="w-4 h-4 shrink-0" />
              <span>@{STORE_CONTACT.instagramHandle}</span>
            </a>
          </div>

          <div className="md:col-span-4 space-y-2 text-sm">
            <div className="font-semibold text-[#171615]">{t.footer.termsTitle}</div>
            <p className="text-[#57534E]">{t.footer.termsLine1}</p>
            <p className="text-[#57534E]">{t.footer.termsLine2}</p>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#68645E]">
          <span>{t.footer.rights}</span>
          <button
            type="button"
            onClick={onOpenAdmin}
            className="inline-flex items-center gap-1.5 text-[#68645E] hover:text-[#171615] transition-colors cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{t.footer.adminEntry}</span>
          </button>
        </div>
      </div>
    </footer>
  );
}

'use client';

import { usePathname } from 'next/navigation';
import { Phone, MessageCircle, CalendarCheck } from 'lucide-react';
import { PRIMARY_CALL_HREF, PRIMARY_WHATSAPP_BOOKING_URL } from '@/data/centers';

const hiddenPrefixes = ['/admin', '/login', '/profile'];

export default function StickyContactBar() {
  const pathname = usePathname();

  if (hiddenPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-1.5rem)] max-w-md md:max-w-xl">
      <div className="bg-white/95 backdrop-blur-md shadow-xl border border-santaan-sage/30 rounded-2xl p-2 flex items-center justify-between gap-2">
        <a
          href={PRIMARY_WHATSAPP_BOOKING_URL}
          target="_blank"
          rel="noopener noreferrer"
          data-cta-kind="whatsapp"
          data-center="Network"
          data-cta-target={PRIMARY_WHATSAPP_BOOKING_URL}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-xs md:text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          WhatsApp
        </a>

        <a
          href="/#book-consultation"
          data-cta-kind="book"
          data-center="Network"
          data-cta-target="/#book-consultation"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-santaan-amber/30 px-3 py-2 text-xs md:text-sm font-semibold text-santaan-amber hover:bg-santaan-amber/10 transition-colors"
        >
          <CalendarCheck className="w-4 h-4" />
          Book
        </a>

        <a
          href={PRIMARY_CALL_HREF}
          data-cta-kind="call"
          data-center="Network"
          data-cta-target={PRIMARY_CALL_HREF}
          className="inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs md:text-sm font-semibold text-santaan-teal hover:bg-santaan-teal/10 transition-colors"
        >
          <Phone className="w-4 h-4" />
          Call
        </a>
      </div>
    </div>
  );
}

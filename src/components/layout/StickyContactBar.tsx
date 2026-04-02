'use client';

import { usePathname } from 'next/navigation';
import { Phone, MessageCircle, CalendarCheck } from 'lucide-react';
import { PRACTO_BOOKING_URL, PRIMARY_CALL_NUMBER, PRIMARY_WHATSAPP_URL } from '@/data/centers';

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
          href={`tel:${PRIMARY_CALL_NUMBER}`}
          data-cta-kind="call"
          data-center="Bhubaneswar"
          data-cta-target={`tel:${PRIMARY_CALL_NUMBER}`}
          className="inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs md:text-sm font-semibold text-santaan-teal hover:bg-santaan-teal/10 transition-colors"
        >
          <Phone className="w-4 h-4" />
          Call
        </a>

        <a
          href={PRIMARY_WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          data-cta-kind="whatsapp"
          data-center="Bhubaneswar"
          data-cta-target={PRIMARY_WHATSAPP_URL}
          className="inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs md:text-sm font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          WhatsApp
        </a>

        <a
          href={PRACTO_BOOKING_URL}
          target="_blank"
          rel="noopener noreferrer"
          data-cta-kind="book"
          data-center="Network"
          data-cta-target={PRACTO_BOOKING_URL}
          className="inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs md:text-sm font-semibold bg-santaan-amber text-white hover:bg-[#E08E45] transition-colors"
        >
          <CalendarCheck className="w-4 h-4" />
          Book
        </a>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';

type Platform = 'youtube' | 'instagram' | 'facebook';

export interface SocialItem {
  title: string;
  platform: Platform;
  url: string;
  thumb?: string;
}

function ytIdFromUrl(url: string) {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) return u.pathname.replace('/', '');
    if (u.hostname.includes('youtube.com')) return u.searchParams.get('v');
    return null;
  } catch {
    return null;
  }
}

function buildThumb(item: SocialItem) {
  if (item.thumb) return item.thumb;
  if (item.platform === 'youtube') {
    const id = ytIdFromUrl(item.url);
    return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : undefined;
  }
  return undefined;
}

export function SocialCarousel({
  items,
  heading = 'Campaign highlights',
  description = 'Short updates from Santaan IVF on awareness, outcomes, and evidence-led care.',
  sectionId = 'campaign-highlights',
}: {
  items: SocialItem[];
  heading?: string;
  description?: string;
  sectionId?: string;
}) {
  return (
    <section id={sectionId} className="py-16 bg-white">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="mb-6">
          <h3 className="text-xl md:text-2xl font-playfair font-bold text-gray-900">{heading}</h3>
          <p className="text-gray-600 mt-2">{description}</p>
        </div>
        <div className="overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] no-scrollbar">
          <div className="grid grid-flow-col auto-cols-[75%] sm:auto-cols-[45%] md:auto-cols-[30%] gap-4 snap-x snap-mandatory">
            {items.map((it, i) => {
              const thumb = buildThumb(it);
              return (
                <Link
                  key={`${it.platform}-${i}`}
                  href={it.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="snap-start rounded-2xl border border-gray-100 overflow-hidden bg-white hover:border-santaan-teal/40 transition"
                >
                  <div className="relative w-full aspect-video bg-gray-100">
                    {thumb ? (
                      <img src={thumb} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-santaan-sage/30 to-santaan-teal/20" />
                    )}
                  </div>
                  <div className="p-4">
                    <p className="font-semibold text-gray-900 line-clamp-2">{it.title}</p>
                    <p className="text-xs text-gray-600 mt-1 capitalize">{it.platform}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

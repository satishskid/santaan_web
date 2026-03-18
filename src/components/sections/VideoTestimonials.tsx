"use client";

import { useMemo, useState } from 'react';
import { Play } from 'lucide-react';
import Image from 'next/image';

export interface VideoTestimonialItem {
  name: string;
  label: string;
  quote: string;
  videoUrl: string;
  thumbnail?: string;
}

function extractYouTubeId(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtu.be')) {
      return parsed.pathname.replace('/', '') || null;
    }
    if (parsed.hostname.includes('youtube.com')) {
      return parsed.searchParams.get('v') || null;
    }
    return null;
  } catch {
    return null;
  }
}

function extractVimeoId(url: string) {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes('vimeo.com')) return null;
    const parts = parsed.pathname.split('/').filter(Boolean);
    const last = parts[parts.length - 1];
    return last && /^\d+$/.test(last) ? last : null;
  } catch {
    return null;
  }
}

function buildEmbedUrl(videoUrl: string) {
  const yt = extractYouTubeId(videoUrl);
  if (yt) {
    return `https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&rel=0`;
  }
  const vimeo = extractVimeoId(videoUrl);
  if (vimeo) {
    return `https://player.vimeo.com/video/${vimeo}?autoplay=1`;
  }
  return null;
}

function defaultThumbnail(videoUrl: string) {
  const yt = extractYouTubeId(videoUrl);
  if (yt) {
    return `https://i.ytimg.com/vi/${yt}/hqdefault.jpg`;
  }
  return null;
}

function isRemote(src: string) {
  return src.startsWith('http://') || src.startsWith('https://');
}

export function VideoTestimonials({ items }: { items: VideoTestimonialItem[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(items.length > 0 ? 0 : null);

  const active = activeIndex === null ? null : items[activeIndex];
  const embedUrl = useMemo(() => (active ? buildEmbedUrl(active.videoUrl) : null), [active]);

  return (
    <section id="video-testimonials" className="py-24 bg-white">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="text-center mb-14">
          <span className="text-santaan-teal font-medium tracking-wide uppercase text-sm">Videos</span>
          <h2 className="text-3xl md:text-4xl font-playfair font-bold text-gray-900 mt-2">
            Expert explainers from Santaan
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto mt-4">
            Evidence-driven IVF and fertility care with clear, practical guidance from our specialists in Bhubaneswar, Berhampur and Bangalore.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
            {active && embedUrl ? (
              <div className="relative w-full aspect-video bg-black">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={embedUrl}
                  title={`${active.name} · ${active.label}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="w-full aspect-video flex items-center justify-center text-center p-10">
                <div>
                  <p className="text-lg font-semibold text-gray-900">{items.length === 0 ? 'Videos coming soon' : 'Select a video to play'}</p>
                  <p className="text-gray-600 mt-2">
                    {items.length === 0 ? 'Add YouTube/Vimeo links and thumbnails to activate this section.' : 'The video loads only when the user clicks, keeping the homepage light.'}
                  </p>
                </div>
              </div>
            )}

            {active && (
              <div className="p-6 md:p-8 bg-white border-t border-gray-100">
                <p className="text-gray-800 text-lg leading-relaxed italic">“{active.quote}”</p>
                <p className="mt-4 text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">{active.name}</span> · {active.label}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {items.map((item, index) => {
              const thumb = item.thumbnail || defaultThumbnail(item.videoUrl);
              const selected = index === activeIndex;
              return (
                <button
                  key={`${item.name}-${index}`}
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Play video: ${item.name}`}
                  className={`w-full text-left rounded-2xl border transition-colors overflow-hidden bg-white ${
                    selected ? 'border-santaan-teal shadow-md' : 'border-gray-100 hover:border-santaan-teal/40'
                  }`}
                >
                  <div className="flex gap-4 p-4 items-center">
                    <div className="relative w-24 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                      {thumb ? (
                        isRemote(thumb) ? (
                          <img src={thumb} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                        ) : (
                          <Image src={thumb} alt="" fill className="object-cover" sizes="96px" />
                        )
                      ) : (
                        <div className="w-full h-full bg-linear-to-r from-santaan-sage/30 to-santaan-teal/20" />
                      )}
                      <div className="absolute inset-0 bg-black/15 flex items-center justify-center">
                        <span className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center">
                          <Play className="w-4 h-4 text-santaan-teal" />
                        </span>
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{item.name}</p>
                      <p className="text-xs text-gray-600 mt-1 truncate">{item.label}</p>
                      <p className="text-xs text-gray-500 mt-2 [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical] overflow-hidden">
                        {item.quote}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
            {items.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <p className="font-semibold text-gray-900">Add videos later</p>
                <p className="text-sm text-gray-600 mt-2">This is a developer-ready placeholder. A writer can supply links and captions without code changes.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

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

export function VideoTestimonials({ items }: { items: VideoTestimonialItem[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const resolvedActiveIndex = items.length === 0 ? null : (activeIndex ?? 0);
  const active = resolvedActiveIndex === null ? null : items[resolvedActiveIndex];
  const embedUrl = useMemo(() => (active ? buildEmbedUrl(active.videoUrl) : null), [active]);

  return (
    <section id="video-testimonials" className="py-24 bg-white">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="text-center mb-14">
          <span className="text-santaan-teal font-medium tracking-wide uppercase text-sm">Video Testimonials</span>
          <h2 className="text-3xl md:text-4xl font-playfair font-bold text-gray-900 mt-2">
            Real voices. Real journeys.
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto mt-4">
            Watch Santaan stories, doctor explainers, and milestone moments from our journey.
          </p>
        </div>

        <div className="space-y-8">
          <div className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
            {active && embedUrl ? (
              <div className="relative w-full aspect-video bg-black">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={embedUrl}
                  title={`Video testimonial from ${active.name}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="w-full aspect-video flex items-center justify-center text-center p-10">
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    {items.length === 0 ? "Video testimonials coming soon" : "Select a story to play"}
                  </p>
                  <p className="text-gray-600 mt-2">
                    {items.length === 0
                      ? "Add YouTube/Vimeo links and thumbnails to activate this section."
                      : "Choose a Santaan video below to switch the featured story."}
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

          <div>
            {items.length > 0 && (
              <div className="mb-5">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-santaan-teal">
                  More from Santaan
                </p>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {items.map((item, index) => {
              const thumb = item.thumbnail || defaultThumbnail(item.videoUrl);
              const selected = index === resolvedActiveIndex;
              return (
                <button
                  key={`${item.name}-${index}`}
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Play video testimonial: ${item.name}`}
                  className={`w-full text-left rounded-2xl border transition-all overflow-hidden bg-white ${
                    selected ? 'border-santaan-teal shadow-md' : 'border-gray-100 hover:border-santaan-teal/40'
                  }`}
                >
                  <div className="relative aspect-video bg-gray-100">
                    {thumb ? (
                      <Image src={thumb} alt="" fill className="object-cover" sizes="(min-width: 1280px) 280px, (min-width: 768px) 45vw, 100vw" />
                    ) : (
                      <div className="w-full h-full bg-linear-to-r from-santaan-sage/30 to-santaan-teal/20" />
                    )}
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <span className="w-11 h-11 rounded-full bg-white/90 flex items-center justify-center">
                        <Play className="w-5 h-5 text-santaan-teal" />
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="font-semibold text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-600 mt-1">{item.label}</p>
                    <p className="text-sm text-gray-500 mt-3 [display:-webkit-box] [-webkit-line-clamp:3] [-webkit-box-orient:vertical] overflow-hidden">
                      {item.quote}
                    </p>
                  </div>
                </button>
              );
            })}
            {items.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <p className="font-semibold text-gray-900">Add videos later</p>
                <p className="text-sm text-gray-600 mt-2">
                  This is a developer-ready placeholder. A writer can supply links and captions without code changes.
                </p>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

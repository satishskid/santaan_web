import type { SocialItem } from '@/components/sections/SocialCarousel';
import type { VideoTestimonialItem } from '@/components/sections/VideoTestimonials';

const DEFAULT_SANTAAN_CHANNEL_ID = 'UCWzGAaPiWAguNtXlSiYJNLg';

function decodeXml(value: string) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function tagValue(entry: string, tag: string) {
  const match = entry.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
  return match ? decodeXml(match[1].trim()) : '';
}

function htmlToText(value: string) {
  return decodeXml(value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim());
}

function stripEmoji(value: string) {
  return value.replace(/\p{Extended_Pictographic}/gu, '').replace(/\s+/g, ' ').trim();
}

function compactDescription(value: string) {
  const cleaned = stripEmoji(value)
    .replace(/#[^\s]+/g, '')
    .replace(/\+?\d[\d\s-]{7,}\d/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (cleaned.length <= 240) return cleaned;
  const clipped = cleaned.slice(0, 237);
  const lastSpace = clipped.lastIndexOf(' ');
  return `${clipped.slice(0, lastSpace > 160 ? lastSpace : 237).trim()}...`;
}

function formatPublishedDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Latest Santaan video';
  return `Latest YouTube video · ${date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })}`;
}

export async function getLatestSantaanYouTubeVideos(limit = 4): Promise<VideoTestimonialItem[]> {
  const channelId = process.env.SANTAAN_YOUTUBE_CHANNEL_ID || DEFAULT_SANTAAN_CHANNEL_ID;
  const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;

  try {
    const response = await fetch(feedUrl, {
      next: { revalidate: 60 * 60 * 6 },
      headers: { 'user-agent': 'SantaanWebsite/1.0' },
    });
    if (!response.ok) return [];

    const xml = await response.text();
    const entries = [...xml.matchAll(/<entry>[\s\S]*?<\/entry>/g)].slice(0, limit);

    const videos: VideoTestimonialItem[] = [];

    entries.forEach((match) => {
      const entry = match[0];
      const videoId = tagValue(entry, 'yt:videoId');
      const title = stripEmoji(tagValue(entry, 'title'));
      const published = tagValue(entry, 'published');
      const description = compactDescription(htmlToText(tagValue(entry, 'media:description')));

      if (!videoId || !title) return;

      videos.push({
        name: title,
        label: formatPublishedDate(published),
        quote: description || 'Watch the latest Santaan fertility video.',
        videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
        thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      });
    });

    return videos;
  } catch (error) {
    console.error('Santaan YouTube feed fetch failed:', error);
    return [];
  }
}

export function youtubeVideosToSocialItems(items: VideoTestimonialItem[]): SocialItem[] {
  return items.map((item) => ({
    title: item.name,
    platform: 'youtube',
    url: item.videoUrl,
    thumb: item.thumbnail,
  }));
}

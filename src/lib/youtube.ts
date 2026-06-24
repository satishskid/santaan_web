import type { SocialItem } from '@/components/sections/SocialCarousel';
import type { VideoTestimonialItem } from '@/components/sections/VideoTestimonials';

const DEFAULT_SANTAAN_CHANNEL_ID = 'UCWzGAaPiWAguNtXlSiYJNLg';
const DEFAULT_SANTAAN_CHANNEL_HANDLE = 'santaan7688';

function decodeXml(value: string) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function decodeYouTubeValue(value: string) {
  try {
    return JSON.parse(`"${value.replace(/"/g, '\\"')}"`);
  } catch {
    return value.replace(/\\u0026/g, '&');
  }
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

function itemFromVideoId({
  videoId,
  title,
  label,
  quote,
  isShort = false,
}: {
  videoId: string;
  title: string;
  label: string;
  quote?: string;
  isShort?: boolean;
}): VideoTestimonialItem | null {
  const cleanTitle = stripEmoji(decodeYouTubeValue(title));
  if (!videoId || !cleanTitle) return null;

  return {
    name: cleanTitle,
    label,
    quote: quote || 'Watch the latest Santaan fertility video.',
    videoUrl: isShort ? `https://www.youtube.com/shorts/${videoId}` : `https://www.youtube.com/watch?v=${videoId}`,
    thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
  };
}

async function getLatestVideosFromRss(limit: number, channelId: string): Promise<VideoTestimonialItem[]> {
  const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;

  const response = await fetch(feedUrl, {
    next: { revalidate: 60 * 60 * 6 },
    headers: { 'user-agent': 'Mozilla/5.0 SantaanWebsite/1.0' },
  });
  if (!response.ok) return [];

  const xml = await response.text();
  const entries = [...xml.matchAll(/<entry>[\s\S]*?<\/entry>/g)].slice(0, limit);

  const videos: VideoTestimonialItem[] = [];

  entries.forEach((match) => {
    const entry = match[0];
    const videoId = tagValue(entry, 'yt:videoId');
    const title = tagValue(entry, 'title');
    const published = tagValue(entry, 'published');
    const description = compactDescription(htmlToText(tagValue(entry, 'media:description')));

    const item = itemFromVideoId({
      videoId,
      title,
      label: formatPublishedDate(published),
      quote: description,
    });

    if (item) videos.push(item);
  });

  return videos;
}

function cleanShortsTitle(accessibilityText: string) {
  return accessibilityText
    .replace(/,\s*(?:[\d,.]+|No)\s+views?\s+[–-]\s+play Short$/i, '')
    .replace(/,\s*play Short$/i, '')
    .trim();
}

function dedupeVideos(items: VideoTestimonialItem[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.videoUrl;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function getLatestVideosFromChannelPage(limit: number, handle: string): Promise<VideoTestimonialItem[]> {
  const headers = { 'user-agent': 'Mozilla/5.0 SantaanWebsite/1.0' };
  const [shortsResponse, videosResponse] = await Promise.all([
    fetch(`https://www.youtube.com/@${handle}/shorts`, { next: { revalidate: 60 * 60 * 6 }, headers }),
    fetch(`https://www.youtube.com/@${handle}/videos`, { next: { revalidate: 60 * 60 * 6 }, headers }),
  ]);

  const items: VideoTestimonialItem[] = [];

  if (shortsResponse.ok) {
    const html = await shortsResponse.text();
    const shortsPattern = /entityId":"shorts-shelf-item-([^"]+)","accessibilityText":"([^"]+)"/g;

    for (const match of html.matchAll(shortsPattern)) {
      const item = itemFromVideoId({
        videoId: match[1],
        title: cleanShortsTitle(decodeYouTubeValue(match[2])),
        label: 'Latest Santaan Short',
        isShort: true,
      });
      if (item) items.push(item);
      if (items.length >= limit) break;
    }
  }

  if (items.length < limit && videosResponse.ok) {
    const html = await videosResponse.text();
    const videosPattern =
      /"videoId":"([^"]+)"[\s\S]{0,6000}?"lockupMetadataViewModel":\{"title":\{"content":"([^"]+)"\},"metadata":\{"contentMetadataViewModel":\{"metadataRows":\[\{"metadataParts":\[\{"text":\{"content":"([^"]+)"\}\},\{"text":\{"content":"([^"]+)"/g;

    for (const match of html.matchAll(videosPattern)) {
      const item = itemFromVideoId({
        videoId: match[1],
        title: match[2],
        label: `Santaan YouTube · ${decodeYouTubeValue(match[4])}`,
        quote: `${decodeYouTubeValue(match[3])} on YouTube.`,
      });
      if (item) items.push(item);
      if (items.length >= limit * 2) break;
    }
  }

  return dedupeVideos(items).slice(0, limit);
}

export async function getLatestSantaanYouTubeVideos(limit = 4): Promise<VideoTestimonialItem[]> {
  const channelId = process.env.SANTAAN_YOUTUBE_CHANNEL_ID || DEFAULT_SANTAAN_CHANNEL_ID;
  const handle = process.env.SANTAAN_YOUTUBE_HANDLE || DEFAULT_SANTAAN_CHANNEL_HANDLE;

  try {
    const rssItems = await getLatestVideosFromRss(limit, channelId);
    if (rssItems.length > 0) return rssItems;

    return await getLatestVideosFromChannelPage(limit, handle);
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

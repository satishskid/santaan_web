import { NextResponse } from 'next/server';
import { getLatestSantaanYouTubeVideos, youtubeVideosToSocialItems } from '@/lib/youtube';

export async function GET() {
  const videos = await getLatestSantaanYouTubeVideos(4);

  return NextResponse.json(
    {
      videos,
      socialItems: youtubeVideosToSocialItems(videos),
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=21600, stale-while-revalidate=86400',
      },
    },
  );
}

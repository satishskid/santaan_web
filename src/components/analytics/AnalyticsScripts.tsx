
import Script from "next/script";
import { db } from "@/lib/db";
import { settings } from "@/db/schema";

export default async function AnalyticsScripts() {
    let analyticsSettings: Record<string, string> = {};

    try {
        const allSettings = await db.select().from(settings);
        analyticsSettings = allSettings.reduce((acc: Record<string, string>, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, string>);
    } catch (error) {
        // Fallback or ignore if DB not ready
        console.warn("Failed to load analytics settings", error);
    }

    const gaId = analyticsSettings['google_analytics_id'];
    const fbPixelId = analyticsSettings['facebook_pixel_id'];

    return (
        <>
            {gaId && (
                <>
                    <Script
                        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
                        strategy="afterInteractive"
                    />
                    <Script id="google-analytics" strategy="afterInteractive">
                        {`
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', '${gaId}');
                        `}
                    </Script>
                </>
            )}

            {fbPixelId && (
                <Script id="facebook-pixel" strategy="afterInteractive">
                    {`
                    !function(f,b,e,v,n,t,s)
                    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                    n.queue=[];t=b.createElement(e);t.async=!0;
                    t.src=v;s=b.getElementsByTagName(e)[0];
                    s.parentNode.insertBefore(t,s)}(window, document,'script',
                    'https://connect.facebook.net/en_US/fbevents.js');
                    fbq('init', '${fbPixelId}');
                    fbq('track', 'PageView');
                    `}
                </Script>
            )}
        </>
    );
}

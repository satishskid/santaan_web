"use client";

import { motion } from 'framer-motion';
import { Bell, Trophy, Calendar, Megaphone, ExternalLink, Loader2, Newspaper } from 'lucide-react';
import { useState, useEffect } from 'react';

interface MediumPost {
    title: string;
    pubDate: string;
    link: string;
    guid: string;
    author: string;
    thumbnail: string;
    description: string;
    content: string;
    categories: string[];
}

// Map category keywords to icons and colors
const getCategoryStyle = (categories: string[]) => {
    const cats = categories.map(c => c.toLowerCase());
    
    if (cats.some(c => c.includes('award') || c.includes('recognition'))) {
        return { icon: Trophy, color: 'bg-amber-500/10 text-amber-600 border-amber-200', type: 'award' };
    }
    if (cats.some(c => c.includes('event') || c.includes('seminar') || c.includes('workshop'))) {
        return { icon: Calendar, color: 'bg-purple-500/10 text-purple-600 border-purple-200', type: 'event' };
    }
    if (cats.some(c => c.includes('campaign') || c.includes('offer') || c.includes('launch'))) {
        return { icon: Megaphone, color: 'bg-green-500/10 text-green-600 border-green-200', type: 'campaign' };
    }
    // Default: news
    return { icon: Newspaper, color: 'bg-blue-500/10 text-blue-600 border-blue-200', type: 'news' };
};

// Helper to extract text snippet from HTML
const getSnippet = (htmlContent: string, maxLength: number = 120) => {
    if (typeof window === 'undefined') return '';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    const text = tempDiv.textContent || tempDiv.innerText || "";
    return text.slice(0, maxLength) + (text.length > maxLength ? "..." : "");
};

// Helper to format date
const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
};

export function NewsAnnouncements() {
    const [posts, setPosts] = useState<MediumPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const response = await fetch(
                    'https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@santaanIVF'
                );
                const data = await response.json();

                if (data.status === 'ok') {
                    // Filter posts that have 'santaan-news' or 'announcement' tag
                    const newsPosts = data.items.filter((post: MediumPost) => 
                        post.categories.some((cat: string) => 
                            cat.toLowerCase().includes('santaan-news') || 
                            cat.toLowerCase().includes('announcement')
                        )
                    );
                    setPosts(newsPosts.slice(0, 4)); // Show max 4 news items
                }
            } catch (error) {
                console.error('Failed to fetch news from Medium:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchNews();
    }, []);

    // Don't render if no news posts
    if (!isLoading && posts.length === 0) {
        return null;
    }

    return (
        <section className="py-16 bg-gradient-to-b from-santaan-cream to-white relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-santaan-teal/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-santaan-amber/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

            <div className="container px-4 md:px-6 mx-auto relative z-10">
                <div className="text-center mb-10">
                    <span className="text-santaan-teal font-medium tracking-wide uppercase text-sm flex items-center justify-center gap-2">
                        <Bell className="w-4 h-4" />
                        What&apos;s New
                    </span>
                    <h2 className="text-3xl md:text-4xl font-playfair font-bold mt-2 text-gray-900">
                        News & Announcements
                    </h2>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-santaan-teal" />
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
                        {posts.map((post, i) => {
                            const { icon: IconComponent, color, type } = getCategoryStyle(post.categories);
                            
                            return (
                                <motion.a
                                    key={post.guid}
                                    href={post.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="group bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-lg hover:border-santaan-teal/20 transition-all"
                                >
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border ${color}`}>
                                            <IconComponent className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${color}`}>
                                                {type}
                                            </span>
                                            <span className="text-xs text-gray-400 ml-2">
                                                {formatDate(post.pubDate)}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-santaan-teal transition-colors">
                                        {post.title}
                                    </h3>
                                    
                                    <p className="text-gray-500 text-sm line-clamp-2 mb-3">
                                        {getSnippet(post.description || post.content, 100)}
                                    </p>
                                    
                                    <span className="inline-flex items-center gap-1 text-santaan-teal text-sm font-medium group-hover:gap-2 transition-all">
                                        Read More
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </span>
                                </motion.a>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}

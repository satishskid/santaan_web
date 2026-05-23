"use client";

import { motion } from 'framer-motion';
import { Bell, Trophy, Calendar, Megaphone, ExternalLink, Loader2, Newspaper } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface SantaanPost {
    slug: string;
    title: string;
    publishedAt: string;
    excerpt: string;
    tags: string[];
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
    const [posts, setPosts] = useState<SantaanPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const response = await fetch('/api/blogs?type=news&limit=3');
                const data = await response.json();

                if (response.ok && Array.isArray(data.posts)) {
                    setPosts(data.posts);
                }
            } catch (error) {
                console.error('Failed to fetch Santaan news updates:', error);
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
        <section className="py-14 bg-gradient-to-b from-santaan-cream to-white relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-santaan-teal/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-santaan-amber/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

            <div className="container px-4 md:px-6 mx-auto relative z-10">
                <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                    <span className="text-santaan-teal font-medium tracking-wide uppercase text-sm flex items-center gap-2">
                        <Bell className="w-4 h-4" />
                        Clinic updates
                    </span>
                    <h2 className="text-3xl md:text-4xl font-playfair font-bold mt-2 text-gray-900">
                        Recent updates from Santaan
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-600">
                        Keep this section light: seminars, awards, launches, and announcements. The deeper archive can stay available for SEO without crowding the homepage.
                    </p>
                    </div>
                    <Link
                        href="/fertility-insights"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-santaan-teal hover:text-santaan-amber transition-colors"
                    >
                        View all updates
                        <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-santaan-teal" />
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {posts.map((post, i) => {
                            const { icon: IconComponent, color, type } = getCategoryStyle(post.tags);
                            
                            return (
                                <motion.div
                                    key={post.slug}
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
                                                {formatDate(post.publishedAt)}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-santaan-teal transition-colors">
                                        {post.title}
                                    </h3>
                                    
                                    <p className="text-gray-500 text-sm line-clamp-2 mb-3">
                                        {post.excerpt}
                                    </p>
                                    
                                    <Link href={`/fertility-insights/${post.slug}`} className="inline-flex items-center gap-1 text-santaan-teal text-sm font-medium group-hover:gap-2 transition-all">
                                        Read update
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}

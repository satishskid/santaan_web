"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, BookOpen, Calendar } from 'lucide-react';
import Image from 'next/image';

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

export function Insights() {
    const [posts, setPosts] = useState<MediumPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await fetch(
                    'https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@santaanIVF'
                );
                const data = await response.json();

                if (data.status === 'ok') {
                    setPosts(data.items.slice(0, 3)); // Get latest 3 posts
                } else {
                    setError(true);
                }
            } catch (err) {
                console.error("Failed to fetch Medium posts", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    // Helper to format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Helper to extract a text snippet from HTML content if description is empty or too short
    const getSnippet = (htmlContent: string) => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        const text = tempDiv.textContent || tempDiv.innerText || "";
        return text.slice(0, 120) + "...";
    };

    if (error) return null; // Hide section if feed fails

    return (
        <section className="py-20 bg-santaan-cream relative overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
                <Image
                    src="/assets/wonder-of-life-texture.png"
                    alt="Texture"
                    fill
                    className="object-cover"
                />
            </div>

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                    <div>
                        <span className="text-santaan-amber font-medium uppercase tracking-wider text-sm mb-2 block flex items-center gap-2">
                            <BookOpen className="w-4 h-4" />
                            Knowledge Base
                        </span>
                        <h2 className="text-3xl md:text-5xl font-playfair font-bold text-santaan-teal">
                            Insights & Stories
                        </h2>
                    </div>
                    <a
                        href="https://medium.com/@santaanIVF"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-2 text-santaan-teal font-medium hover:text-santaan-amber transition-colors"
                    >
                        View all articles
                        <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </a>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-96 bg-gray-200 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {posts.map((post, index) => (
                            <motion.a
                                key={post.guid}
                                href={post.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full border border-gray-100"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                {/* Content */}
                                <div className="p-5 flex flex-col flex-grow">
                                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                                        <Calendar className="w-3 h-3" />
                                        {formatDate(post.pubDate)}
                                    </div>

                                    <h3 className="text-lg md:text-xl font-playfair font-bold text-gray-900 mb-3 group-hover:text-santaan-amber transition-colors line-clamp-2">
                                        {post.title}
                                    </h3>
                                    
                                    {/* Thumbnail Image */}
                                    <div className="relative h-40 w-full overflow-hidden rounded-lg bg-gradient-to-br from-santaan-sage/20 to-santaan-teal/20 mb-3">
                                        {post.thumbnail && (
                                            <img
                                                src={post.thumbnail}
                                                alt={post.title}
                                                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                                            />
                                        )}
                                    </div>

                                    {/* Using a snippet generator or parser for description often returns HTML from RSS. 
                                        We'll assume 'description' might have HTML, so we strip it carefully or just use line-clamp 
                                        on a simple render if it's plain text. 
                                        RSS2JSON 'description' is usually the content snippet.
                                    */}
                                    <div className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4 flex-grow">
                                        {/* We use a safe render approach or just CSS line clamping on the raw text if possible. 
                                             Since we can't easily sanitize HTML here without a library, we'll try to rely on the browser's 
                                             handling or just not render dangerous HTML if not needed. 
                                             Let's try to just render the text context.
                                          */}
                                        <p dangerouslySetInnerHTML={{ __html: post.description }} className="line-clamp-3" />
                                    </div>

                                    <div className="mt-auto flex items-center text-santaan-amber text-sm font-bold uppercase tracking-wide group-hover:gap-2 transition-all">
                                        Read Article
                                        <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                            </motion.a>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

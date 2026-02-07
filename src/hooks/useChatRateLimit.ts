
import { useState, useCallback } from 'react';

const MAX_REQUESTS_PER_HOUR = 15;
const BLOCK_DURATION_MS = 60 * 60 * 1000; // 1 Hour

interface RateLimitStatus {
    isBlocked: boolean;
    remainingRequests: number;
    resetTime?: number;
}

export const useChatRateLimit = () => {
    const [status, setStatus] = useState<RateLimitStatus>({
        isBlocked: false,
        remainingRequests: MAX_REQUESTS_PER_HOUR
    });

    const checkRateLimit = useCallback((): boolean => {
        const now = Date.now();
        const storedData = localStorage.getItem('santaan_chat_usage');

        if (!storedData) {
            localStorage.setItem('santaan_chat_usage', JSON.stringify({
                count: 1,
                startTime: now
            }));
            setStatus({ isBlocked: false, remainingRequests: MAX_REQUESTS_PER_HOUR - 1 });
            return true;
        }

        const { count, startTime } = JSON.parse(storedData);

        // Reset if window has passed
        if (now - startTime > BLOCK_DURATION_MS) {
            localStorage.setItem('santaan_chat_usage', JSON.stringify({
                count: 1,
                startTime: now
            }));
            setStatus({ isBlocked: false, remainingRequests: MAX_REQUESTS_PER_HOUR - 1 });
            return true;
        }

        // Check limit
        if (count >= MAX_REQUESTS_PER_HOUR) {
            setStatus({
                isBlocked: true,
                remainingRequests: 0,
                resetTime: startTime + BLOCK_DURATION_MS
            });
            return false;
        }

        // Increment
        localStorage.setItem('santaan_chat_usage', JSON.stringify({
            count: count + 1,
            startTime
        }));
        setStatus({
            isBlocked: false,
            remainingRequests: MAX_REQUESTS_PER_HOUR - (count + 1)
        });
        return true;

    }, []);

    return { checkRateLimit, status };
};

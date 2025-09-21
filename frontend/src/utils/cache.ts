/**
 * Cache utility for vocabulary data
 */

export interface CacheItem<T> {
    data: T;
    timestamp: number;
    ttl?: number; // Time to live in milliseconds
}

export class VocabularyCache {
    private static readonly CACHE_KEYS = {
        NOTE_TYPES: 'noteTypes',
    } as const;

    private static readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

    /**
     * Get cached data with TTL check
     */
    static get<T>(key: string): T | null {
        try {
            const cached = localStorage.getItem(key);
            if (!cached) return null;

            const cacheItem: CacheItem<T> = JSON.parse(cached);
            
            // Check TTL
            if (cacheItem.ttl && Date.now() - cacheItem.timestamp > cacheItem.ttl) {
                this.remove(key);
                return null;
            }

            return cacheItem.data;
        } catch (error) {
            this.remove(key);
            return null;
        }
    }

    /**
     * Set cached data with optional TTL
     */
    static set<T>(key: string, data: T, ttl?: number): void {
        try {
            const cacheItem: CacheItem<T> = {
                data,
                timestamp: Date.now(),
                ttl: ttl || this.DEFAULT_TTL,
            };
            localStorage.setItem(key, JSON.stringify(cacheItem));
        } catch (error) {
            // Silently fail if cache cannot be set
        }
    }

    /**
     * Remove cached data
     */
    static remove(key: string): void {
        localStorage.removeItem(key);
    }

    /**
     * Clear all vocabulary cache
     */
    static clearAll(): void {
        Object.values(this.CACHE_KEYS).forEach(key => {
            this.remove(key);
        });
    }

    /**
     * Get note types from cache
     */
    static getNoteTypes() {
        return this.get(this.CACHE_KEYS.NOTE_TYPES);
    }

    /**
     * Set note types to cache
     */
    static setNoteTypes(data: any) {
        this.set(this.CACHE_KEYS.NOTE_TYPES, data);
    }


    /**
     * Check if cache is valid (not expired)
     */
    static isValid(key: string): boolean {
        try {
            const cached = localStorage.getItem(key);
            if (!cached) return false;

            const cacheItem: CacheItem<any> = JSON.parse(cached);
            return !cacheItem.ttl || Date.now() - cacheItem.timestamp <= cacheItem.ttl;
        } catch {
            return false;
        }
    }
}

// Expose globally for debugging
if (typeof window !== 'undefined') {
    (window as any).VocabularyCache = VocabularyCache;
}

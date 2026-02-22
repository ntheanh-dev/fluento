package com.nta.common.constant;

/**
 * Constants for AI chat client caches (API cache and ChatClient cache).
 */
public final class ChatCacheConstants {

    /** Maximum number of cached API instances (roughly per user). */
    public static final int API_CACHE_MAX_SIZE = 200;

    /** Maximum number of cached ChatClient instances (API_CACHE_MAX_SIZE × max models per user). */
    public static final int CLIENT_CACHE_MAX_SIZE = API_CACHE_MAX_SIZE * 3;

    /** Cache expiry: expire entry after this many minutes without access. */
    public static final int CACHE_EXPIRE_AFTER_ACCESS_MINUTES = 30;

    private ChatCacheConstants() {}
}

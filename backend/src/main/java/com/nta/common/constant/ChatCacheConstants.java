package com.nta.common.constant;

/**
 * Constants for AI chat client caches (API cache and ChatClient cache).
 */
public final class ChatCacheConstants {

    public static final int API_CACHE_MAX_SIZE = 200;
    public static final int CLIENT_CACHE_MAX_SIZE = API_CACHE_MAX_SIZE * 3;
    public static final int CACHE_EXPIRE_AFTER_ACCESS_MINUTES = 30;
    public static final int MAX_INPUT_TOKENS = 2000; // Max tokens for system + user messages to leave room for response

    private ChatCacheConstants() {}
}

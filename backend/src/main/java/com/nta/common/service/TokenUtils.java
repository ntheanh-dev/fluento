package com.nta.common.service;

import com.knuddels.jtokkit.Encodings;
import com.knuddels.jtokkit.api.Encoding;
import com.knuddels.jtokkit.api.ModelType;

public class TokenUtils {

    private static final Encoding encoding =
            Encodings.newDefaultEncodingRegistry().getEncodingForModel(ModelType.GPT_4);

    public static int countTokens(String text) {
        return encoding.countTokens(text);
    }
}

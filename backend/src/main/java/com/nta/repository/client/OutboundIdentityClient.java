package com.nta.repository.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;

import com.nta.dto.request.GoogleExchangeTokenRq;
import com.nta.dto.response.GoogleExchangeTokenRp;

import feign.QueryMap;

@FeignClient(name = "outboundIdentityClient", url = "${spring.security.client.provider.google.api-uri}")
public interface OutboundIdentityClient {
    @PostMapping(value = "/token", produces = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    GoogleExchangeTokenRp googleExchangeToken(@QueryMap GoogleExchangeTokenRq request);
}

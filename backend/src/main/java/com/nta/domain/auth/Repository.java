package com.nta.domain.auth;

import org.springframework.data.jpa.repository.JpaRepository;

@org.springframework.stereotype.Repository("invalidatedTokenRepository")
public interface Repository extends JpaRepository<InvalidatedToken, String> {}

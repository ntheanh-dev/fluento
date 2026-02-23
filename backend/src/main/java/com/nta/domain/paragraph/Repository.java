package com.nta.domain.paragraph;

import org.springframework.data.jpa.repository.JpaRepository;

@org.springframework.stereotype.Repository("paragraphRepository")
public interface Repository extends JpaRepository<Paragraph, Long> {}

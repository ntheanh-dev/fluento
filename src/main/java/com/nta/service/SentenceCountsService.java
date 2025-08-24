package com.nta.service;

import com.nta.entity.SentenceCount;
import com.nta.repository.SentenceCountRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SentenceCountsService {
    private final SentenceCountRepository sentenceCountRepository;

    public List<SentenceCount> findAll() {
        return sentenceCountRepository.findAll();
    }
}

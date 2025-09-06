package com.nta.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.nta.entity.SentenceCount;
import com.nta.repository.SentenceCountRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SentenceCountsService {
    private final SentenceCountRepository sentenceCountRepository;

    public List<SentenceCount> findAll() {
        return sentenceCountRepository.findAll();
    }
}

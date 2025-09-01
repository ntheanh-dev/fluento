package com.nta.service;

import com.nta.entity.Tone;
import com.nta.repository.ToneRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ToneService {
    private final ToneRepository toneRepository;

    public List<Tone> findAll() {
        return toneRepository.findAll();
    }
}



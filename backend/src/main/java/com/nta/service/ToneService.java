package com.nta.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.nta.entity.Tone;
import com.nta.repository.ToneRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ToneService {
    private final ToneRepository toneRepository;

    public List<Tone> findAll() {
        return toneRepository.findAll();
    }
}

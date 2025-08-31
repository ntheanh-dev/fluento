package com.nta.service;

import com.nta.entity.Level;
import com.nta.repository.LevelRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LevelService {
    private final LevelRepository levelRepository;

    public List<Level> findAll() {
        return levelRepository.findAll();
    }
}

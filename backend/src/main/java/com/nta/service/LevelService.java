package com.nta.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.nta.entity.Level;
import com.nta.repository.LevelRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LevelService {
    private final LevelRepository levelRepository;

    public List<Level> findAll() {
        return levelRepository.findAll();
    }
}

package com.nta.service;

import com.nta.entity.TopicGroup;
import com.nta.repository.TopicGroupRepository;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TopicService {

    TopicGroupRepository topicGroupRepository;

    public List<TopicGroup> getAllTopicByGroup() {
        return topicGroupRepository.findAll();
    }
}

package com.nta.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.nta.entity.TopicGroup;
import com.nta.repository.TopicGroupRepository;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TopicService {

    TopicGroupRepository topicGroupRepository;

    public List<TopicGroup> getAllTopicByGroup() {
        return topicGroupRepository.findAll();
    }
}

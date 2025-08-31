package com.nta.repository;

import com.nta.entity.TopicGroup;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TopicGroupRepository extends JpaRepository<TopicGroup, Long> {}

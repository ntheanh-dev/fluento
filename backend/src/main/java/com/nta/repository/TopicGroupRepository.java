package com.nta.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.nta.entity.TopicGroup;

@Repository
public interface TopicGroupRepository extends JpaRepository<TopicGroup, Long> {}

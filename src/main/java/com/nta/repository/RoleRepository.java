package com.nta.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.nta.entity.Role;

public interface RoleRepository extends JpaRepository<Role, String> {}

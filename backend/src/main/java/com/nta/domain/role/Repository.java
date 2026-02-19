package com.nta.domain.role;

import org.springframework.data.jpa.repository.JpaRepository;

@org.springframework.stereotype.Repository("roleRepository")
public interface Repository extends JpaRepository<Role, String> {
    Role findByName(String name);
}

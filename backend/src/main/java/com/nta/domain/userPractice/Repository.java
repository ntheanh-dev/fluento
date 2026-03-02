package com.nta.domain.userPractice;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.nta.domain.userPractice.projection.PracticeSubmitProjection;

@org.springframework.stereotype.Repository("userPracticeRepository")
public interface Repository extends JpaRepository<UserPractice, Long> {
    Optional<UserPractice> findByIdAndUserId(Long id, Long userId);

    List<UserPractice> findByUserId(Long userId);

    @Query(
            "select p.user.id as userId, p.paragraph.content as paragraphContent from UserPractice p where p.id = :practiceId")
    Optional<PracticeSubmitProjection> findSubmitData(Long practiceId);
}

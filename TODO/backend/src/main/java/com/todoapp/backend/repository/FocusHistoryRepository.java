package com.todoapp.backend.repository;

import com.todoapp.backend.model.FocusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.time.LocalDateTime;

@Repository
public interface FocusHistoryRepository extends JpaRepository<FocusHistory, Long> {
    List<FocusHistory> findByUserId(Long userId);
    List<FocusHistory> findByUserIdAndStartTimeBetween(Long userId, LocalDateTime startDate, LocalDateTime endDate);
}